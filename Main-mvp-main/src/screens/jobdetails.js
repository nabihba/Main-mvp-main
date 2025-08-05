import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JobDetailsScreen = () => {
  const [coverLetter, setCoverLetter] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Job Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>Junior Frontend Developer</Text>
          <Text style={styles.companyLocation}>Gulf Tech Solutions • Dubai, UAE</Text>
        </View>

        {/* Job Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={24} color="#6b7280" />
            <Text style={styles.infoCardTitle}>Hybrid</Text>
            <Text style={styles.infoCardSubtitle}>Work Type</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="briefcase-outline" size={24} color="#6b7280" />
            <Text style={styles.infoCardTitle}>Entry Level</Text>
            <Text style={styles.infoCardSubtitle}>Level</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={24} color="#6b7280" />
            <Text style={styles.infoCardTitle}>$3000K - $4500K</Text>
            <Text style={styles.infoCardSubtitle}>Salary</Text>
          </View>
        </View>

        {/* Why This Job Suits You */}
        <View style={styles.suitabilitySection}>
          <View style={styles.suitabilityHeader}>
            <View style={styles.targetIcon}>
              <Ionicons name="radio-button-on" size={20} color="#10b981" />
            </View>
            <Text style={styles.suitabilityTitle}>Why This Job Suits You</Text>
          </View>
          <View style={styles.suitabilityContent}>
            <Text style={styles.suitabilityText}>
              Your Computer Science background and technical skills align perfectly with this role. The company values fresh graduates with strong fundamentals.
            </Text>
          </View>
        </View>

        {/* Your Matching Skills */}
        <View style={styles.skillsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Your Matching Skills</Text>
          </View>
          
          <View style={styles.skillsGrid}>
            <View style={styles.matchingSkill}>
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              <Text style={styles.matchingSkillText}>JavaScript</Text>
            </View>
            <View style={styles.matchingSkill}>
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              <Text style={styles.matchingSkillText}>Problem-solving</Text>
            </View>
            <View style={styles.matchingSkillLarge}>
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              <Text style={styles.matchingSkillText}>Technical learning ability</Text>
            </View>
          </View>
        </View>

        {/* Required Skills */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          
          <View style={styles.requiredSkillsGrid}>
            <View style={styles.requiredSkill}>
              <Text style={styles.requiredSkillText}>JavaScript</Text>
            </View>
            <View style={styles.requiredSkill}>
              <Text style={styles.requiredSkillText}>React</Text>
            </View>
            <View style={styles.requiredSkill}>
              <Text style={styles.requiredSkillText}>HTML/CSS</Text>
            </View>
            <View style={styles.requiredSkill}>
              <Text style={styles.requiredSkillText}>Git</Text>
            </View>
          </View>
        </View>

        {/* Soft Skills */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Soft Skills for Success</Text>
          
          <View style={styles.softSkillsContainer}>
            <View style={styles.softSkill}>
              <Text style={styles.softSkillText}>Team collaboration</Text>
            </View>
            <View style={styles.softSkill}>
              <Text style={styles.softSkillText}>Communication with clients</Text>
            </View>
            <View style={styles.softSkill}>
              <Text style={styles.softSkillText}>Adaptability to new technologies</Text>
            </View>
          </View>
        </View>

        {/* Career Growth */}
        <View style={styles.careerGrowthSection}>
          <Text style={styles.careerGrowthTitle}>Career Growth Potential</Text>
          <Text style={styles.careerGrowthText}>
            This entry-level position offers mentorship programs and clear advancement to Senior Developer within 2-3 years.
          </Text>
        </View>

        {/* Job Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            applications using React and TypeScript
          </Text>
        </View>

        {/* Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>Bachelor's in CS or related field</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>Experience with React</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>Strong HTML/CSS skills</Text>
            </View>
          </View>
        </View>

        {/* CV Info */}
        <View style={styles.cvInfoSection}>
          <View style={styles.cvInfoHeader}>
            <Ionicons name="document-text" size={20} color="#3b82f6" />
            <Text style={styles.cvInfoTitle}>Your CV Will Be Sent</Text>
          </View>
          <Text style={styles.cvInfoText}>
            When you apply, your CV and profile information will be automatically sent to Gulf Tech Solutions's hiring team. Make sure your profile is up-to-date for the best impression.
          </Text>
        </View>

        {/* Apply Section */}
        <View style={styles.applySection}>
          <View style={styles.applySectionHeader}>
            <Ionicons name="folder-outline" size={20} color="#b45309" />
            <Text style={styles.applySectionTitle}>Apply for This Position</Text>
          </View>
          
          <TextInput
            style={styles.coverLetterInput}
            placeholder="Add an optional cover letter or introduction message..."
            placeholderTextColor="#9ca3af"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applyButton}>
              <Ionicons name="document-text" size={16} color="#ffffff" />
              <Text style={styles.applyButtonText}>Send CV & Apply</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Job</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
  },
  companyLocation: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  infoCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoCardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  suitabilitySection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  suitabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetIcon: {
    marginRight: 8,
  },
  suitabilityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },
  suitabilityContent: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
  },
  suitabilityText: {
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
  },
  skillsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchingSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  matchingSkillLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    width: '100%',
    marginBottom: 8,
  },
  matchingSkillText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '500',
    marginLeft: 6,
  },
  requiredSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requiredSkill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  requiredSkillText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  softSkillsContainer: {
    gap: 8,
  },
  softSkill: {
    backgroundColor: '#faf5ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  softSkillText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
  },
  careerGrowthSection: {
    marginHorizontal: 20,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  careerGrowthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  careerGrowthText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  requirementsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  requirementsList: {
    marginTop: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6b7280',
    marginRight: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  cvInfoSection: {
    marginHorizontal: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  cvInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cvInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
    marginLeft: 8,
  },
  cvInfoText: {
    fontSize: 14,
    color: '#1d4ed8',
    lineHeight: 20,
  },
  applySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  applySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  applySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  coverLetterInput: {
    borderWidth: 2,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 16,
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobDetailsScreen;