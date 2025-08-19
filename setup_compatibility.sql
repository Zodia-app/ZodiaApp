-- Run this SQL in your Supabase SQL Editor to set up compatibility system

-- User profiles table for storing basic user info and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    date_of_birth DATE NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    palm_reading_id UUID REFERENCES palm_readings(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Compatibility matches table
CREATE TABLE IF NOT EXISTS compatibility_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID NOT NULL REFERENCES user_profiles(id),
    partner_id UUID NOT NULL REFERENCES user_profiles(id),
    match_type VARCHAR(50) NOT NULL DEFAULT 'friendship', -- 'romantic', 'friendship', 'platonic'
    
    -- Compatibility scores (0-100)
    overall_score INTEGER,
    love_score INTEGER,
    communication_score INTEGER,
    life_goals_score INTEGER,
    energy_score INTEGER,
    
    -- Individual analysis data
    initiator_reading JSONB,
    partner_reading JSONB,
    compatibility_analysis JSONB,
    
    -- Status and metadata
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'shared'
    is_public BOOLEAN DEFAULT false,
    shared_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure we don't have duplicate matches
    UNIQUE(initiator_id, partner_id)
);

-- Match invitations table
CREATE TABLE IF NOT EXISTS match_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES user_profiles(id),
    to_user_id UUID,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    message TEXT,
    match_type VARCHAR(50) DEFAULT 'friendship',
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Social sharing tracking
CREATE TABLE IF NOT EXISTS compatibility_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES compatibility_matches(id),
    platform VARCHAR(50) NOT NULL, -- 'tiktok', 'instagram', 'snapchat', 'copy_link'
    shared_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_initiator ON compatibility_matches(initiator_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_partner ON compatibility_matches(partner_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_created_at ON compatibility_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_invitations_code ON match_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_match_invitations_to_user ON match_invitations(to_user_id);

-- Set up RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_shares ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view public profiles" ON user_profiles
FOR SELECT USING (is_public = true OR auth.uid() = user_id::uuid);

CREATE POLICY "Users can manage their own profile" ON user_profiles
FOR ALL USING (auth.uid() = user_id::uuid);

-- Generate invite codes function
CREATE OR REPLACE FUNCTION generate_invite_code() RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8)
    );
END;
$$ LANGUAGE plpgsql;

-- Set invite code trigger function  
CREATE OR REPLACE FUNCTION set_invite_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
        NEW.invite_code := generate_invite_code();
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM match_invitations WHERE invite_code = NEW.invite_code) LOOP
            NEW.invite_code := generate_invite_code();
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating invite codes
DROP TRIGGER IF EXISTS trigger_set_invite_code ON match_invitations;
CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON match_invitations
    FOR EACH ROW
    EXECUTE FUNCTION set_invite_code();