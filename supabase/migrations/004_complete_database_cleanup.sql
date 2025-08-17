-- Complete database cleanup - remove ALL unused tables, functions, and policies
-- Keep ONLY palm_readings table and palm-images storage bucket

-- Drop all existing tables except palm_readings (in order to handle dependencies)
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

-- Drop all custom functions (except system ones)
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

-- Drop all custom types
DROP TYPE IF EXISTS reading_status CASCADE;
DROP TYPE IF EXISTS compatibility_level CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS user_tier CASCADE;
DROP TYPE IF EXISTS zodiac_sign CASCADE;

-- Remove all storage buckets except palm-images
DELETE FROM storage.buckets WHERE id NOT IN ('palm-images');

-- Policies and triggers are automatically dropped with CASCADE when tables are dropped
-- No need to explicitly drop them for non-existent tables

-- Ensure palm_readings table exists with correct structure
-- (This will do nothing if it already exists correctly)
CREATE TABLE IF NOT EXISTS palm_readings (
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

-- Ensure palm-images bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('palm-images', 'palm-images', true)
ON CONFLICT (id) DO NOTHING;

-- Clean up any orphaned storage objects
DELETE FROM storage.objects WHERE bucket_id NOT IN ('palm-images');

-- Final confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Database cleanup complete. Only palm_readings table and palm-images bucket remain.';
END
$$;