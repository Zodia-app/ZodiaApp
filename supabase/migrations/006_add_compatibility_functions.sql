-- Add SQL function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(match_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE compatibility_matches 
    SET shared_count = shared_count + 1,
        updated_at = NOW()
    WHERE id = match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE match_invitations 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get compatibility stats
CREATE OR REPLACE FUNCTION get_compatibility_stats(user_profile_id UUID)
RETURNS TABLE(
    total_matches BIGINT,
    avg_compatibility_score NUMERIC,
    romantic_matches BIGINT,
    friendship_matches BIGINT,
    platonic_matches BIGINT,
    shared_matches BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_matches,
        ROUND(AVG(overall_score), 2) as avg_compatibility_score,
        COUNT(*) FILTER (WHERE match_type = 'romantic') as romantic_matches,
        COUNT(*) FILTER (WHERE match_type = 'friendship') as friendship_matches,
        COUNT(*) FILTER (WHERE match_type = 'platonic') as platonic_matches,
        COUNT(*) FILTER (WHERE is_public = true) as shared_matches
    FROM compatibility_matches 
    WHERE (initiator_id = user_profile_id OR partner_id = user_profile_id)
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to auto-cleanup expired invitations daily
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_invitations()
RETURNS trigger AS $$
BEGIN
    -- This will run when invitations are inserted/updated
    -- In a real app, you'd use a scheduled job instead
    PERFORM cleanup_expired_invitations();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for invitation cleanup (runs on insert)
DROP TRIGGER IF EXISTS cleanup_expired_invitations_trigger ON match_invitations;
CREATE TRIGGER cleanup_expired_invitations_trigger
    AFTER INSERT ON match_invitations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_expired_invitations();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_scores ON compatibility_matches(overall_score DESC) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_public ON compatibility_matches(created_at DESC) WHERE is_public = true AND status = 'shared';
CREATE INDEX IF NOT EXISTS idx_match_invitations_expires ON match_invitations(expires_at) WHERE status = 'pending';

-- Add RLS policies for the functions
GRANT EXECUTE ON FUNCTION increment_share_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_compatibility_stats(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO anon, authenticated;