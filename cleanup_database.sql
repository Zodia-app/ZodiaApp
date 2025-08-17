-- ===================================================
-- COMPLETE SUPABASE DATABASE CLEANUP SCRIPT
-- Run this in Supabase SQL Editor Dashboard
-- ===================================================
-- WARNING: This will delete ALL data except palm_readings!
-- Make sure to backup any important data first!

-- 1. Drop all unused tables (order matters for foreign keys)
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS astrology_readings CASCADE;
DROP TABLE IF EXISTS astrology_reports CASCADE;
DROP TABLE IF EXISTS horoscope_cache CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;
DROP TABLE IF EXISTS compatibility_analyses CASCADE;
DROP TABLE IF EXISTS compatibility_reports CASCADE;
DROP TABLE IF EXISTS partner_profiles CASCADE;
DROP TABLE IF EXISTS readings CASCADE;
DROP TABLE IF EXISTS reading_requests CASCADE;
DROP TABLE IF EXISTS reading_queue CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS dream_interpretations CASCADE;
DROP TABLE IF EXISTS educational_content CASCADE;
DROP TABLE IF EXISTS clairvoyance_readings CASCADE;
DROP TABLE IF EXISTS zodiac_readings CASCADE;
DROP TABLE IF EXISTS palm_reading_queue CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- 2. Drop all custom functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS get_user_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS create_astrology_reading(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS create_compatibility_analysis(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_daily_horoscope(text) CASCADE;
DROP FUNCTION IF EXISTS calculate_compatibility(jsonb, jsonb) CASCADE;
DROP FUNCTION IF EXISTS process_palm_reading(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS generate_reading_insights(jsonb) CASCADE;
DROP FUNCTION IF EXISTS update_user_preferences(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS track_analytics_event(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS send_notification(uuid, text, text) CASCADE;

-- 3. Drop all custom types
DROP TYPE IF EXISTS reading_status CASCADE;
DROP TYPE IF EXISTS compatibility_level CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS user_tier CASCADE;
DROP TYPE IF EXISTS zodiac_sign CASCADE;

-- 4. Clean up storage buckets (keep only palm-images)
DELETE FROM storage.buckets WHERE id NOT IN ('palm-images');

-- 5. Clean up orphaned storage objects
DELETE FROM storage.objects WHERE bucket_id NOT IN ('palm-images');

-- 6. Ensure palm_readings table has the correct structure
-- First check if we need to update the existing table
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'palm_readings'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'palm_readings table already exists - keeping existing data';
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE palm_readings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            date_of_birth DATE NOT NULL,
            reading_content JSONB,
            based_on_actual_images BOOLEAN DEFAULT true,
            status VARCHAR(50) DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE palm_readings ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'palm_readings table created successfully';
    END IF;
END
$$;

-- 7. Ensure palm-images bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('palm-images', 'palm-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Set up RLS policies for palm_readings (if they don't exist)
DO $$
BEGIN
    -- Check and create policies only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'palm_readings' 
        AND policyname = 'Users can view their own palm readings'
    ) THEN
        CREATE POLICY "Users can view their own palm readings" ON palm_readings
        FOR SELECT USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'palm_readings' 
        AND policyname = 'Users can insert their own palm readings'
    ) THEN
        CREATE POLICY "Users can insert their own palm readings" ON palm_readings
        FOR INSERT WITH CHECK (auth.uid() = user_id::uuid OR auth.uid() IS NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'palm_readings' 
        AND policyname = 'Users can update their own palm readings'
    ) THEN
        CREATE POLICY "Users can update their own palm readings" ON palm_readings
        FOR UPDATE USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);
    END IF;
END
$$;

-- 9. Set up storage policies for palm-images (if they don't exist)
DO $$
BEGIN
    -- Insert policies for storage.objects
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Allow authenticated users to upload palm images'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload palm images" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'palm-images' AND 
            (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Allow authenticated users to view palm images'
    ) THEN
        CREATE POLICY "Allow authenticated users to view palm images" ON storage.objects
        FOR SELECT USING (
            bucket_id = 'palm-images' AND 
            (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
        );
    END IF;
END
$$;

-- 10. Final check - list remaining tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Success message
SELECT 'Database cleanup completed successfully! Only palm_readings table should remain.' as result;