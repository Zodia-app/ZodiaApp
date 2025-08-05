// src/services/palmReadingService.ts

import { supabase } from '../lib/supabase';
import { PalmReadingPrompts, PalmReadingContext } from './palmReadingPrompts';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface PalmReadingRequest {
  userId: string;
  userName: string;
  imageUri: string;
  handedness: 'left' | 'right';
  dateOfBirth?: string;
  gender?: string;
  relationshipStatus?: string;
  readingType: 'quick' | 'detailed' | 'compatibility';
  partnerName?: string; // For compatibility readings
}

export interface PalmReadingResult {
  id: string;
  userId: string;
  readingType: string;
  content: string;
  formattedContent?: {
    title: string;
    sections: Array<{
      heading: string;
      content: string;
      icon?: string;
    }>;
    summary: string;
  };
  imageUrl?: string;
  confidence: number;
  createdAt: string;
  processingTime: number;
}

export class PalmReadingService {
  /**
   * Process a palm reading request
   */
  static async generateReading(request: PalmReadingRequest): Promise<PalmReadingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Validate and process the image
      const processedImage = await this.processImage(request.imageUri);
      
      // Step 2: Upload image to Supabase Storage
      const imageUrl = await this.uploadImage(processedImage, request.userId);
      
      // Step 3: Analyze image quality and features
      const imageAnalysis = await this.analyzeImageQuality(processedImage);
      
      // Step 4: Create reading record in database
      const readingRecord = await this.createReadingRecord({
        ...request,
        imageUrl,
        status: 'processing'
      });
      
      // Step 5: Generate AI reading via Edge Function
      const reading = await this.callAIService({
        ...request,
        imageUrl,
        imageAnalysis
      });
      
      // Step 6: Format and store the reading
      const formattedReading = PalmReadingPrompts.formatReading(reading);
      
      // Step 7: Update reading record with results
      const result = await this.updateReadingRecord(readingRecord.id, {
        content: reading,
        formattedContent: formattedReading,
        status: 'completed',
        confidence: imageAnalysis.confidence,
        processingTime: Date.now() - startTime
      });
      
