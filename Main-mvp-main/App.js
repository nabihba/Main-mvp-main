import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { DarkModeProvider } from './src/context/DarkModeContext';
import { UserProvider } from './src/context/UserContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import MainScreen from './src/screens/MainScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <DarkModeProvider>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#556B2F', // Olive color
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
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
              </Stack.Navigator>
              <StatusBar style="light" />
            </NavigationContainer>
          </PaperProvider>
        </DarkModeProvider>
      </UserProvider>
    </LanguageProvider>
  );
}