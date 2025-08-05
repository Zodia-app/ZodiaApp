// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Import all your actual screens
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AstrologyScreen from './screens/AstrologyScreen';
import AstrologyReadingScreen from './screens/AstrologyReadingScreen';
import PalmCameraScreen from './screens/PalmCameraScreen';
import PalmReadingResultScreen from './screens/PalmReadingResultScreen';
import CompatibilityAnalysisScreen from './screens/CompatibilityAnalysisScreen';
import CompatibilityInputScreen from './screens/CompatibilityInputScreen';
import ClairvoyanceReadingScreen from './screens/ClairvoyanceReadingScreen';
import ReadingQueueScreen from './screens/ReadingQueueScreen';
import ReadingRequestScreen from './screens/ReadingRequestScreen';
import PremiumPaymentScreen from './screens/PremiumPaymentScreen';
import EditProfileScreen from './screens/EditProfileScreen';

// Import ErrorBoundary
import { ErrorBoundary } from './components/ErrorBoundary';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder for missing screens
const PlaceholderScreen = ({ route }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
    <Text style={{ color: '#fff', fontSize: 18 }}>{route.name} - Coming Soon</Text>
  </View>
);

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Reports" component={ProfileScreen} /> 
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="More" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
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

          {/* Feature Screens */}
          <Stack.Screen 
            name="AstrologyScreen" 
            component={AstrologyScreen}
            options={{ title: 'Astrology', headerShown: false }}
          />
          
          <Stack.Screen 
            name="PalmCamera" 
            component={PalmCameraScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen 
            name="PalmIntro" 
            component={PlaceholderScreen}  // Using placeholder since it doesn't exist
            options={{ title: 'Palm Reading', headerShown: false }}
          />

          <Stack.Screen 
            name="PalmReadingResult" 
            component={PalmReadingResultScreen}
            options={{ title: 'Your Palm Reading', headerShown: false }}
          />

          <Stack.Screen 
            name="CompatibilityAnalysis" 
            component={CompatibilityAnalysisScreen}
            options={{ title: 'Compatibility Analysis', headerShown: false }}
          />

          <Stack.Screen 
            name="CompatibilityInput" 
            component={CompatibilityInputScreen}
            options={{ title: 'Enter Partner Details', headerShown: false }}
          />

          <Stack.Screen 
            name="ClairvoyanceReading" 
            component={ClairvoyanceReadingScreen}
            options={{ title: 'Clairvoyance Reading', headerShown: false }}
          />

          <Stack.Screen 
            name="ReadingQueue" 
            component={ReadingQueueScreen}
            options={{ title: 'Processing Your Reading', headerShown: false }}
          />
          
          <Stack.Screen 
            name="ReadingRequest" 
            component={ReadingRequestScreen}
            options={{ title: 'Request a Reading', headerShown: false }}
          />
          
          <Stack.Screen 
            name="PremiumPayment" 
            component={PremiumPaymentScreen}
            options={{ title: 'Unlock Premium', headerShown: false }}
          />
          
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ title: 'Edit Profile', headerShown: false }}
          />
          
          <Stack.Screen 
            name="DreamInterpreter" 
            component={PlaceholderScreen}
            options={{ title: 'Dream Interpreter', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}