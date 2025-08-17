-- Clean up unused tables and data from previous versions
-- This migration removes all tables not related to palm readings

-- Drop astrology-related tables if they exist
DROP TABLE IF EXISTS astrology_readings CASCADE;
DROP TABLE IF EXISTS astrology_reports CASCADE;
DROP TABLE IF EXISTS horoscope_cache CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS monthly_reports CASCADE;

-- Drop compatibility-related tables if they exist
DROP TABLE IF EXISTS compatibility_analyses CASCADE;
DROP TABLE IF EXISTS compatibility_reports CASCADE;
DROP TABLE IF EXISTS partner_profiles CASCADE;

-- Drop general reading tables if they exist
DROP TABLE IF EXISTS readings CASCADE;
DROP TABLE IF EXISTS reading_requests CASCADE;
DROP TABLE IF EXISTS reading_queue CASCADE;

-- Drop user profile tables if they exist (we use anonymous auth now)
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Drop any other unused tables
DROP TABLE IF EXISTS dream_interpretations CASCADE;
DROP TABLE IF EXISTS educational_content CASCADE;
DROP TABLE IF EXISTS clairvoyance_readings CASCADE;

-- Remove unused storage buckets if they exist
DELETE FROM storage.buckets WHERE id NOT IN ('palm-images');

-- Skip policy cleanup since tables don't exist
-- Policies are automatically dropped with CASCADE when tables are dropped

-- Only keep palm_readings table and palm-images bucket
-- The palm_readings table and its policies are already created in migration 002