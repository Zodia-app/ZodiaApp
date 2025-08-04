import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

// Import your screens
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AstrologyScreen from './screens/AstrologyScreen';

// Import new Reading screens
import ReadingRequestScreen from './screens/ReadingRequestScreen';
import AstrologyReadingScreen from './screens/AstrologyReadingScreen';
import PalmCameraScreen from './screens/PalmCameraScreen';
import PremiumPaymentScreen from './screens/PremiumPaymentScreen';

// Import Compatibility Analysis screen
import CompatibilityAnalysisScreen from './screens/CompatibilityAnalysisScreen';

// Import the test component
import ZodiacCalculatorTest from './components/ZodiacCalculatorTest';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        
        {/* Astrology Feature Screen */}
        <Stack.Screen 
          name="Astrology" 
          component={AstrologyScreen}
          options={{
            headerShown: false,
          }}
        />
        
        {/* Reading Request Flow Screens */}
        <Stack.Screen 
          name="ReadingRequest" 
          component={ReadingRequestScreen}
          options={{ 
            title: 'Choose Reading',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0D0D0D',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        <Stack.Screen 
          name="AstrologyReading" 
          component={AstrologyReadingScreen}
          options={{ 
            title: 'Astrology Reading',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0D0D0D',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        <Stack.Screen 
          name="PalmCamera" 
          component={PalmCameraScreen}
          options={{ 
            title: 'Palm Reading',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0D0D0D',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        <Stack.Screen 
          name="PremiumPayment" 
          component={PremiumPaymentScreen}
          options={{ 
            title: 'Premium Clairvoyance',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#0D0D0D',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        {/* Compatibility Analysis Screen */}
        <Stack.Screen 
          name="CompatibilityAnalysis" 
          component={CompatibilityAnalysisScreen}
          options={{ 
            title: 'Zodiac Compatibility',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1a1a2e',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontFamily: 'Cinzel-SemiBold', // If you have this font installed
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            headerLeftContainerStyle: {
              paddingLeft: 10,
            },
          }}
        />
        
        {/* Add the Zodiac Calculator Test screen */}
        <Stack.Screen 
          name="ZodiacTest" 
          component={ZodiacCalculatorTest}
          options={{
            headerShown: true,
            headerTitle: 'Zodiac Calculator Test',
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});