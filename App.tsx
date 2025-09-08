// App.tsx
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

// Import core screens
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';

// Import palm reading screens
import PalmIntroScreen from './screens/PalmIntroScreen';
import { PalmReadingFormScreen } from './screens/PalmReading/PalmReadingFormScreen';
import { PalmReadingWaitingScreen } from './screens/PalmReading/PalmReadingWaitingScreen';
import { PalmReadingResult } from './screens/PalmReading/PalmReadingResult';

// Import compatibility screens
import CompatibilityIntroScreen from './screens/Compatibility/CompatibilityIntroScreen';
import CreateProfileScreen from './screens/Compatibility/CreateProfileScreen';
import CompatibilityDashboard from './screens/Compatibility/CompatibilityDashboard';
import { FriendModeScreen } from './screens/Compatibility/FriendModeScreen';
import { FriendCompatibilityResult } from './screens/Compatibility/FriendCompatibilityResult';
import { DatingModeScreen } from './screens/Dating/DatingModeScreen';
import { DatingDashboard } from './screens/Dating/DatingDashboard';
import { SocialModeScreen } from './screens/Social/SocialModeScreen';
import { SocialCompatibilityResult } from './screens/Social/SocialCompatibilityResult';

// Import ErrorBoundary
import { ErrorBoundary } from './components/ErrorBoundary';

export type RootStackParamList = {
  PalmIntro: undefined;
  PalmReadingForm: undefined;
  PalmReadingWaiting: { 
    userData: any;
    palmData: any;
  };
  PalmReadingResult: {
    readingData: any;
  };
  OnboardingScreen: undefined;
  Profile: undefined;
  EditProfile: undefined;
  CompatibilityIntro: undefined;
  CreateProfile: undefined;
  CompatibilityDashboard: undefined;
  SocialCompatibilityIntro: undefined;
  SocialCodeInput: { prefillCode?: string };
  SocialModeScreen: undefined;
  SocialMode: undefined;
  FriendMode: undefined;
  FriendModeScreen: { userReading: any };
  FriendCompatibilityResult: { 
    userReading: any; 
    friendData: any;
  };
  CompatibilityResult: {
    userReading: any;
    partnerCode: string;
  };
  SocialCompatibilityResult: {
    userReading: any;
    partnerCode: string;
  };
  DatingMode: undefined;
  DatingDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Deep linking configuration
const linking = {
  prefixes: ['https://zodia.app', 'zodia://'],
  config: {
    screens: {
      PalmIntro: 'palm-intro',
      SocialMode: 'compatibility/:code',
      PalmReadingResult: 'reading-result',
    },
  },
};

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Handle deep links when app is already open
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('/compatibility/')) {
        const code = url.split('/compatibility/')[1];
        console.log('Compatibility code from deep link:', code);
        
        // Navigate to social mode with prefilled code
        if (navigationRef.current) {
          navigationRef.current.navigate('SocialMode', {
            prefilledCode: code,
            autoEnterMode: true
          });
        }
      }
    };

    // Listen for incoming links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);
  return (
    <ErrorBoundary>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator
          initialRouteName="PalmIntro"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          {/* Main Palm Reading Flow */}
          <Stack.Screen 
            name="PalmIntro" 
            component={PalmIntroScreen}
            options={{ 
              title: 'Palm Reading Intro',
              gestureEnabled: false // Prevent back gesture on main screen
            }}
          />

          <Stack.Screen 
            name="PalmReadingForm" 
            component={PalmReadingFormScreen}
            options={{ 
              title: 'Palm Reading Details',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="PalmReadingWaiting" 
            component={PalmReadingWaitingScreen}
            options={{ 
              gestureEnabled: false // Prevent back during analysis
            }}
          />

          <Stack.Screen 
            name="PalmReadingResult" 
            component={PalmReadingResult}
            options={{ 
              title: 'Your Palm Reading',
              gestureEnabled: false // Prevent accidental back from results
            }}
          />

          {/* Compatibility Screens */}
          <Stack.Screen 
            name="CompatibilityIntro" 
            component={CompatibilityIntroScreen}
            options={{ 
              title: 'Compatibility',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="CreateProfile" 
            component={CreateProfileScreen}
            options={{ 
              title: 'Create Profile',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="CompatibilityDashboard" 
            component={CompatibilityDashboard}
            options={{ 
              title: 'Compatibility Dashboard',
              animation: 'slide_from_right'
            }}
          />

          {/* Friend Mode Screens */}
          <Stack.Screen 
            name="FriendMode" 
            component={FriendModeScreen}
            options={{ 
              title: 'Friend Mode',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="FriendCompatibilityResult" 
            component={FriendCompatibilityResult}
            options={{ 
              title: 'Friend Compatibility',
              gestureEnabled: false // Prevent back during results display
            }}
          />

          {/* Dating Mode Screens */}
          <Stack.Screen 
            name="DatingMode" 
            component={DatingModeScreen}
            options={{ 
              title: 'Dating Mode',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="DatingDashboard" 
            component={DatingDashboard}
            options={{ 
              title: 'Dating Dashboard',
              gestureEnabled: false // Prevent accidental back from matches
            }}
          />

          {/* Social Mode Screens */}
          <Stack.Screen 
            name="SocialMode" 
            component={SocialModeScreen}
            options={{ 
              title: 'Social Mode',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="SocialCompatibilityResult" 
            component={SocialCompatibilityResult}
            options={{ 
              title: 'Social Compatibility',
              gestureEnabled: false // Prevent back during results display
            }}
          />
          
          {/* Optional Profile Screens (if needed) */}
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
          
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ title: 'Edit Profile' }}
          />
          
          {/* Friend Mode Screen */}
          <Stack.Screen 
            name="FriendModeScreen" 
            component={FriendModeScreen}
            options={{ 
              title: 'Friend Mode',
              gestureEnabled: true
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}