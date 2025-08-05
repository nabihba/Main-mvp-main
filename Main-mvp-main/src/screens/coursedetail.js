// App.js - Navigation setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomepageScreen from './screens/HomepageScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide default header since you have custom headers
        }}
      >
        <Stack.Screen name="Home" component={HomepageScreen} />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Don't forget to install the required packages:
// npm install @react-navigation/native @react-navigation/stack
// npx expo install react-native-screens react-native-safe-area-context