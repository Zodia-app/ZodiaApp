// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Import all screens
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AstrologyScreen from './screens/AstrologyScreen';
import AstrologyReadingScreen from './screens/AstrologyReadingScreen';
import MonthlyAstrologyReport from './screens/MonthlyAstrologyReport';
import AstrologyDetailedFormScreen from './screens/AstrologyDetailedFormScreen';
import AstrologyReadingResultScreen from './screens/AstrologyReadingResultScreen';
import PalmCameraScreen from './screens/PalmCameraScreen';
import { PalmReadingResult } from './screens/PalmReading/PalmReadingResult';
import CompatibilityAnalysisScreen from './screens/CompatibilityAnalysisScreen';
import CompatibilityInputScreen from './screens/CompatibilityInputScreen';
import ClairvoyanceReadingScreen from './screens/ClairvoyanceReadingScreen';
import ReadingQueueScreen from './screens/ReadingQueueScreen';
import ReadingRequestScreen from './screens/ReadingRequestScreen';
import EditProfileScreen from './screens/EditProfileScreen';

// Import new screens
import ReadingChoiceScreen from './screens/ReadingChoiceScreen';
import PalmIntroScreen from './screens/PalmIntroScreen';
import DreamInterpreterScreen from './screens/DreamInterpreterScreen';
import DailyReportDetailScreen from './screens/DailyReportDetailScreen';
import EducationalLibraryScreen from './screens/EducationalLibraryScreen';

// Import palm reading screens
import { PalmReadingFormScreen } from './screens/PalmReading/PalmReadingFormScreen';
import { PalmReadingWaitingScreen } from './screens/PalmReading/PalmReadingWaitingScreen';

// Import ErrorBoundary
import { ErrorBoundary } from './components/ErrorBoundary';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder for any still missing screens
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
          } else if (route.name === 'Library') {
            iconName = focused ? 'book' : 'book-outline';
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
      <Tab.Screen name="Library" component={EducationalLibraryScreen} />
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
          
          {/* Reading Choice (After Onboarding) */}
          <Stack.Screen 
            name="ReadingChoice" 
            component={ReadingChoiceScreen}
            options={{ headerShown: false }}
          />

          {/* Main App */}
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false }}
          />

          {/* Dashboard - Also add standalone */}
          <Stack.Screen 
            name="DashboardScreen" 
            component={DashboardScreen}
            options={{ headerShown: false }}
          />

          {/* Astrology Feature Screens */}
          <Stack.Screen 
            name="Astrology" 
            component={AstrologyScreen}
            options={{ title: 'Astrology', headerShown: false }}
          />

          <Stack.Screen 
            name="AstrologyReading" 
            component={AstrologyReadingScreen}
            options={{ title: 'Astrology Reading', headerShown: false }}
          />

          <Stack.Screen 
            name="MonthlyAstrologyReport" 
            component={MonthlyAstrologyReport}
            options={{ 
              title: 'Monthly Report', 
              headerShown: false,
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="AstrologyDetailedForm" 
            component={AstrologyDetailedFormScreen}
            options={{ 
              title: 'Cosmic Consultation', 
              headerShown: false,
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="AstrologyReadingResult" 
            component={AstrologyReadingResultScreen}
            options={{ 
              title: 'Your Reading', 
              headerShown: false,
              animation: 'slide_from_bottom'
            }}
          />
          
          {/* Palm Reading Screens */}
          <Stack.Screen 
            name="PalmIntro" 
            component={PalmIntroScreen}
            options={{ title: 'Palm Reading Intro', headerShown: false }}
          />
          
          <Stack.Screen 
            name="PalmIntroScreen" 
            component={PalmIntroScreen}
            options={{ title: 'Palm Reading Intro', headerShown: false }}
          />

          {/* New Palm Reading Flow Screens */}
          <Stack.Screen 
            name="PalmReadingForm" 
            component={PalmReadingFormScreen}
            options={{ 
              title: 'Palm Reading Details', 
              headerShown: false,
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen 
            name="PalmReadingFormScreen" 
            component={PalmReadingFormScreen}
            options={{ 
              title: 'Palm Reading Details', 
              headerShown: false
            }}
          />

          <Stack.Screen 
            name="PalmReadingWaitingScreen" 
            component={PalmReadingWaitingScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen 
            name="PalmCamera" 
            component={PalmCameraScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen 
            name="PalmReadingResult" 
            component={PalmReadingResult}
            options={{ title: 'Your Palm Reading' }}
          />
          
          {/* Dream Interpreter */}
          <Stack.Screen 
            name="DreamInterpreter" 
            component={DreamInterpreterScreen}
            options={{ title: 'Dream Interpreter', headerShown: false }}
          />
          
          {/* Daily Report */}
          <Stack.Screen 
            name="DailyReportDetail" 
            component={DailyReportDetailScreen}
            options={{ title: 'Daily Report', headerShown: false }}
          />
          
          {/* Educational Library */}
          <Stack.Screen 
            name="EducationalLibrary" 
            component={EducationalLibraryScreen}
            options={{ title: 'Educational Library', headerShown: false }}
          />

          {/* Compatibility */}
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

          {/* Clairvoyance */}
          <Stack.Screen 
            name="ClairvoyanceReading" 
            component={ClairvoyanceReadingScreen}
            options={{ title: 'Clairvoyance Reading', headerShown: false }}
          />

          {/* Reading Queue & Requests */}
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
          
          {/* Profile Management */}
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ title: 'Edit Profile', headerShown: false }}
          />
          
          {/* Placeholder Screens */}
          <Stack.Screen 
            name="ArticleDetail" 
            component={PlaceholderScreen}
            options={{ title: 'Article', headerShown: false }}
          />

          <Stack.Screen 
            name="Education" 
            component={PlaceholderScreen}
            options={{ title: 'Learn', headerShown: false }}
          />

          <Stack.Screen 
            name="WeeklyHoroscope" 
            component={PlaceholderScreen}
            options={{ title: 'Weekly Forecast', headerShown: false }}
          />

          <Stack.Screen 
            name="ZodiacTest" 
            component={PlaceholderScreen}
            options={{ title: 'Zodiac Calculator Test', headerShown: false }}
          />

          <Stack.Screen 
            name="Clairvoyance" 
            component={PlaceholderScreen}
            options={{ title: 'Clairvoyance', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}