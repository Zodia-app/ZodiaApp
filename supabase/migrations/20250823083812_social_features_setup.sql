-- ===================================================
-- COMPLETE SUPABASE SETUP FOR SOCIAL FEATURES
-- Run this in Supabase SQL Editor Dashboard
-- ===================================================

-- 1. Create compatibility_codes table for social mode sharing
CREATE TABLE IF NOT EXISTS compatibility_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  user_name text NOT NULL,
  user_palm_data jsonb NOT NULL,
  user_reading_result jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone DEFAULT timezone('utc'::text, now() + interval '30 days') NOT NULL,
  times_used integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Create indexes for compatibility_codes
CREATE INDEX IF NOT EXISTS idx_compatibility_codes_code ON compatibility_codes(code);
CREATE INDEX IF NOT EXISTS idx_compatibility_codes_expires_at ON compatibility_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_compatibility_codes_active ON compatibility_codes(is_active);

-- 2. Create social_profiles table for dating mode
CREATE TABLE IF NOT EXISTS social_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  palm_reading_id uuid REFERENCES palm_readings(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  avatar_url text,
  bio text,
  dating_mode_enabled boolean DEFAULT false,
  friend_mode_enabled boolean DEFAULT true,
  social_mode_enabled boolean DEFAULT true,
  location_city text,
  location_state text,
  location_country text,
  preferred_age_min integer DEFAULT 18,
  preferred_age_max integer DEFAULT 99,
  preferred_distance_km integer DEFAULT 50,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for social_profiles
CREATE INDEX IF NOT EXISTS idx_social_profiles_user_id ON social_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_profiles_dating_enabled ON social_profiles(dating_mode_enabled);
CREATE INDEX IF NOT EXISTS idx_social_profiles_location ON social_profiles(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_social_profiles_last_active ON social_profiles(last_active);

-- 3. Create compatibility_matches table to track all compatibility checks
CREATE TABLE IF NOT EXISTS compatibility_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_profile_id uuid REFERENCES social_profiles(id) ON DELETE CASCADE,
  user2_profile_id uuid REFERENCES social_profiles(id) ON DELETE CASCADE,
  compatibility_code text, -- The code used to initiate this match
  compatibility_score integer NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  compatibility_data jsonb NOT NULL, -- Detailed compatibility breakdown
  match_type text NOT NULL CHECK (match_type IN ('friend', 'dating', 'social')),
  is_mutual boolean DEFAULT false, -- True if both users checked each other
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure unique combinations
  UNIQUE(user1_profile_id, user2_profile_id)
);

-- Create indexes for compatibility_matches
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_user1 ON compatibility_matches(user1_profile_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_user2 ON compatibility_matches(user2_profile_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_type ON compatibility_matches(match_type);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_score ON compatibility_matches(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_mutual ON compatibility_matches(is_mutual);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_code ON compatibility_matches(compatibility_code);

-- 4. Create friend_connections table for friend mode
CREATE TABLE IF NOT EXISTS friend_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id uuid REFERENCES social_profiles(id) ON DELETE CASCADE,
  friend_name text NOT NULL,
  friend_palm_data jsonb, -- If friend also scans their palm
  compatibility_score integer NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  compatibility_data jsonb NOT NULL,
  session_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  location text
);

-- Create indexes for friend_connections
CREATE INDEX IF NOT EXISTS idx_friend_connections_user ON friend_connections(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_date ON friend_connections(session_date);

-- 5. Create social_media bucket for avatars and shared content
INSERT INTO storage.buckets (id, name, public) VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Add social features to existing palm_readings table
ALTER TABLE palm_readings 
ADD COLUMN IF NOT EXISTS social_sharing_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS social_profile_created boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compatibility_code_generated boolean DEFAULT false;

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

-- Enable RLS on all new tables
ALTER TABLE compatibility_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;

-- Compatibility codes policies (public read for sharing, authenticated write)
DROP POLICY IF EXISTS "Anyone can read active compatibility codes" ON compatibility_codes;
CREATE POLICY "Anyone can read active compatibility codes" ON compatibility_codes
    FOR SELECT USING (is_active = true AND expires_at > now());

DROP POLICY IF EXISTS "Anyone can create compatibility codes" ON compatibility_codes;
CREATE POLICY "Anyone can create compatibility codes" ON compatibility_codes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update compatibility codes" ON compatibility_codes;
CREATE POLICY "Users can update compatibility codes" ON compatibility_codes
    FOR UPDATE USING (true);

-- Social profiles policies
DROP POLICY IF EXISTS "Users can view their own social profile" ON social_profiles;
CREATE POLICY "Users can view their own social profile" ON social_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view dating-enabled profiles" ON social_profiles;
CREATE POLICY "Users can view dating-enabled profiles" ON social_profiles
    FOR SELECT USING (dating_mode_enabled = true);

DROP POLICY IF EXISTS "Users can create their own social profile" ON social_profiles;
CREATE POLICY "Users can create their own social profile" ON social_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own social profile" ON social_profiles;
CREATE POLICY "Users can update their own social profile" ON social_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Compatibility matches policies
DROP POLICY IF EXISTS "Users can view their own matches" ON compatibility_matches;
CREATE POLICY "Users can view their own matches" ON compatibility_matches
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM social_profiles WHERE id = user1_profile_id AND user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM social_profiles WHERE id = user2_profile_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create compatibility matches" ON compatibility_matches;
CREATE POLICY "Users can create compatibility matches" ON compatibility_matches
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM social_profiles WHERE id = user1_profile_id AND user_id = auth.uid())
    );

-- Friend connections policies
DROP POLICY IF EXISTS "Users can view their own friend connections" ON friend_connections;
CREATE POLICY "Users can view their own friend connections" ON friend_connections
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM social_profiles WHERE id = user_profile_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create friend connections" ON friend_connections;
CREATE POLICY "Users can create friend connections" ON friend_connections
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM social_profiles WHERE id = user_profile_id AND user_id = auth.uid())
    );

