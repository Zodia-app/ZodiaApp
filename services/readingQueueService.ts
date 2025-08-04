// services/readingQueueService.ts

import { supabase } from '../lib/supabase';

export interface ReadingQueueItem {
  id: string;
  user_id: string;
  reading_type: 'astrology_teaser' | 'astrology_full' | 'palm_teaser' | 'palm_full' | 'clairvoyance';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  input_data: any;
  scheduled_completion_at: string;
  created_at: string;
}

// Helper function to generate a valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Store mock readings in memory for testing
const mockReadings: { [key: string]: ReadingQueueItem } = {};

export async function queueReading(
  userId: string,
  readingType: string,
  inputData: any,
  isPaid: boolean = false
): Promise<ReadingQueueItem> {
  try {
    // Validate or convert userId to proper UUID format
    let validUserId = userId;
    
    // If it's a test user ID or invalid UUID, generate a new one
    if (!isValidUUID(userId) || userId.startsWith('test-')) {
      validUserId = generateUUID();
      console.log('Generated new UUID for test user:', validUserId);
    }

    // Calculate artificial delay (2-3 hours for free, 1 hour for paid)
    // For testing, use shorter delays: 2 minutes
    const delayMinutes = isPaid ? 1 : 2; // 2 minutes for testing
    const scheduledCompletion = new Date();
    scheduledCompletion.setMinutes(scheduledCompletion.getMinutes() + delayMinutes);

    // Create the reading queue item
    const queueItem: ReadingQueueItem = {
      id: generateUUID(),
      user_id: validUserId,
      reading_type: readingType as any,
      status: 'queued',
      priority: isPaid ? 1 : 0,
      input_data: inputData || {},
      scheduled_completion_at: scheduledCompletion.toISOString(),
      created_at: new Date().toISOString()
    };

    // Store in mock database
    mockReadings[queueItem.id] = queueItem;
    console.log('Reading queued:', queueItem);

    // Try to insert into Supabase if available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reading_queue')
          .insert([queueItem])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          // Continue with mock data
        } else if (data) {
          return data;
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
        // Continue with mock data
      }
    }

    // Return mock data
    return queueItem;

  } catch (error) {
    console.error('Error queuing reading:', error);
    throw error;
  }
}

export async function checkReadingStatus(readingId: string): Promise<ReadingQueueItem> {
  try {
    console.log('Checking status for reading:', readingId);

    // Check mock database first
    if (mockReadings[readingId]) {
      const reading = mockReadings[readingId];
      const now = new Date();
      const scheduledTime = new Date(reading.scheduled_completion_at);
      
      // Update status based on time
      if (now >= scheduledTime) {
        reading.status = 'completed';
      } else {
        const created = new Date(reading.created_at);
        const totalTime = scheduledTime.getTime() - created.getTime();
        const elapsed = now.getTime() - created.getTime();
        const progressPercent = (elapsed / totalTime) * 100;
        
        // Update status based on progress
        if (progressPercent > 50) {
          reading.status = 'processing';
        }
      }
      
      // Update the stored reading
      mockReadings[readingId] = reading;
      console.log('Reading status:', reading.status, 'Progress:', Math.round((now.getTime() - new Date(reading.created_at).getTime()) / (new Date(reading.scheduled_completion_at).getTime() - new Date(reading.created_at).getTime()) * 100) + '%');
      
      return reading;
    }

    // Try Supabase if available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reading_queue')
          .select('*')
          .eq('id', readingId)
          .single();

        if (error) {
          console.error('Error fetching reading status:', error);
        } else if (data) {
          // Check if reading should be marked as completed
          const now = new Date();
          const scheduledTime = new Date(data.scheduled_completion_at);
          
          if (now >= scheduledTime && data.status === 'queued') {
            // Update status to completed
            const { data: updatedData } = await supabase
              .from('reading_queue')
              .update({ status: 'completed' })
              .eq('id', readingId)
              .select()
              .single();

            return updatedData || data;
          }

          return data;
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
      }
    }

    // Return a default mock reading if not found
    const now = new Date();
    const created = new Date(now.getTime() - 30 * 1000); // Created 30 seconds ago
    const scheduled = new Date(now.getTime() + 90 * 1000); // Complete in 90 seconds
    
    return {
      id: readingId,
      user_id: generateUUID(),
      reading_type: 'astrology_full',
      status: 'processing',
      priority: 0,
      input_data: {},
      scheduled_completion_at: scheduled.toISOString(),
      created_at: created.toISOString()
    };

  } catch (error) {
    console.error('Error checking reading status:', error);
    throw error;
  }
}

export async function getUserReadings(userId: string): Promise<ReadingQueueItem[]> {
  try {
    // Validate or convert userId
    let validUserId = userId;
    if (!isValidUUID(userId)) {
      validUserId = generateUUID();
    }

    // Get mock readings for this user
    const userReadings = Object.values(mockReadings).filter(r => r.user_id === validUserId);
    if (userReadings.length > 0) {
      return userReadings;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reading_queue')
          .select('*')
          .eq('user_id', validUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user readings:', error);
          return [];
        }

        return data || [];
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error('Error getting user readings:', error);
    return [];
  }
}