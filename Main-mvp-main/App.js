// App.js - Merged version compatible with your current setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

// Import context providers (keeping your existing structure)
import { DarkModeProvider } from './src/context/DarkModeContext';
import { UserProvider } from './src/context/UserContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Import your existing screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import MainScreen from './src/screens/MainScreen';
import CareerPlanScreen from './src/screens/CareerPlanScreen';

// Import new detail screens (you'll need to create these or they're optional)
import CourseDetailScreen from './src/screens/coursedetail';
import JobDetailScreen from './src/screens/jobdetails';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <DarkModeProvider>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Welcome" // Keep your existing flow
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#556B2F', // Keep your olive color theme
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                {/* Your existing authentication flow */}
                <Stack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{ title: 'Welcome' }}
                />
                <Stack.Screen
                  name="Registration"
                  component={RegistrationScreen}
                  options={{ title: 'Registration' }}
                />
                <Stack.Screen
                  name="Questionnaire"
                  component={QuestionnaireScreen}
                  options={{ title: 'Questionnaire', headerShown: false }}
                />
                <Stack.Screen
                  name="MainScreen"
                  component={MainScreen}
                  options={{ headerShown: false }}
                />

                {/* New detail screens with AI analysis (optional - create these if needed) */}
                <Stack.Screen 
                  name="CourseDetail" 
                  component={CourseDetailScreen}
                  options={{ 
                    title: 'Course Details',
                    headerShown: true,
                    // Add slide-in animation
                    cardStyleInterpolator: ({ current, layouts }) => ({
                      cardStyle: {
                        transform: [
                          {
                            translateX: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [layouts.screen.width, 0],
                            }),
                          },
                        ],
                      },
                    }),
                  }}
                />
                <Stack.Screen 
                  name="JobDetail" 
                  component={JobDetailScreen}
                  options={{ 
                    title: 'Job Details',
                    headerShown: true,
                    // Add slide-in animation
                    cardStyleInterpolator: ({ current, layouts }) => ({
                      cardStyle: {
                        transform: [
                          {
                            translateX: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [layouts.screen.width, 0],
                            }),
                          },
                        ],
                      },
                    }),
                  }}
                />
              </Stack.Navigator>
              <StatusBar style="light" />
            </NavigationContainer>
          </PaperProvider>
        </DarkModeProvider>
      </UserProvider>
    </LanguageProvider>
  );
}