-- Storage policies for social-media bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'social-media');

DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'social-media' AND 
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'social-media' AND 
        auth.role() = 'authenticated'
    );

-- ===================================================
-- UTILITY FUNCTIONS
-- ===================================================

-- Function to clean up expired compatibility codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM compatibility_codes 
    WHERE expires_at < now() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get compatibility matches for a user
CREATE OR REPLACE FUNCTION get_user_matches(profile_uuid uuid, match_type_filter text DEFAULT null)
RETURNS TABLE (
    match_id uuid,
    partner_name text,
    partner_avatar_url text,
    compatibility_score integer,
    match_type text,
    is_mutual boolean,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id as match_id,
        CASE 
            WHEN cm.user1_profile_id = profile_uuid THEN sp2.name
            ELSE sp1.name
        END as partner_name,
        CASE 
            WHEN cm.user1_profile_id = profile_uuid THEN sp2.avatar_url
            ELSE sp1.avatar_url
        END as partner_avatar_url,
        cm.compatibility_score,
        cm.match_type,
        cm.is_mutual,
        cm.created_at
    FROM compatibility_matches cm
    JOIN social_profiles sp1 ON sp1.id = cm.user1_profile_id
    JOIN social_profiles sp2 ON sp2.id = cm.user2_profile_id
    WHERE (cm.user1_profile_id = profile_uuid OR cm.user2_profile_id = profile_uuid)
    AND (match_type_filter IS NULL OR cm.match_type = match_type_filter)
    ORDER BY cm.compatibility_score DESC, cm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ===================================================

-- Update updated_at timestamp for social_profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_social_profiles_updated_at ON social_profiles;
CREATE TRIGGER update_social_profiles_updated_at 
    BEFORE UPDATE ON social_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update last_active when social_profiles is accessed
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_social_profiles_last_active ON social_profiles;
CREATE TRIGGER update_social_profiles_last_active 
    BEFORE UPDATE ON social_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- ===================================================
-- SUCCESS MESSAGE
-- ===================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Social features database setup completed successfully!';
    RAISE NOTICE '📱 Features enabled:';
    RAISE NOTICE '   - Compatibility codes for social sharing';
    RAISE NOTICE '   - Social profiles for dating mode';  
    RAISE NOTICE '   - Friend connections tracking';
    RAISE NOTICE '   - Compatibility matches storage';
    RAISE NOTICE '   - Avatar image storage';
    RAISE NOTICE '🔒 Row Level Security policies configured';
    RAISE NOTICE '⚡ Utility functions and triggers created';
END $$;