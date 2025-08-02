import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mjg2MjAsImV4cCI6MjA2OTQwNDYyMH0.a8LJC6RehfahtGr8Y6mixj_U7uvBB275AgAoJPjzy40';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});