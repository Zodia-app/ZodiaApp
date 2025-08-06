-- supabase/migrations/create_astrology_reports_table.sql

-- Create astrology_reports table
CREATE TABLE IF NOT EXISTS public.astrology_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    month VARCHAR(20),
    year INTEGER,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_astrology_reports_user_id ON public.astrology_reports(user_id);
CREATE INDEX idx_astrology_reports_created_at ON public.astrology_reports(created_at);
CREATE INDEX idx_astrology_reports_type ON public.astrology_reports(report_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.astrology_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own reports
CREATE POLICY "Users can view own astrology reports" ON public.astrology_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own reports
CREATE POLICY "Users can create own astrology reports" ON public.astrology_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own astrology reports" ON public.astrology_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete own astrology reports" ON public.astrology_reports
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_astrology_reports_updated_at
    BEFORE UPDATE ON public.astrology_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();