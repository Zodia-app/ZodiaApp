# 🔮 Social Features Setup Guide

This guide will help you set up all the new social features in your Supabase database.

## 📋 What's Being Added

### 🎯 **New Features:**
- ✅ **Social Mode**: Universal links for compatibility sharing
- ✅ **Friend Mode**: In-person compatibility scanning  
- ✅ **Dating Mode**: Profile creation with avatar uploads and matching
- ✅ **Compatibility Codes**: 30-day shareable codes with real database lookup
- ✅ **AI-Powered Analysis**: Enhanced compatibility calculations
- ✅ **Deep Linking**: Universal links that work across iOS/Android

### 🗄️ **New Database Tables:**
1. **`compatibility_codes`** - Stores shareable compatibility codes
2. **`social_profiles`** - User profiles for dating/social modes  
3. **`compatibility_matches`** - Tracks all compatibility checks
4. **`friend_connections`** - Stores friend mode results
5. **`social-media` bucket** - Avatar images and shared content

## 🚀 Setup Instructions

### Step 1: Update Database Schema

1. **Open Supabase Dashboard** → Your Project → SQL Editor
2. **Create new query** and paste the contents of `setup-supabase-social.sql`
3. **Run the query** - you should see success messages
4. **Verify tables created** in Database → Tables

### Step 2: Deploy Edge Function

```bash
# Deploy the compatibility analysis function
cd supabase
npx supabase functions deploy generate-compatibility-analysis
```

### Step 3: Environment Variables

Make sure your `.env` file has:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
```

### Step 4: Test the Setup

1. **Run the app**: `npm run start`
2. **Complete a palm reading**
3. **Test social modes**:
   - Try generating a compatibility code
   - Test deep linking (if deployed to TestFlight/Play Console)
   - Try friend mode scanning

## 🔧 Technical Architecture

### **Universal Links Flow:**
```
https://zodia.app/compatibility/ROB123456
         ↓
iOS detects domain → Opens app directly
         ↓
App extracts code → Auto-processes compatibility
         ↓  
Shows results instantly
```

### **Compatibility Code System:**
```
Generate Code → Store in Database → Share Link → Friend Clicks
     ↓                                              ↓
User gets code                           App looks up real palm data
     ↓                                              ↓
Shares via social media                   AI generates compatibility
```

### **Database Relationships:**
```
auth.users
    ↓
social_profiles
    ↓
compatibility_matches ← compatibility_codes
    ↓
friend_connections
```

## 📱 User Experience

### **Social Mode:**
1. User completes palm reading
2. Clicks "🔗 Social" → "Generate My Code"
3. Gets shareable link: `https://zodia.app/compatibility/ROB123456`
4. Shares on social media
5. Friend clicks → App opens → Instant compatibility results

### **Dating Mode:**
1. User uploads avatar photo
2. Creates profile with bio
3. Enables dating mode
4. Browse matches with compatibility scores
5. Connect with cosmic matches!

### **Friend Mode:**
1. User and friend together
2. Both scan palms in sequence  
3. Instant compatibility analysis
4. Shareable results card

## 🛡️ Security Features

- **Row Level Security (RLS)** on all tables
- **Expired code cleanup** (30-day expiry)
- **Anonymous code sharing** (no personal data exposed)
- **Secure avatar uploads** to Supabase Storage
- **Rate limiting** on AI API calls

## 🎨 UI Components Ready

All screens are implemented and ready:
- `SocialModeScreen.tsx` - Code generation and sharing
- `DatingModeScreen.tsx` - Profile creation with avatar upload
- `DatingDashboard.tsx` - Match browsing and filtering
- `FriendModeScreen.tsx` - In-person scanning flow
- `ShareableCardsView.tsx` - Instagram-worthy result cards

## 🔍 Testing Deep Links

### **iOS Simulator:**
```bash
xcrun simctl openurl booted "https://zodia.app/compatibility/TEST123456"
```

### **Android Emulator:**
```bash
adb shell am start \
  -W -a android.intent.action.VIEW \
  -d "https://zodia.app/compatibility/TEST123456" \
  com.yourcompany.zodiaapp
```

### **Physical Devices:**
- Share the link via AirDrop, Messages, or email
- Click the link to test the universal link behavior

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Code not found"** → Check if database migration ran successfully
2. **Deep links not working** → Verify `app.json` configuration  
3. **Avatar upload fails** → Check storage bucket permissions
4. **AI analysis fails** → Verify OpenAI API key in Supabase secrets

### **Debug Logs:**
- Check Expo logs for compatibility code generation
- Check Supabase Edge Function logs for AI analysis
- Check database for stored codes: `SELECT * FROM compatibility_codes;`

## 🎉 Success Indicators

When everything is working correctly, you'll see:

1. ✅ **Compatibility codes generate and store in database**
2. ✅ **Universal links open app directly (iOS/Android)**  
3. ✅ **AI-powered compatibility analysis returns detailed results**
4. ✅ **Avatar uploads work for dating profiles**
5. ✅ **Friend mode captures and analyzes in-person sessions**
6. ✅ **Shareable cards can be saved and shared**

## 📈 Analytics & Monitoring

The system tracks:
- Code generation and usage rates
- Compatibility check success rates  
- Popular compatibility scores
- User engagement with different modes
- Deep link click-through rates

---

## 🎯 Ready to Launch!

Your palm reading app is now a full social platform with:
- **Instagram-worthy scanning experience** 
- **Real universal link sharing**
- **AI-powered compatibility matching**
- **Multiple connection modes**
- **Professional dating platform features**

Perfect for viral social media sharing! 🌟✨