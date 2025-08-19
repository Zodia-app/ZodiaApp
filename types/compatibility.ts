export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  username?: string;
  date_of_birth: string;
  profile_image_url?: string;
  bio?: string;
  palm_reading_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompatibilityScores {
  overall_score: number;
  love_score: number;
  communication_score: number;
  life_goals_score: number;
  energy_score: number;
}

export interface CompatibilityAnalysis {
  greeting: string;
  vibe_summary: string;
  compatibility_highlights: string[];
  potential_challenges: string[];
  relationship_dynamics: {
    communication_style: string;
    conflict_resolution: string;
    shared_interests: string;
    growth_potential: string;
  };
  fun_facts: string[];
  date_ideas?: string[];
  friendship_activities?: string[];
  advice_for_duo: string;
  cosmic_connection: string;
}

export interface CompatibilityMatch {
  id: string;
  initiator_id: string;
  partner_id: string;
  match_type: 'romantic' | 'friendship' | 'platonic';
  
  // Scores
  overall_score?: number;
  love_score?: number;
  communication_score?: number;
  life_goals_score?: number;
  energy_score?: number;
  
  // Analysis data
  initiator_reading?: any;
  partner_reading?: any;
  compatibility_analysis?: CompatibilityAnalysis;
  
  // Metadata
  status: 'pending' | 'completed' | 'shared';
  is_public: boolean;
  shared_count: number;
  
  created_at: string;
  updated_at: string;
  
  // Related data
  initiator?: UserProfile;
  partner?: UserProfile;
}

export interface MatchInvitation {
  id: string;
  from_user_id: string;
  to_user_id?: string;
  invite_code: string;
  message?: string;
  match_type: 'romantic' | 'friendship' | 'platonic';
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  
  // Related data
  from_user?: UserProfile;
  to_user?: UserProfile;
}

export interface CompatibilityShare {
  id: string;
  match_id: string;
  platform: 'tiktok' | 'instagram' | 'snapchat' | 'copy_link' | 'whatsapp' | 'other';
  shared_by: string;
  created_at: string;
}

export interface CreateMatchInviteRequest {
  message?: string;
  match_type: 'romantic' | 'friendship' | 'platonic';
}

export interface AcceptInviteRequest {
  invite_code: string;
}

export interface ShareableCompatibilityCard {
  match_id: string;
  title: string;
  subtitle: string;
  overall_score: number;
  highlights: string[];
  names: string[];
  match_type: string;
  emoji_theme: string[];
  background_gradient: string[];
  created_at: string;
}