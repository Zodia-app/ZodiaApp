// App.tsx
import React, { useEffect } from 'react';
import Analytics from './services/analytics';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import all your screens
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AstrologyScreen from './screens/AstrologyScreen';
import AstrologyReadingScreen from './screens/AstrologyReadingScreen';
import PalmCameraScreen from './screens/PalmCameraScreen';
import PalmIntroScreen from './screens/PalmIntroScreen';
import PalmReadingResultScreen from './screens/PalmReadingResultScreen';
import CompatibilityAnalysisScreen from './screens/CompatibilityAnalysisScreen';
import ClairvoyanceReadingScreen from './screens/ClairvoyanceReadingScreen';
import ReadingQueueScreen from './screens/ReadingQueueScreen';
import ReadingRequestScreen from './screens/ReadingRequestScreen';
import PremiumPaymentScreen from './screens/PremiumPaymentScreen';
import EditProfileScreen from './screens/EditProfileScreen';
// import ZodiacCalculatorScreen from './screens/ZodiacCalculatorScreen'; // Temporarily comment out

// Add this after your imports in App.tsx
type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  AstrologyScreen: undefined;
  PalmCamera: undefined; // Note: NOT PalmCameraScreen
  PalmIntro: undefined;
  PalmReadingResult: { images: string[] };
  CompatibilityAnalysis: undefined;
  ClairvoyanceReading: undefined;
  ReadingQueue: undefined;
  PremiumPayment: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#B19CD9',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  // You can add authentication logic here to determine initial route
  const isAuthenticated = false; // Replace with actual auth check

  // Analytics initialization should be inside the component
  useEffect(() => {
    // Initialize analytics
    Analytics.init();
    Analytics.trackAppOpen();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "MainTabs" : "Welcome"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a0033',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />

        {/* Main App */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Astrology Flow */}
        <Stack.Screen 
          name="AstrologyScreen" 
          component={AstrologyScreen}
          options={{ title: 'Astrology' }}
        />
        
        <Stack.Screen 
          name="PalmCamera" 
          component={PalmCameraScreen}
          options={{ headerShown: false }}
        />

        {/* Palm Reading Flow */}
        <Stack.Screen 
          name="PalmIntro" 
          component={PalmIntroScreen}
          options={{ title: 'Palm Reading' }}
        />

        <Stack.Screen 
          name="PalmReadingResult" 
          component={PalmReadingResultScreen}
          options={{ title: 'Your Palm Reading' }}
        />

        {/* Compatibility Flow */}
        <Stack.Screen 
          name="CompatibilityAnalysis" 
          component={CompatibilityAnalysisScreen}
          options={{ title: 'Compatibility Analysis' }}
        />

        {/* Clairvoyance Flow */}
        <Stack.Screen 
          name="ClairvoyanceReading" 
          component={ClairvoyanceReadingScreen}
          options={{ title: 'Clairvoyance Reading' }}
        />

        {/* Other Screens */}
        <Stack.Screen 
          name="ReadingQueue" 
          component={ReadingQueueScreen}
          options={{ title: 'Processing Your Reading' }}
        />
        <Stack.Screen 
          name="PremiumPayment" 
          component={PremiumPaymentScreen}
          options={{ title: 'Unlock Premium' }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ title: 'Edit Profile' }}
        />
        {/* Temporarily comment out until ZodiacCalculatorScreen is fixed
        <Stack.Screen 
          name="ZodiacCalculator" 
          component={ZodiacCalculatorScreen}
          options={{ title: 'Zodiac Calculator' }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}