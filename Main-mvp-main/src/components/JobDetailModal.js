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
import { useLanguage } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';

const JobDetailModal = ({ visible, job, onClose }) => {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  
  if (!job) return null;

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const headerStyle = isDarkMode ? styles.headerDark : styles.header;
  const headerTitleStyle = isDarkMode ? styles.headerTitleDark : styles.headerTitle;
  const closeButtonColor = isDarkMode ? '#FFFFFF' : '#1F2937';
  const contentStyle = isDarkMode ? styles.contentDark : styles.content;
  const jobTitleStyle = isDarkMode ? styles.jobTitleDark : styles.jobTitle;
  const companyInfoStyle = isDarkMode ? styles.companyInfoDark : styles.companyInfo;
  const attributeCardStyle = isDarkMode ? styles.attributeCardDark : styles.attributeCard;
  const attributeLabelStyle = isDarkMode ? styles.attributeLabelDark : styles.attributeLabel;
  const attributeDescriptionStyle = isDarkMode ? styles.attributeDescriptionDark : styles.attributeDescription;
  const sectionTitleStyle = isDarkMode ? styles.sectionTitleDark : styles.sectionTitle;
  const suitabilityCardStyle = isDarkMode ? styles.suitabilityCardDark : styles.suitabilityCard;
  const suitabilityTextStyle = isDarkMode ? styles.suitabilityTextDark : styles.suitabilityText;
  const skillTagStyle = isDarkMode ? styles.skillTagDark : styles.skillTag;
  const skillTextStyle = isDarkMode ? styles.skillTextDark : styles.skillText;
  const descriptionTextStyle = isDarkMode ? styles.descriptionTextDark : styles.descriptionText;
  const requirementTextStyle = isDarkMode ? styles.requirementTextDark : styles.requirementText;
  const footerStyle = isDarkMode ? styles.footerDark : styles.footer;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={containerStyle}>
        {/* Header */}
        <View style={headerStyle}>
          <Text style={headerTitleStyle}>{t('Job Details')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={closeButtonColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={contentStyle} showsVerticalScrollIndicator={false}>
          {/* Job Title and Company */}
          <View style={styles.titleSection}>
            <Text style={jobTitleStyle}>{job.title}</Text>
            <Text style={companyInfoStyle}>{job.company} • {job.location}</Text>
          </View>

          {/* Job Attributes */}
          <View style={styles.attributesContainer}>
            <View style={attributeCardStyle}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={attributeLabelStyle}>{job.workType}</Text>
              <Text style={attributeDescriptionStyle}>{t('Work Type')}</Text>
            </View>
            <View style={attributeCardStyle}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
              <Text style={attributeLabelStyle}>{job.level}</Text>
              <Text style={attributeDescriptionStyle}>{t('Level')}</Text>
            </View>
            <View style={attributeCardStyle}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text style={attributeLabelStyle}>{job.salary}</Text>
              <Text style={attributeDescriptionStyle}>{t('Salary')}</Text>
            </View>
          </View>

          {/* Why This Job Suits You */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="target" size={20} color="#10B981" />
              <Text style={sectionTitleStyle}>{t('Why This Job Suits You')}</Text>
            </View>
            <View style={suitabilityCardStyle}>
              <Text style={suitabilityTextStyle}>
                {job.suitabilityReason || t("Your background and skills align perfectly with this role. The company values candidates with your experience level.")}
              </Text>
            </View>
          </View>

          {/* Your Matching Skills */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
              <Text style={sectionTitleStyle}>{t('Matching Skills')}</Text>
            </View>
            <View style={styles.skillsContainer}>
              {job.matchingSkills?.map((skill, index) => (
                <View key={index} style={skillTagStyle}>
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                  <Text style={skillTextStyle}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Job Description */}
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>{t('Description')}</Text>
            <Text style={descriptionTextStyle}>{job.description}</Text>
          </View>

          {/* Requirements */}
          {job.requirements && (
            <View style={styles.section}>
              <Text style={sectionTitleStyle}>{t('Requirements')}</Text>
              {job.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                  <Text style={requirementTextStyle}>{requirement}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Apply Button */}
        <View style={footerStyle}>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>{t('Apply Now')}</Text>
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
    backgroundColor: '#1F2937',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerTitleDark: {
    fontSize: 18,
    fontWeight: '600',
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
  contentDark: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#1F2937',
  },
  titleSection: {
    marginBottom: 24,
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  jobTitleDark: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 16,
    color: '#6B7280',
  },
  companyInfoDark: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  attributesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  attributeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  attributeCardDark: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#4B5563',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  attributeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  attributeLabelDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 8,
    textAlign: 'center',
  },
  attributeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  attributeDescriptionDark: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D5DB',
    marginLeft: 8,
  },
  suitabilityCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  suitabilityCardDark: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  suitabilityText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  suitabilityTextDark: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  skillTagDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  skillText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
    marginLeft: 4,
  },
  skillTextDark: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  descriptionTextDark: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  requirementTextDark: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerDark: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#374151',
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#065F46',
    paddingVertical: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default JobDetailModal; 