      return result;
      
    } catch (error) {
      console.error('Palm reading generation failed:', error);
      throw new Error(`Failed to generate palm reading: ${error.message}`);
    }
  }

  /**
   * Process and optimize the palm image
   */
  private static async processImage(imageUri: string): Promise<string> {
    try {
      // Resize and compress image for optimal processing
      const manipulatedImage = await manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } }, // Resize to max width of 1024px
          { rotate: 0 } // Ensure proper orientation
        ],
        { 
          compress: 0.8, 
          format: SaveFormat.JPEG 
        }
      );
      
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error('Failed to process palm image');
    }
  }

  /**
   * Upload processed image to Supabase Storage
   */
  private static async uploadImage(imageUri: string, userId: string): Promise<string> {
    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Generate unique filename
      const filename = `${userId}/palm_${Date.now()}.jpg`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('palm-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('palm-images')
        .getPublicUrl(filename);
      
      return publicUrl;
      
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload palm image');
    }
  }

  /**
   * Analyze image quality and detect palm features
   */
  private static async analyzeImageQuality(imageUri: string): Promise<{
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
    confidence: number;
    handType?: 'earth' | 'air' | 'water' | 'fire' | 'mixed';
    palmSize?: 'large' | 'medium' | 'small';
  }> {
    // In a production app, this would use computer vision
    // For now, we'll simulate the analysis
    
    // This could integrate with a service like Google Vision API
    // or a custom ML model for palm detection
    
    return {
      clarity: 'good',
      confidence: 0.85,
      handType: 'air',
      palmSize: 'medium'
    };
  }

  /**
   * Create initial reading record in database
   */
  private static async createReadingRecord(data: any): Promise<any> {
    const { data: reading, error } = await supabase
      .from('readings')
      .insert({
        user_id: data.userId,
        reading_type: 'palm',  // Changed from 'type'
        subtype: data.readingType,
        status: data.status,
        metadata: {
          handedness: data.handedness,
          imageUrl: data.imageUrl,
          userName: data.userName,
          relationshipStatus: data.relationshipStatus
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return reading;
  }

  /**
   * Call AI service via Supabase Edge Function
   */
  private static async callAIService(data: any): Promise<string> {
    try {
      // Prepare context for prompt
      const context: PalmReadingContext = {
        userName: data.userName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        handedness: data.handedness,
        relationshipStatus: data.relationshipStatus,
        imageAnalysis: data.imageAnalysis
      };
      
      // Select appropriate prompt based on reading type
      let prompt: string;
      switch (data.readingType) {
        case 'quick':
          prompt = PalmReadingPrompts.getQuickReadingPrompt(context);
          break;
        case 'compatibility':
          prompt = PalmReadingPrompts.getCompatibilityPrompt(context, data.partnerName);
          break;
        default:
          prompt = PalmReadingPrompts.getReadingPrompt(context);
      }
      
      // Call Supabase Edge Function
      const { data: result, error } = await supabase.functions.invoke('generate-palm-reading', {
        body: {
          systemPrompt: PalmReadingPrompts.getSystemPrompt(),
          userPrompt: prompt,
          imageUrl: data.imageUrl,
          imageAnalysisPrompt: PalmReadingPrompts.getImageAnalysisPrompt()
        }
      });
      
      if (error) throw error;
      
      return result.reading;
      
    } catch (error) {
      console.error('AI service call failed:', error);
      
      // Fallback to mock reading for development
      if (__DEV__) {
        return this.getMockReading(data);
      }
      
      throw new Error('Failed to generate AI reading');
    }
  }

  /**
   * Update reading record with results
   */
  private static async updateReadingRecord(
    readingId: string, 
    updates: any
  ): Promise<PalmReadingResult> {
    const { data, error } = await supabase
      .from('readings')
      .update({
        content: updates.content,
        formatted_content: updates.formattedContent,
        status: updates.status,
        confidence: updates.confidence,
        processing_time: updates.processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', readingId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      readingType: data.subtype,
      content: data.content,
      formattedContent: data.formatted_content,
      imageUrl: data.metadata?.imageUrl,
      confidence: data.confidence,
      createdAt: data.created_at,
      processingTime: data.processing_time
    };
  }

  /**
   * Get user's palm reading history
   */
  static async getReadingHistory(userId: string): Promise<PalmReadingResult[]> {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('user_id', userId)
      .eq('reading_type', 'palm')  // FIXED: Changed from 'type' to 'reading_type'
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(reading => ({
      id: reading.id,
      userId: reading.user_id,
      readingType: reading.subtype,
      content: reading.content,
      formattedContent: reading.formatted_content,
      imageUrl: reading.metadata?.imageUrl,
      confidence: reading.confidence,
      createdAt: reading.created_at,
      processingTime: reading.processing_time
    }));
  }

  /**
   * Mock reading for development
   */
  private static getMockReading(data: any): string {
    return `**Mystical Greeting**
Dear ${data.userName}, your ${data.handedness} palm reveals a fascinating journey written in the lines of your hand.

**The Major Lines**
Your Life Line shows remarkable vitality and strength. It curves gracefully around your thumb, indicating a zest for life and natural resilience. The depth suggests you have strong life force energy that helps you overcome challenges.

Your Heart Line speaks of deep emotional intelligence. Starting between your first and second fingers, it shows you balance logic with emotion beautifully. You have the capacity for profound connections while maintaining healthy boundaries.

Your Head Line reveals a brilliant mind that thinks both creatively and analytically. The slight downward curve indicates strong intuition alongside your logical capabilities.

**Love & Relationships**
Your palm shows you are destined for meaningful connections. The formation of your Heart Line suggests you love deeply but wisely. You seek partners who can match your intellectual depth and emotional intelligence.

**Career & Success**
The prominence of your Jupiter mount indicates natural leadership abilities. Combined with your strong Fate Line, success is written in your palm - particularly in fields where you can use both creativity and strategy.

**Future Insights**
The coming months hold special significance for you. Your palm suggests a period of transformation and growth approaching. New opportunities in both love and career are indicated, particularly around the autumn season.

**Personalized Guidance**
Your palm energy resonates strongly with amethyst and moonstone. Wearing these crystals or keeping them nearby will amplify your natural intuitive abilities. The color purple will be particularly fortunate for you.

May the wisdom of your palm guide you toward your highest path, ${data.userName}. Trust in the journey that your hands reveal. ✨`;
  }
}