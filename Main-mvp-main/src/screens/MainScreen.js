import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DashboardScreen from './DashboardScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import CalendarScreen from './CalendarScreen';

const MainScreen = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <DashboardScreen navigation={navigation} onScreenChange={setCurrentScreen} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} onScreenChange={setCurrentScreen} />;
      case 'Calendar':
        return <CalendarScreen navigation={navigation} onScreenChange={setCurrentScreen} />;
      case 'Settings':
        return <SettingsScreen navigation={navigation} onScreenChange={setCurrentScreen} />;
      default:
        return <DashboardScreen navigation={navigation} onScreenChange={setCurrentScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainScreen; 