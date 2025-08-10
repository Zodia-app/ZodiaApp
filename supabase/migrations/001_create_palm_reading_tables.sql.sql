-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    time_of_birth TIME,
    place_of_birth_city VARCHAR(255) NOT NULL,
    place_of_birth_state VARCHAR(255),
    place_of_birth_country VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    relationship_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Palm reading requests table
CREATE TABLE palm_reading_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    focus_areas TEXT[] NOT NULL,
    left_hand_image_url TEXT,
    right_hand_image_url TEXT,
    struggles TEXT,
    goals TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Palm reading reports table
CREATE TABLE palm_reading_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES palm_reading_requests(id) ON DELETE CASCADE,
    report_content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);