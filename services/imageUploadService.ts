import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'palm-images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly VALID_FORMATS = ['jpg', 'jpeg', 'png', 'heic', 'heif'];

  /**
   * Upload palm image to Supabase storage
   */
  static async uploadPalmImage(
    userId: string,
    imageUri: string,
    imageBase64?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate image format
      if (!this.validateImageFormat(imageUri)) {
        return { 
          success: false, 
          error: 'Invalid image format. Please use JPG, PNG, or HEIC.' 
        };
      }

      // Validate file size
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.size && fileInfo.size > this.MAX_FILE_SIZE) {
        return { 
          success: false, 
          error: 'Image size must be less than 5MB' 
        };
      }

      // Report initial progress
      onProgress?.({ loaded: 0, total: 100, percentage: 0 });

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${userId}/palm_${timestamp}.jpg`;

      // Convert to blob
      let blob: Blob;
      if (imageBase64) {
        // Convert base64 to blob
        const byteCharacters = atob(imageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: 'image/jpeg' });
        
        onProgress?.({ loaded: 30, total: 100, percentage: 30 });
      } else {
        // Fetch image and convert to blob
        const response = await fetch(imageUri);
        blob = await response.blob();
        
        onProgress?.({ loaded: 30, total: 100, percentage: 30 });
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '3600'
        });

      onProgress?.({ loaded: 80, total: 100, percentage: 80 });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      onProgress?.({ loaded: 100, total: 100, percentage: 100 });

      return { 
        success: true, 
        url: urlData.publicUrl 
      };

    } catch (error) {
      console.error('Upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      };
    }
  }

  /**
   * Delete palm image from storage
   */
  static async deletePalmImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      return !error;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  /**
   * Validate image format
   */
  static validateImageFormat(uri: string): boolean {
    const extension = uri.split('.').pop()?.toLowerCase();
    return this.VALID_FORMATS.includes(extension || '');
  }

  /**
   * Compress image if needed
   */
  static async compressImage(imageUri: string): Promise<string> {
    // Implementation depends on expo-image-manipulator if needed
    // For now, return original URI
    return imageUri;
  }

  /**
   * Generate thumbnail for preview
   */
  static async generateThumbnail(imageUri: string): Promise<string> {
    // Could use expo-image-manipulator to resize
    // For now, return original URI
    return imageUri;
  }
}