-- Palm readings table (unified approach)
CREATE TABLE palm_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Allows anonymous users with UUID from session
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    time_of_birth TIME,
    place_of_birth_city VARCHAR(255),
    place_of_birth_state VARCHAR(255),
    place_of_birth_country VARCHAR(255),
    gender VARCHAR(50),
    relationship_status VARCHAR(50),
    focus_areas TEXT[],
    left_hand_image_url TEXT NULL,
    right_hand_image_url TEXT NULL,
    struggles TEXT,
    goals TEXT,
    reading_content JSONB, -- Store the AI-generated reading
    reading_metadata JSONB, -- Store metadata about the reading
    based_on_actual_images BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for user queries
CREATE INDEX idx_palm_readings_user_id ON palm_readings(user_id);
CREATE INDEX idx_palm_readings_created_at ON palm_readings(created_at);

-- Add storage bucket for palm images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('palm-images', 'palm-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage RLS policies for palm images
CREATE POLICY "Allow authenticated users to upload palm images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'palm-images' AND 
  (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
);

CREATE POLICY "Allow authenticated users to view palm images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'palm-images' AND 
  (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
);

CREATE POLICY "Allow authenticated users to update palm images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'palm-images' AND 
  (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
);

CREATE POLICY "Allow authenticated users to delete palm images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'palm-images' AND 
  (auth.uid() IS NOT NULL OR auth.uid() IS NULL)
);

-- Set up RLS policies for palm readings
ALTER TABLE palm_readings ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own palm readings
CREATE POLICY "Users can view their own palm readings" ON palm_readings
FOR SELECT USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- Allow users to insert their own palm readings
CREATE POLICY "Users can insert their own palm readings" ON palm_readings
FOR INSERT WITH CHECK (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- Allow users to update their own palm readings
CREATE POLICY "Users can update their own palm readings" ON palm_readings
FOR UPDATE USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);