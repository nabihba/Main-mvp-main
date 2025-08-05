import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';

const CourseDetailModal = ({ visible, course, onClose }) => {
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  
  if (!course) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>{t('Course Details')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Course Title and Provider */}
          <View style={styles.titleSection}>
            <Text style={[styles.courseTitle, isDarkMode && styles.courseTitleDark]}>{course.title}</Text>
            <Text style={[styles.providerInfo, isDarkMode && styles.providerInfoDark]}>{course.provider}</Text>
          </View>

          {/* Course Overview */}
          <View style={styles.overviewContainer}>
            <View style={[styles.overviewCard, isDarkMode && styles.overviewCardDark]}>
              <Ionicons name="globe-outline" size={20} color="#6B7280" />
              <Text style={[styles.overviewLabel, isDarkMode && styles.overviewLabelDark]}>{course.delivery}</Text>
              <Text style={[styles.overviewDescription, isDarkMode && styles.overviewDescriptionDark]}>{t('Delivery')}</Text>
            </View>
            <View style={[styles.overviewCard, isDarkMode && styles.overviewCardDark]}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={[styles.overviewLabel, isDarkMode && styles.overviewLabelDark]}>{course.duration}</Text>
              <Text style={[styles.overviewDescription, isDarkMode && styles.overviewDescriptionDark]}>{t('Duration')}</Text>
            </View>
            <View style={[styles.overviewCard, isDarkMode && styles.overviewCardDark]}>
              <Ionicons name="trending-up-outline" size={20} color="#6B7280" />
              <Text style={[styles.overviewLabel, isDarkMode && styles.overviewLabelDark]}>{course.level}</Text>
              <Text style={[styles.overviewDescription, isDarkMode && styles.overviewDescriptionDark]}>{t('Level')}</Text>
            </View>
            <View style={[styles.overviewCard, isDarkMode && styles.overviewCardDark]}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text style={[styles.overviewLabel, isDarkMode && styles.overviewLabelDark]}>{course.price}</Text>
              <Text style={[styles.overviewDescription, isDarkMode && styles.overviewDescriptionDark]}>{t('Price')}</Text>
            </View>
          </View>

          {/* Why This Course Will Help You */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#065F46" />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Why This Course Will Help You')}</Text>
            </View>
            <View style={[styles.helpCard, isDarkMode && styles.helpCardDark]}>
              <Text style={[styles.helpText, isDarkMode && styles.helpTextDark]}>
                {course.helpReason || t("This course is designed to enhance your skills and knowledge in the field. It's perfect for your current experience level and career goals.")}
              </Text>
            </View>
          </View>

          {/* Skills You'll Develop */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="target" size={20} color="#EA580C" />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Skills You\'ll Develop')}</Text>
            </View>
            <View style={styles.skillsContainer}>
              {course.skills?.map((skill, index) => (
                <View key={index} style={[styles.skillTag, isDarkMode && styles.skillTagDark]}>
                  <Text style={[styles.skillText, isDarkMode && styles.skillTextDark]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Course Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Course Description')}</Text>
            <Text style={[styles.descriptionText, isDarkMode && styles.descriptionTextDark]}>{course.description}</Text>
          </View>

          {/* Course Outline */}
          {course.outline && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Course Outline')}</Text>
              {course.outline.map((item, index) => (
                <View key={index} style={[styles.moduleItem, isDarkMode && styles.moduleItemDark]}>
                  <View style={styles.moduleHeader}>
                    <Text style={styles.moduleNumber}>Module {index + 1}</Text>
                    <Text style={[styles.moduleDuration, isDarkMode && styles.moduleDurationDark]}>{item.duration}</Text>
                  </View>
                  <Text style={[styles.moduleTitle, isDarkMode && styles.moduleTitleDark]}>{item.title}</Text>
                  <Text style={[styles.moduleDescription, isDarkMode && styles.moduleDescriptionDark]}>{item.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Prerequisites */}
          {course.prerequisites && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('Prerequisites')}</Text>
              {course.prerequisites.map((prerequisite, index) => (
                <View key={index} style={[styles.prerequisiteItem, isDarkMode && styles.prerequisiteItemDark]}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.prerequisiteText, isDarkMode && styles.prerequisiteTextDark]}>{prerequisite}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, isDarkMode && styles.footerDark]}>
          <TouchableOpacity style={styles.enrollButton}>
            <Text style={styles.enrollButtonText}>{t('Enroll Now')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  courseTitleDark: {
    color: '#10B981',
  },
  providerInfo: {
    fontSize: 16,
    color: '#6B7280',
  },
  providerInfoDark: {
    color: '#9CA3AF',
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  overviewCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  overviewCardDark: {
    backgroundColor: '#374151',
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  overviewLabelDark: {
    color: '#F9FAFB',
  },
  overviewDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  overviewDescriptionDark: {
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  helpCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  helpCardDark: {
    backgroundColor: '#064E3B',
    borderLeftColor: '#10B981',
  },
  helpText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  helpTextDark: {
    color: '#D1FAE5',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  skillTagDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#60A5FA',
  },
  skillText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  skillTextDark: {
    color: '#93C5FD',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  descriptionTextDark: {
    color: '#D1D5DB',
  },
  moduleItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moduleItemDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  moduleDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  moduleDurationDark: {
    color: '#9CA3AF',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  moduleTitleDark: {
    color: '#F9FAFB',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  moduleDescriptionDark: {
    color: '#9CA3AF',
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prerequisiteText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  prerequisiteTextDark: {
    color: '#D1D5DB',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#065F46',
    paddingVertical: 16,
    borderRadius: 12,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CourseDetailModal; 