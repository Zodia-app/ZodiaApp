import * as Amplitude from '@amplitude/analytics-react-native';

// Initialize Amplitude with React Native specific config
const initializeAnalytics = async () => {
  const API_KEY = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY || 'c127fb6e614902f7da31b498f0e5df0';
  
  try {
    await Amplitude.init(API_KEY, undefined, {
      // Disable cookie storage for React Native
      disableCookies: true,
      // Use native storage instead
      trackingOptions: {
        deviceId: true,
        sessionId: true,
        platform: true,
        language: true,
        ipAddress: false
      },
      // Set log level to warn to reduce noise
      logLevel: Amplitude.Types.LogLevel.Warn
    });
    console.log('Amplitude initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
};

export const Analytics = {
  // Initialize analytics
  init: async () => {
    await initializeAnalytics();
  },

  // Track screens
  trackScreen: (screenName: string) => {
    try {
      Amplitude.track('Screen Viewed', {
        screen_name: screenName,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Analytics track error:', error);
    }
  },

  // Track events
  trackEvent: (eventName: string, properties?: any) => {
    try {
      Amplitude.track(eventName, properties);
    } catch (error) {
      console.warn('Analytics track error:', error);
    }
  },

  // Set user ID (when user is authenticated)
  setUserId: (userId: string) => {
    try {
      Amplitude.setUserId(userId);
    } catch (error) {
      console.warn('Analytics setUserId error:', error);
    }
  },

  // Track app events
  trackAppOpen: () => {
    Analytics.trackEvent('App Opened');
  },

  trackOnboardingStarted: () => {
    Analytics.trackEvent('Onboarding Started');
  },

  trackOnboardingCompleted: (userData: any) => {
    Analytics.trackEvent('Onboarding Completed', {
      name: userData.name,
      dateOfBirth: userData.dateOfBirth ? 'provided' : 'skipped',
      gender: userData.gender,
    });
  },

  trackFeatureUsed: (feature: string) => {
    Analytics.trackEvent('Feature Used', { feature });
  },

  trackPalmReadingStarted: () => {
    Analytics.trackEvent('Palm Reading Started');
  },

  trackPalmCaptured: (hand: 'left' | 'right') => {
    Analytics.trackEvent('Palm Captured', { hand });
  },

  trackPalmReadingCompleted: () => {
    Analytics.trackEvent('Palm Reading Completed');
  },

  trackAstrologyReadingStarted: () => {
    Analytics.trackEvent('Astrology Reading Started');
  },

  trackCompatibilityChecked: (sign1: string, sign2: string) => {
    Analytics.trackEvent('Compatibility Checked', { sign1, sign2 });
  },

  trackZodiacCalculatorUsed: () => {
    Analytics.trackEvent('Zodiac Calculator Used');
  },

  trackReadingQueued: (type: string) => {
    Analytics.trackEvent('Reading Queued', { reading_type: type });
  },

  trackPremiumOffered: (context: string) => {
    Analytics.trackEvent('Premium Offered', { context });
  },

  trackError: (error: string, context?: any) => {
    Analytics.trackEvent('Error Occurred', { error, context });
  },
};

export default Analytics;
