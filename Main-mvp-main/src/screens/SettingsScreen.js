import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';

const SettingsScreen = ({ navigation, onScreenChange }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, toggleLanguage, t } = useLanguage();

  const handleBackToDashboard = () => {
    if (onScreenChange) {
      onScreenChange('Home');
    }
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, titleStyle]}>{t('Settings')}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, titleStyle]}>{t('App Settings')}</Text>
          <Text style={[styles.sectionSubtitle, textStyle]}>{t('Customize your experience')}</Text>
        </View>

        {/* Dark Mode Setting */}
        <View style={[styles.card, cardStyle]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={24} 
                color={isDarkMode ? "#10B981" : "#F59E0B"} 
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Dark Mode')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Switch between light and dark themes')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Language Setting */}
        <View style={[styles.card, cardStyle]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="language" 
                size={24} 
                color="#3B82F6" 
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Language')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Switch between English and Arabic')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Text style={[styles.languageText, titleStyle]}>{language}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Other Settings */}
        <View style={[styles.card, cardStyle]}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Notifications')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Manage your notification preferences')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Privacy & Security')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Manage your privacy and security settings')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Help & Support')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Get help and contact support')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('About')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('App version and information')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, titleStyle]}>{t('Account')}</Text>
        </View>

        <View style={[styles.card, cardStyle]}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Edit Profile')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Update your personal information')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="key-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, titleStyle]}>{t('Change Password')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Update your password')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={() => {
              Alert.alert(
                t('Are you sure you want to logout?'),
                '',
                [
                  {
                    text: t('Cancel'),
                    style: 'cancel',
                  },
                  {
                    text: t('Logout'),
                    style: 'destructive',
                    onPress: () => {
                      // Navigate back to Welcome screen
                      navigation.navigate('Welcome');
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>{t('Logout')}</Text>
                <Text style={[styles.settingDescription, textStyle]}>
                  {t('Sign out of your account')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  headerRight: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  textDark: {
    color: '#D1D5DB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  text: {
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  dangerItem: {
    // No specific styling needed for danger items
  },
  dangerText: {
    color: '#EF4444',
  },
  languageButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsScreen; 