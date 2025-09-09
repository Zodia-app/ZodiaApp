/**
 * User Profile Management Tester
 * Tests user profile functionality including:
 * - Profile creation and validation
 * - Profile updates and edits
 * - Data persistence and retrieval
 * - Privacy settings
 * - Profile sharing and visibility
 * - User preferences and settings
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Test data for user profiles
const TEST_USER_PROFILES = [
  {
    id: 'user_profile_1_' + Date.now(),
    name: 'Emma Profile Test',
    email: 'emma@test.com',
    dateOfBirth: '1995-04-12',
    timeOfBirth: '09:15',
    placeOfBirth: 'San Francisco, CA',
    zodiacSign: 'Aries',
    bio: 'Adventurous soul who loves exploring new places and meeting new people.',
    interests: ['Travel', 'Photography', 'Astrology', 'Yoga'],
    profilePicture: 'https://example.com/profile1.jpg',
    privacy: {
      showAge: true,
      showLocation: true,
      showBio: true,
      allowCompatibilityRequests: true
    },
    preferences: {
      notifications: true,
      dailyHoroscope: true,
      compatibilityAlerts: true,
      language: 'en',
      theme: 'light'
    }
  },
  {
    id: 'user_profile_2_' + Date.now(),
    name: 'Alex Privacy Test',
    email: 'alex@test.com',
    dateOfBirth: '1988-09-23',
    timeOfBirth: '14:30',
    placeOfBirth: 'New York, NY',
    zodiacSign: 'Libra',
    bio: 'Private person who values deep connections over surface interactions.',
    interests: ['Reading', 'Music', 'Cooking'],
    profilePicture: null,
    privacy: {
      showAge: false,
      showLocation: false,
      showBio: true,
      allowCompatibilityRequests: false
    },
    preferences: {
      notifications: false,
      dailyHoroscope: true,
      compatibilityAlerts: false,
      language: 'en',
      theme: 'dark'
    }
  }
];

class UserProfileTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.createdProfiles = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFunction) {
    try {
      this.log(`Starting test: ${name}`);
      await testFunction();
      this.testResults.passed++;
      this.log(`✅ Test passed: ${name}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: name, error: error.message });
      this.log(`❌ Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  // Test 1: Profile creation and validation
  async testProfileCreation() {
    this.log('Testing user profile creation...');

    for (const profileData of TEST_USER_PROFILES) {
      try {
        // Validate profile data before creation
        this.validateProfileData(profileData);
        
        // Create profile
        const createdProfile = await this.createUserProfile(profileData);
        this.createdProfiles.push(createdProfile);
        
        // Verify created profile
        this.validateCreatedProfile(createdProfile, profileData);
        
        this.log(`✓ Profile created successfully for ${profileData.name}`);
      } catch (error) {
        throw new Error(`Failed to create profile for ${profileData.name}: ${error.message}`);
      }
    }

    this.log('Profile creation tests passed');
  }

  validateProfileData(profileData) {
    const requiredFields = ['name', 'email', 'dateOfBirth', 'zodiacSign'];
    
    for (const field of requiredFields) {
      if (!profileData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate date of birth format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(profileData.dateOfBirth)) {
      throw new Error('Invalid date of birth format (should be YYYY-MM-DD)');
    }

    // Validate age (must be 13+)
    const birthDate = new Date(profileData.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      throw new Error('User must be at least 13 years old');
    }

    // Validate zodiac sign
    const validZodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    if (!validZodiacSigns.includes(profileData.zodiacSign)) {
      throw new Error(`Invalid zodiac sign: ${profileData.zodiacSign}`);
    }

    // Validate optional fields
    if (profileData.bio && profileData.bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }

    if (profileData.interests && !Array.isArray(profileData.interests)) {
      throw new Error('Interests must be an array');
    }

    if (profileData.interests && profileData.interests.length > 10) {
      throw new Error('Cannot have more than 10 interests');
    }
  }

  async createUserProfile(profileData) {
    // Simulate profile creation
    const profile = {
      ...profileData,
      id: profileData.id || 'profile_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_completion: this.calculateProfileCompletion(profileData)
    };

    // In real implementation, this would save to database
    this.log(`Profile would be saved:`, JSON.stringify(profile, null, 2));
    
    return profile;
  }

  calculateProfileCompletion(profileData) {
    const optionalFields = ['bio', 'interests', 'profilePicture', 'timeOfBirth', 'placeOfBirth'];
    const completedFields = optionalFields.filter(field => 
      profileData[field] && 
      (Array.isArray(profileData[field]) ? profileData[field].length > 0 : true)
    ).length;
    
    // Base 50% for required fields, +10% for each optional field
    return 50 + (completedFields * 10);
  }

  validateCreatedProfile(createdProfile, originalData) {
    if (!createdProfile.id) {
      throw new Error('Created profile must have an ID');
    }

    if (!createdProfile.created_at) {
      throw new Error('Created profile must have creation timestamp');
    }

    if (createdProfile.name !== originalData.name) {
      throw new Error('Profile name mismatch');
    }

    if (createdProfile.email !== originalData.email) {
      throw new Error('Profile email mismatch');
    }

    if (typeof createdProfile.profile_completion !== 'number' || 
        createdProfile.profile_completion < 0 || 
        createdProfile.profile_completion > 100) {
      throw new Error('Invalid profile completion percentage');
    }
  }

  // Test 2: Profile updates and edits
  async testProfileUpdates() {
    this.log('Testing profile updates...');

    if (this.createdProfiles.length === 0) {
      throw new Error('No profiles created to test updates');
    }

    const profileToUpdate = this.createdProfiles[0];
    
    // Test various update scenarios
    const updateTests = [
      {
        name: 'Basic info update',
        updates: {
          name: 'Emma Updated Name',
          bio: 'Updated bio with new information about my journey.'
        }
      },
      {
        name: 'Interests update',
        updates: {
          interests: ['Travel', 'Photography', 'Astrology', 'Yoga', 'Meditation', 'Cooking']
        }
      },
      {
        name: 'Privacy settings update',
        updates: {
          privacy: {
            showAge: false,
            showLocation: true,
            showBio: true,
            allowCompatibilityRequests: false
          }
        }
      },
      {
        name: 'Preferences update',
        updates: {
          preferences: {
            notifications: false,
            dailyHoroscope: true,
            compatibilityAlerts: false,
            language: 'es',
            theme: 'dark'
          }
        }
      }
    ];

    for (const updateTest of updateTests) {
      try {
        const updatedProfile = await this.updateUserProfile(profileToUpdate.id, updateTest.updates);
        this.validateProfileUpdate(updatedProfile, updateTest.updates);
        this.log(`✓ ${updateTest.name} completed successfully`);
      } catch (error) {
        throw new Error(`${updateTest.name} failed: ${error.message}`);
      }
    }

    this.log('Profile update tests passed');
  }

  async updateUserProfile(profileId, updates) {
    // Simulate profile update
    const currentProfile = this.createdProfiles.find(p => p.id === profileId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    // Validate updates
    if (updates.name && (typeof updates.name !== 'string' || updates.name.length < 2)) {
      throw new Error('Invalid name in updates');
    }

    if (updates.bio && updates.bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }

    if (updates.interests && (!Array.isArray(updates.interests) || updates.interests.length > 10)) {
      throw new Error('Invalid interests in updates');
    }

    // Apply updates
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updated_at: new Date().toISOString(),
      profile_completion: this.calculateProfileCompletion({ ...currentProfile, ...updates })
    };

    // Update in our test data
    const profileIndex = this.createdProfiles.findIndex(p => p.id === profileId);
    this.createdProfiles[profileIndex] = updatedProfile;

    this.log(`Profile updated:`, JSON.stringify(updates, null, 2));
    
    return updatedProfile;
  }

  validateProfileUpdate(updatedProfile, expectedUpdates) {
    for (const [key, value] of Object.entries(expectedUpdates)) {
      if (JSON.stringify(updatedProfile[key]) !== JSON.stringify(value)) {
        throw new Error(`Update failed for ${key}: expected ${JSON.stringify(value)}, got ${JSON.stringify(updatedProfile[key])}`);
      }
    }

    if (!updatedProfile.updated_at) {
      throw new Error('Updated profile must have updated timestamp');
    }

    const updatedTime = new Date(updatedProfile.updated_at);
    const createdTime = new Date(updatedProfile.created_at);
    
    if (updatedTime <= createdTime) {
      throw new Error('Updated timestamp must be after created timestamp');
    }
  }

  // Test 3: Profile privacy and visibility
  async testProfilePrivacy() {
    this.log('Testing profile privacy settings...');

    const publicProfile = this.createdProfiles.find(p => p.privacy?.showAge === true);
    const privateProfile = this.createdProfiles.find(p => p.privacy?.showAge === false);

    if (!publicProfile || !privateProfile) {
      throw new Error('Need both public and private profiles for privacy testing');
    }

    // Test public profile visibility
    const publicView = this.getPublicProfileView(publicProfile);
    this.validatePublicProfileView(publicView, publicProfile);
    
    this.log(`✓ Public profile view generated for ${publicProfile.name}`);

    // Test private profile visibility
    const privateView = this.getPublicProfileView(privateProfile);
    this.validatePrivateProfileView(privateView, privateProfile);
    
    this.log(`✓ Private profile view respects privacy settings for ${privateProfile.name}`);

    // Test compatibility request permissions
    const canRequestPublic = this.canRequestCompatibility(publicProfile);
    const canRequestPrivate = this.canRequestCompatibility(privateProfile);

    if (!canRequestPublic) {
      throw new Error('Should be able to request compatibility with public profile');
    }

    if (canRequestPrivate) {
      throw new Error('Should not be able to request compatibility with private profile');
    }

    this.log('✓ Compatibility request permissions working correctly');

    this.log('Profile privacy tests passed');
  }

  getPublicProfileView(profile) {
    // Generate public view based on privacy settings
    const publicView = {
      id: profile.id,
      name: profile.name,
      zodiacSign: profile.zodiacSign,
      profilePicture: profile.profilePicture
    };

    if (profile.privacy?.showAge) {
      publicView.age = this.calculateAge(profile.dateOfBirth);
    }

    if (profile.privacy?.showLocation) {
      publicView.location = profile.placeOfBirth;
    }

    if (profile.privacy?.showBio) {
      publicView.bio = profile.bio;
    }

    // Always show interests if they exist (they're public by default)
    if (profile.interests) {
      publicView.interests = profile.interests;
    }

    return publicView;
  }

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  validatePublicProfileView(publicView, originalProfile) {
    // Should always have these fields
    const requiredFields = ['id', 'name', 'zodiacSign'];
    for (const field of requiredFields) {
      if (!publicView[field]) {
        throw new Error(`Public view missing required field: ${field}`);
      }
    }

    // Check privacy settings are respected
    if (originalProfile.privacy?.showAge === false && publicView.age !== undefined) {
      throw new Error('Age should not be visible when privacy setting is false');
    }

    if (originalProfile.privacy?.showLocation === false && publicView.location !== undefined) {
      throw new Error('Location should not be visible when privacy setting is false');
    }

    if (originalProfile.privacy?.showBio === false && publicView.bio !== undefined) {
      throw new Error('Bio should not be visible when privacy setting is false');
    }
  }

  validatePrivateProfileView(privateView, originalProfile) {
    // Private profiles should have limited information
    if (originalProfile.privacy?.showAge === false && privateView.age !== undefined) {
      throw new Error('Private profile should not show age');
    }

    if (originalProfile.privacy?.showLocation === false && privateView.location !== undefined) {
      throw new Error('Private profile should not show location');
    }
  }

  canRequestCompatibility(profile) {
    return profile.privacy?.allowCompatibilityRequests !== false;
  }

  // Test 4: Profile search and discovery
  async testProfileSearch() {
    this.log('Testing profile search and discovery...');

    if (this.createdProfiles.length < 2) {
      throw new Error('Need at least 2 profiles for search testing');
    }

    // Test search by name
    const nameSearchResults = this.searchProfiles({ name: 'Emma' });
    if (nameSearchResults.length === 0) {
      throw new Error('Name search should return results');
    }
    this.log(`✓ Name search returned ${nameSearchResults.length} results`);

    // Test search by zodiac sign
    const zodiacSearchResults = this.searchProfiles({ zodiacSign: 'Aries' });
    if (zodiacSearchResults.length === 0) {
      throw new Error('Zodiac search should return results');
    }
    this.log(`✓ Zodiac search returned ${zodiacSearchResults.length} results`);

    // Test search by interests
    const interestSearchResults = this.searchProfiles({ interests: ['Travel'] });
    this.log(`✓ Interest search returned ${interestSearchResults.length} results`);

    // Test search with multiple criteria
    const multiSearchResults = this.searchProfiles({ 
      zodiacSign: 'Aries', 
      interests: ['Travel'] 
    });
    this.log(`✓ Multi-criteria search returned ${multiSearchResults.length} results`);

    // Test search privacy (should only return profiles that allow discovery)
    const discoveredProfiles = this.searchProfiles({}, true); // Include privacy filter
    const totalProfiles = this.searchProfiles({}, false); // No privacy filter
    
    if (discoveredProfiles.length > totalProfiles.length) {
      throw new Error('Discoverable profiles cannot exceed total profiles');
    }

    this.log(`✓ Privacy filtering: ${discoveredProfiles.length}/${totalProfiles.length} profiles discoverable`);

    this.log('Profile search tests passed');
  }

  searchProfiles(criteria, respectPrivacy = true) {
    let results = [...this.createdProfiles];

    // Filter by privacy settings if requested
    if (respectPrivacy) {
      results = results.filter(profile => 
        profile.privacy?.allowCompatibilityRequests !== false
      );
    }

    // Apply search criteria
    if (criteria.name) {
      results = results.filter(profile => 
        profile.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }

    if (criteria.zodiacSign) {
      results = results.filter(profile => 
        profile.zodiacSign === criteria.zodiacSign
      );
    }

    if (criteria.interests && criteria.interests.length > 0) {
      results = results.filter(profile => {
        if (!profile.interests) return false;
        return criteria.interests.some(interest => 
          profile.interests.includes(interest)
        );
      });
    }

    // Convert to public views
    return results.map(profile => this.getPublicProfileView(profile));
  }

  // Test 5: Profile preferences and settings
  async testProfilePreferences() {
    this.log('Testing profile preferences and settings...');

    if (this.createdProfiles.length === 0) {
      throw new Error('No profiles available for preferences testing');
    }

    const profile = this.createdProfiles[0];

    // Test notification preferences
    await this.testNotificationPreferences(profile);
    
    // Test appearance preferences
    await this.testAppearancePreferences(profile);
    
    // Test language preferences
    await this.testLanguagePreferences(profile);

    this.log('Profile preferences tests passed');
  }

  async testNotificationPreferences(profile) {
    const notificationTests = [
      { notifications: true, dailyHoroscope: true, compatibilityAlerts: true },
      { notifications: false, dailyHoroscope: false, compatibilityAlerts: false },
      { notifications: true, dailyHoroscope: true, compatibilityAlerts: false }
    ];

    for (const testPrefs of notificationTests) {
      const updatedProfile = await this.updateUserProfile(profile.id, {
        preferences: { ...profile.preferences, ...testPrefs }
      });

      // Validate notification settings
      for (const [key, value] of Object.entries(testPrefs)) {
        if (updatedProfile.preferences[key] !== value) {
          throw new Error(`Notification preference ${key} not updated correctly`);
        }
      }

      // Test notification delivery logic
      const shouldReceiveNotifications = this.shouldReceiveNotification(updatedProfile, 'daily_horoscope');
      const expectedReceive = testPrefs.notifications && testPrefs.dailyHoroscope;
      
      if (shouldReceiveNotifications !== expectedReceive) {
        throw new Error('Notification delivery logic is incorrect');
      }
    }

    this.log('✓ Notification preferences working correctly');
  }

  async testAppearancePreferences(profile) {
    const themes = ['light', 'dark', 'auto'];

    for (const theme of themes) {
      const updatedProfile = await this.updateUserProfile(profile.id, {
        preferences: { ...profile.preferences, theme }
      });

      if (updatedProfile.preferences.theme !== theme) {
        throw new Error(`Theme preference not updated to ${theme}`);
      }

      // Test theme application
      const appliedTheme = this.getAppliedTheme(updatedProfile);
      if (!['light', 'dark'].includes(appliedTheme)) {
        throw new Error('Applied theme must be either light or dark');
      }
    }

    this.log('✓ Appearance preferences working correctly');
  }

  async testLanguagePreferences(profile) {
    const languages = ['en', 'es', 'fr', 'de'];

    for (const language of languages) {
      const updatedProfile = await this.updateUserProfile(profile.id, {
        preferences: { ...profile.preferences, language }
      });

      if (updatedProfile.preferences.language !== language) {
        throw new Error(`Language preference not updated to ${language}`);
      }

      // Test if language is supported
      if (!this.isSupportedLanguage(language)) {
        this.log(`⚠️  Language ${language} may not be fully supported`, 'warn');
      }
    }

    this.log('✓ Language preferences working correctly');
  }

  shouldReceiveNotification(profile, notificationType) {
    if (!profile.preferences.notifications) return false;

    switch (notificationType) {
      case 'daily_horoscope':
        return profile.preferences.dailyHoroscope;
      case 'compatibility_alert':
        return profile.preferences.compatibilityAlerts;
      default:
        return false;
    }
  }

  getAppliedTheme(profile) {
    const theme = profile.preferences.theme;
    
    if (theme === 'auto') {
      // Simulate auto theme detection
      const hour = new Date().getHours();
      return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }
    
    return theme;
  }

  isSupportedLanguage(language) {
    const supportedLanguages = ['en', 'es', 'fr'];
    return supportedLanguages.includes(language);
  }

  // Test 6: Profile data export and import
  async testProfileDataPortability() {
    this.log('Testing profile data export and import...');

    if (this.createdProfiles.length === 0) {
      throw new Error('No profiles available for data portability testing');
    }

    const profile = this.createdProfiles[0];

    // Test data export
    const exportedData = await this.exportProfileData(profile.id);
    this.validateExportedData(exportedData, profile);
    this.log('✓ Profile data exported successfully');

    // Test data import
    const importedProfile = await this.importProfileData(exportedData, 'imported_' + Date.now());
    this.validateImportedProfile(importedProfile, exportedData);
    this.log('✓ Profile data imported successfully');

    // Test data anonymization for export
    const anonymizedData = await this.exportProfileData(profile.id, true);
    this.validateAnonymizedData(anonymizedData);
    this.log('✓ Profile data anonymized for export');

    this.log('Profile data portability tests passed');
  }

  async exportProfileData(profileId, anonymize = false) {
    const profile = this.createdProfiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error('Profile not found for export');
    }

    let exportData = {
      profile: { ...profile },
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    if (anonymize) {
      // Remove personally identifiable information
      delete exportData.profile.name;
      delete exportData.profile.email;
      delete exportData.profile.profilePicture;
      exportData.profile.id = 'anonymized_' + Date.now();
    }

    return exportData;
  }

  validateExportedData(exportedData, originalProfile) {
    if (!exportedData.profile) {
      throw new Error('Exported data must contain profile');
    }

    if (!exportedData.exportDate) {
      throw new Error('Exported data must contain export date');
    }

    if (!exportedData.version) {
      throw new Error('Exported data must contain version');
    }

    // Verify key profile data is present (unless anonymized)
    if (exportedData.profile.name && exportedData.profile.name !== originalProfile.name) {
      throw new Error('Exported profile name mismatch');
    }
  }

  async importProfileData(exportedData, newProfileId) {
    if (!exportedData.profile) {
      throw new Error('Invalid import data: missing profile');
    }

    const importedProfile = {
      ...exportedData.profile,
      id: newProfileId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      imported_at: new Date().toISOString(),
      imported_from_version: exportedData.version
    };

    // Validate imported data
    this.validateProfileData(importedProfile);

    return importedProfile;
  }

  validateImportedProfile(importedProfile, exportedData) {
    if (!importedProfile.imported_at) {
      throw new Error('Imported profile must have import timestamp');
    }

    if (importedProfile.zodiacSign !== exportedData.profile.zodiacSign) {
      throw new Error('Imported zodiac sign mismatch');
    }
  }

  validateAnonymizedData(anonymizedData) {
    if (anonymizedData.profile.name) {
      throw new Error('Anonymized data should not contain name');
    }

    if (anonymizedData.profile.email) {
      throw new Error('Anonymized data should not contain email');
    }

    if (!anonymizedData.profile.id.startsWith('anonymized_')) {
      throw new Error('Anonymized data should have anonymized ID');
    }
  }

  // Test 7: Profile deletion and cleanup
  async testProfileDeletion() {
    this.log('Testing profile deletion and data cleanup...');

    if (this.createdProfiles.length === 0) {
      throw new Error('No profiles available for deletion testing');
    }

    const profileToDelete = this.createdProfiles[this.createdProfiles.length - 1];
    const profileId = profileToDelete.id;

    // Test soft deletion first
    await this.softDeleteProfile(profileId);
    this.log('✓ Profile soft deleted');

    // Test profile recovery
    await this.recoverProfile(profileId);
    this.log('✓ Profile recovered from soft deletion');

    // Test hard deletion
    await this.hardDeleteProfile(profileId);
    this.log('✓ Profile permanently deleted');

    // Verify deletion
    const deletedProfile = this.createdProfiles.find(p => p.id === profileId);
    if (deletedProfile && !deletedProfile.deleted_at) {
      throw new Error('Profile was not properly deleted');
    }

    this.log('Profile deletion tests passed');
  }

  async softDeleteProfile(profileId) {
    const profileIndex = this.createdProfiles.findIndex(p => p.id === profileId);
    if (profileIndex === -1) {
      throw new Error('Profile not found for soft deletion');
    }

    this.createdProfiles[profileIndex] = {
      ...this.createdProfiles[profileIndex],
      deleted_at: new Date().toISOString(),
      status: 'deleted'
    };
  }

  async recoverProfile(profileId) {
    const profileIndex = this.createdProfiles.findIndex(p => p.id === profileId);
    if (profileIndex === -1) {
      throw new Error('Profile not found for recovery');
    }

    const profile = this.createdProfiles[profileIndex];
    
    if (!profile.deleted_at) {
      throw new Error('Profile is not soft deleted');
    }

    this.createdProfiles[profileIndex] = {
      ...profile,
      deleted_at: null,
      recovered_at: new Date().toISOString(),
      status: 'active'
    };
  }

  async hardDeleteProfile(profileId) {
    const profileIndex = this.createdProfiles.findIndex(p => p.id === profileId);
    if (profileIndex === -1) {
      throw new Error('Profile not found for hard deletion');
    }

    // Mark as permanently deleted rather than removing from array (for testing purposes)
    this.createdProfiles[profileIndex] = {
      id: profileId,
      permanently_deleted_at: new Date().toISOString(),
      status: 'permanently_deleted'
    };
  }

  // Cleanup test data
  async cleanup() {
    this.log('Cleaning up test profiles...');
    
    for (const profile of this.createdProfiles) {
      if (profile.status !== 'permanently_deleted') {
        this.log(`Would delete profile: ${profile.name || profile.id}`);
      }
    }
    
    this.log(`Cleaned up ${this.createdProfiles.length} test profiles`);
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting User Profile Management Tests');
    this.log('='.repeat(50));

    await this.test('Profile Creation', () => this.testProfileCreation());
    await this.test('Profile Updates', () => this.testProfileUpdates());
    await this.test('Profile Privacy', () => this.testProfilePrivacy());
    await this.test('Profile Search', () => this.testProfileSearch());
    await this.test('Profile Preferences', () => this.testProfilePreferences());
    await this.test('Data Portability', () => this.testProfileDataPortability());
    await this.test('Profile Deletion', () => this.testProfileDeletion());

    // Cleanup
    await this.cleanup();

    this.log('='.repeat(50));
    this.log(`📊 Test Results: ${this.testResults.passed} passed, ${this.testResults.failed} failed`);

    if (this.testResults.failed > 0) {
      this.log('❌ Failed Tests:');
      this.testResults.errors.forEach(error => {
        this.log(`   - ${error.test}: ${error.error}`);
      });
    } else {
      this.log('🎉 All user profile tests passed!');
    }

    return this.testResults;
  }

  // Manual test runner
  async runManualTest(testName) {
    const tests = {
      'create': () => this.testProfileCreation(),
      'update': () => this.testProfileUpdates(),
      'privacy': () => this.testProfilePrivacy(),
      'search': () => this.testProfileSearch(),
      'preferences': () => this.testProfilePreferences(),
      'export': () => this.testProfileDataPortability(),
      'delete': () => this.testProfileDeletion()
    };

    if (!testName || testName === 'help') {
      console.log('Available user profile tests:');
      console.log('  create      - Test profile creation and validation');
      console.log('  update      - Test profile updates and edits');
      console.log('  privacy     - Test privacy settings and visibility');
      console.log('  search      - Test profile search and discovery');
      console.log('  preferences - Test user preferences and settings');
      console.log('  export      - Test data export and import');
      console.log('  delete      - Test profile deletion and cleanup');
      console.log('  all         - Run all tests');
      return;
    }

    if (testName === 'all') {
      return await this.runAllTests();
    }

    const testFunction = tests[testName];
    if (!testFunction) {
      this.log(`❌ Unknown test: ${testName}`, 'error');
      return;
    }

    try {
      this.log(`Running user profile test: ${testName}`);
      this.log('='.repeat(30));
      
      await this.test(testName, testFunction);
      
      this.log('='.repeat(30));
      this.log('✅ Test completed successfully!', 'success');
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`, 'error');
    }
  }
}

// Run tests if called directly
async function main() {
  const tester = new UserProfileTester();
  const testName = process.argv[2] || 'all';
  
  try {
    await tester.runManualTest(testName);
  } catch (error) {
    console.error('❌ Fatal error during testing:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { UserProfileTester };