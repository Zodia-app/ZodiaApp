-- Quick setup for compatibility codes table
-- Run this in Supabase SQL Editor

-- 1. Create compatibility_codes table (if not exists)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_compatibility_codes_code ON compatibility_codes(code);
CREATE INDEX IF NOT EXISTS idx_compatibility_codes_expires_at ON compatibility_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_compatibility_codes_active ON compatibility_codes(is_active);

-- Enable RLS
ALTER TABLE compatibility_codes ENABLE ROW LEVEL SECURITY;

-- Policies for compatibility codes (public read for sharing, public write for codes)
DROP POLICY IF EXISTS "Anyone can read active compatibility codes" ON compatibility_codes;
CREATE POLICY "Anyone can read active compatibility codes" ON compatibility_codes
    FOR SELECT USING (is_active = true AND expires_at > now());

DROP POLICY IF EXISTS "Anyone can create compatibility codes" ON compatibility_codes;
CREATE POLICY "Anyone can create compatibility codes" ON compatibility_codes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update compatibility codes usage" ON compatibility_codes;
CREATE POLICY "Users can update compatibility codes usage" ON compatibility_codes
    FOR UPDATE USING (true);