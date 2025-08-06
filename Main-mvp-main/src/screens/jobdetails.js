import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getDetailedAiAnalysis } from '../services/aiService';

const JobDetailScreen = ({ navigation, route }) => {
  const { job } = route.params;
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const { userData } = useUser();

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (job && userData) {
      performAiAnalysis();
    }
  }, [job?.id, userData?.uid]);

  const performAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      console.log('Starting AI analysis for job:', job.title);
      const analysis = await getDetailedAiAnalysis(job, userData, 'job');
      setAiAnalysis(analysis);
      console.log('AI analysis completed:', analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAnalysisError('Unable to generate AI analysis at this time.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (job.url || job.applyUrl) {
      const url = job.url || job.applyUrl;
      Linking.openURL(url).catch(() => {
        Alert.alert(t('Error'), t('Unable to open job application link'));
      });
    } else {
      Alert.alert(t('Info'), t('Job application link not available'));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🎯';
    if (score >= 60) return '👍';
    return '🤔';
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'entry': return '#10B981';
      case 'mid': case 'intermediate': return '#F59E0B';
      case 'senior': case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getWorkTypeIcon = (workType) => {
    switch (workType?.toLowerCase()) {
      case 'remote': return 'home-outline';
      case 'hybrid': return 'business-outline';
      case 'onsite': case 'office': return 'location-outline';
      default: return 'briefcase-outline';
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, isDarkMode && styles.headerDark]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={isDarkMode ? "#FFFFFF" : "#1F2937"} 
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
        {t('Job Details')}
      </Text>
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons 
          name="share-outline" 
          size={24} 
          color={isDarkMode ? "#FFFFFF" : "#1F2937"} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderJobInfo = () => (
    <View style={[styles.jobCard, isDarkMode && styles.jobCardDark]}>
      <Text style={[styles.jobTitle, isDarkMode && styles.jobTitleDark]}>
        {job.title}
      </Text>
      
      <Text style={[styles.company, isDarkMode && styles.companyDark]}>
        {job.company}
      </Text>

      <View style={styles.jobMetaContainer}>
        {job.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
              {job.location}
            </Text>
          </View>
        )}
        
        {job.level && (
          <View style={styles.metaItem}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(job.level) + '20' }]}>
              <Text style={[styles.levelText, { color: getLevelColor(job.level) }]}>
                {job.level}
              </Text>
            </View>
          </View>
        )}
        
        {job.workType && (
          <View style={styles.metaItem}>
            <Ionicons name={getWorkTypeIcon(job.workType)} size={16} color="#6B7280" />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
              {job.workType}
            </Text>
          </View>
        )}

        {job.salary && (
          <View style={styles.metaItem}>
            <Ionicons name="card-outline" size={16} color="#10B981" />
            <Text style={[styles.salaryText, isDarkMode && styles.salaryTextDark]}>
              {job.salary}
            </Text>
          </View>
        )}
      </View>

      {job.category && (
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, isDarkMode && styles.categoryBadgeDark]}>
            <Ionicons name="folder-outline" size={14} color="#8B5CF6" />
            <Text style={styles.categoryText}>{job.category}</Text>
          </View>
        </View>
      )}

      {job.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('Job Description')}
          </Text>
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
            {job.description}
          </Text>
        </View>
      )}

      {job.requirements && (
        <View style={styles.requirementsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('Requirements')}
          </Text>
          <Text style={[styles.requirements, isDarkMode && styles.requirementsDark]}>
            {job.requirements}
          </Text>
        </View>
      )}

      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('Required Skills')}
          </Text>
          <View style={styles.skillsGrid}>
            {job.skills.map((skill, index) => (
              <View key={index} style={[styles.skillChip, isDarkMode && styles.skillChipDark]}>
                <Text style={[styles.skillText, isDarkMode && styles.skillTextDark]}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderAiAnalysis = () => {
    if (isAnalyzing) {
      return (
        <View style={[styles.aiCard, isDarkMode && styles.aiCardDark]}>
          <View style={styles.aiHeader}>
            <Ionicons name="brain" size={24} color="#8B5CF6" />
            <Text style={[styles.aiTitle, isDarkMode && styles.aiTitleDark]}>
              {t('AI Analysis')}
            </Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
              {t('Analyzing this job for you...')}
            </Text>
          </View>
        </View>
      );
    }

    if (analysisError) {
      return (
        <View style={[styles.aiCard, isDarkMode && styles.aiCardDark, styles.errorCard]}>
          <View style={styles.aiHeader}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={[styles.aiTitle, isDarkMode && styles.aiTitleDark]}>
              {t('AI Analysis')}
            </Text>
          </View>
          <Text style={[styles.errorText, isDarkMode && styles.errorTextDark]}>
            {analysisError}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={performAiAnalysis}
          >
            <Text style={styles.retryButtonText}>{t('Try Again')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!aiAnalysis) return null;

    return (
      <View style={[styles.aiCard, isDarkMode && styles.aiCardDark]}>
        <View style={styles.aiHeader}>
          <Ionicons name="brain" size={24} color="#8B5CF6" />
          <Text style={[styles.aiTitle, isDarkMode && styles.aiTitleDark]}>
            {t('AI Job Analysis')}
          </Text>
          <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(aiAnalysis.relevanceScore) + '20' }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(aiAnalysis.relevanceScore) }]}>
              {getScoreEmoji(aiAnalysis.relevanceScore)} {aiAnalysis.relevanceScore}%
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.analysisSection}>
          <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
            {t('Job Summary')}
          </Text>
          <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark]}>
            {aiAnalysis.summary}
          </Text>
        </View>

        {/* Personalized Recommendation */}
        <View style={[styles.analysisSection, styles.recommendationSection]}>
          <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
            {t('Why This Job Matches You')}
          </Text>
          <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark, styles.recommendationText]}>
            {aiAnalysis.personalizedRecommendation}
          </Text>
        </View>

        {/* Key Benefits */}
        {aiAnalysis.keyBenefits && aiAnalysis.keyBenefits.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
              {t('Key Opportunities')}
            </Text>
            {aiAnalysis.keyBenefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.benefitText, isDarkMode && styles.benefitTextDark]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills Gained */}
        {aiAnalysis.skillsGained && aiAnalysis.skillsGained.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
              {t('Skills You\'ll Develop')}
            </Text>
            <View style={styles.skillsGainedContainer}>
              {aiAnalysis.skillsGained.map((skill, index) => (
                <View key={index} style={[styles.skillGainedChip, isDarkMode && styles.skillGainedChipDark]}>
                  <Text style={[styles.skillGainedText, isDarkMode && styles.skillGainedTextDark]}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Career Progression */}
        {aiAnalysis.careerProgression && (
          <View style={styles.analysisSection}>
            <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
              {t('Career Impact')}
            </Text>
            <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark]}>
              {aiAnalysis.careerProgression}
            </Text>
          </View>
        )}

        {/* Regional Context */}
        {aiAnalysis.regionalContext && (
          <View style={styles.analysisSection}>
            <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
              {t('Regional Opportunities')}
            </Text>
            <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark]}>
              {aiAnalysis.regionalContext}
            </Text>
          </View>
        )}

        {/* Honest Assessment */}
        {aiAnalysis.honestAssessment && (
          <View style={[styles.analysisSection, styles.honestAssessmentSection]}>
            <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
              {t('Should You Apply?')}
            </Text>
            <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark, styles.honestAssessmentText]}>
              {aiAnalysis.honestAssessment}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={[styles.actionContainer, isDarkMode && styles.actionContainerDark]}>
      <TouchableOpacity
        style={[styles.applyButton, aiAnalysis?.relevanceScore >= 70 && styles.applyButtonHighScore]}
        onPress={handleApply}
      >
        <Text style={styles.applyButtonText}>
          {t('Apply Now')}
        </Text>
        <Ionicons name="send" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.saveButton, isDarkMode && styles.saveButtonDark]}>
        <Ionicons name="bookmark-outline" size={20} color={isDarkMode ? "#FFFFFF" : "#374151"} />
        <Text style={[styles.saveButtonText, isDarkMode && styles.saveButtonTextDark]}>
          {t('Save Job')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderJobInfo()}
        {renderAiAnalysis()}
      </ScrollView>
      
      {renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  jobCardDark: {
    backgroundColor: '#1F2937',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 8,
  },
  jobTitleDark: {
    color: '#F9FAFB',
  },
  company: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 16,
  },
  companyDark: {
    color: '#34D399',
  },
  jobMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaTextDark: {
    color: '#9CA3AF',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  salaryText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  salaryTextDark: {
    color: '#34D399',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  categoryBadgeDark: {
    backgroundColor: '#581C87',
  },
  categoryText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  requirementsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  descriptionDark: {
    color: '#D1D5DB',
  },
  requirements: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  requirementsDark: {
    color: '#D1D5DB',
  },
  skillsContainer: {
    marginBottom: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  skillChipDark: {
    backgroundColor: '#92400E',
    borderColor: '#D97706',
  },
  skillText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  skillTextDark: {
    color: '#FCD34D',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardDark: {
    backgroundColor: '#1F2937',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  aiTitleDark: {
    color: '#F9FAFB',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  loadingTextDark: {
    color: '#9CA3AF',
  },
  errorCard: {
    borderColor: '#FEE2E2',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    marginBottom: 16,
  },
  errorTextDark: {
    color: '#FCA5A5',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  analysisSectionTitleDark: {
    color: '#F9FAFB',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  analysisTextDark: {
    color: '#D1D5DB',
  },
  recommendationSection: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  recommendationText: {
    color: '#065F46',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  benefitText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
  },
  benefitTextDark: {
    color: '#D1D5DB',
  },
  skillsGainedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillGainedChip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  skillGainedChipDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#2563EB',
  },
  skillGainedText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  skillGainedTextDark: {
    color: '#93C5FD',
  },
  honestAssessmentSection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  honestAssessmentText: {
    color: '#92400E',
    fontStyle: 'italic',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionContainerDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  applyButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonHighScore: {
    backgroundColor: '#10B981',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 8,
  },
  saveButtonDark: {
    borderColor: '#4B5563',
  },
  saveButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonTextDark: {
    color: '#D1D5DB',
  },
});

export default JobDetailScreen;