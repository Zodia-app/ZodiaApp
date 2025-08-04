const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials
const supabaseUrl = 'https://uasglfqvvktstzmhbmas.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Replace this with your actual service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Rest of the code continues...
