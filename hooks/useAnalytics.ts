// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';

/**
 * Hook to track screen views automatically
 */
export const useScreenTracking = () => {
  const route = useRoute();
  
  useEffect(() => {
    // Track screen view when component mounts
    trackScreenView(route.name);
  }, [route.name]);
};

/**
 * Main analytics hook with all tracking methods
 */
export const useAnalytics = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const trackScreenView = (screenName: string) => {
    console.log(`📱 Screen Viewed: ${screenName}`);
    // In production, integrate with your analytics service:
    // Amplitude.track('Screen Viewed', { screen_name: screenName });
    // Firebase.analytics().logScreenView({ screen_name: screenName });
  };

  const trackEvent = (eventName: string, properties?: any) => {
    console.log(`📊 Event Tracked: ${eventName}`, properties || {});
    // In production:
    // Amplitude.track(eventName, properties);
    // Firebase.analytics().logEvent(eventName, properties);
  };

  const trackFeatureUsed = (feature: string, additionalProps?: any) => {
    const properties = {
      feature_name: feature,
      screen_name: route.name,
      timestamp: new Date().toISOString(),
      ...additionalProps
    };
    console.log(`✨ Feature Used: ${feature}`, properties);
    trackEvent('Feature_Used', properties);
  };

  const trackButtonClick = (buttonName: string, additionalProps?: any) => {
    const properties = {
      button_name: buttonName,
      screen_name: route.name,
      ...additionalProps
    };
    console.log(`🔘 Button Clicked: ${buttonName}`, properties);
    trackEvent('Button_Clicked', properties);
  };

  const trackError = (errorType: string, errorMessage: string, additionalProps?: any) => {
    const properties = {
      error_type: errorType,
      error_message: errorMessage,
      screen_name: route.name,
      timestamp: new Date().toISOString(),
      ...additionalProps
    };
    console.error(`❌ Error Tracked: ${errorType}`, properties);
    trackEvent('Error_Occurred', properties);
  };

  const trackTiming = (category: string, variable: string, time: number) => {
    const properties = {
      timing_category: category,
      timing_variable: variable,
      timing_value: time,
      screen_name: route.name
    };
    console.log(`⏱️ Timing Tracked: ${category} - ${variable}: ${time}ms`, properties);
    trackEvent('Timing_Recorded', properties);
  };

  const trackPurchase = (productId: string, price: number, currency: string = 'USD') => {
    const properties = {
      product_id: productId,
      price: price,
      currency: currency,
      screen_name: route.name,
      timestamp: new Date().toISOString()
    };
    console.log(`💰 Purchase Tracked: ${productId} for ${currency}${price}`, properties);
    trackEvent('Purchase_Completed', properties);
  };

  const trackReadingStarted = (readingType: string) => {
    const properties = {
      reading_type: readingType,
      screen_name: route.name,
      timestamp: new Date().toISOString()
    };
    console.log(`🔮 Reading Started: ${readingType}`, properties);
    trackEvent('Reading_Started', properties);
  };

  const trackReadingCompleted = (readingType: string, duration?: number) => {
    const properties = {
      reading_type: readingType,
      duration_seconds: duration,
      screen_name: route.name,
      timestamp: new Date().toISOString()
    };
    console.log(`✅ Reading Completed: ${readingType}`, properties);
    trackEvent('Reading_Completed', properties);
  };

  const trackSocialShare = (contentType: string, platform: string) => {
    const properties = {
      content_type: contentType,
      platform: platform,
      screen_name: route.name,
      timestamp: new Date().toISOString()
    };
    console.log(`📤 Social Share: ${contentType} on ${platform}`, properties);
    trackEvent('Content_Shared', properties);
  };

  const setUserId = (userId: string) => {
    console.log(`👤 User ID Set: ${userId}`);
    // In production:
    // Amplitude.setUserId(userId);
    // Firebase.analytics().setUserId(userId);
  };

  const setUserProperties = (properties: any) => {
    console.log(`👤 User Properties Set:`, properties);
    // In production:
    // Amplitude.setUserProperties(properties);
    // Firebase.analytics().setUserProperties(properties);
  };

  return {
    // Core tracking methods
    trackScreenView,
    trackEvent,
    trackFeatureUsed,
    trackButtonClick,
    trackError,
    trackTiming,
    
    // Zodia-specific tracking
    trackPurchase,
    trackReadingStarted,
    trackReadingCompleted,
    trackSocialShare,
    
    // User methods
    setUserId,
    setUserProperties,
  };
};

/**
 * Track app lifecycle events
 */
export const useAppLifecycle = () => {
  useEffect(() => {
    // Track app open
    console.log('🚀 App Opened');
    // Amplitude.track('App_Opened');
    
    return () => {
      // Track app close (might not always fire)
      console.log('👋 App Closed');
      // Amplitude.track('App_Closed');
    };
  }, []);
};

// Helper function for tracking screen views (can be used outside of components)
export const trackScreenView = (screenName: string) => {
  console.log(`📱 Screen Viewed: ${screenName}`);
  // Amplitude.track('Screen_Viewed', { screen_name: screenName });
};

export default useAnalytics;