// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

// Import ErrorBoundary
import { ErrorBoundary } from './components/ErrorBoundary';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
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
            name="PalmReadingWaitingScreen" 
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
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}