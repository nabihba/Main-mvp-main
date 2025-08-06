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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getDetailedAiAnalysis } from '../services/aiService';

const { width } = Dimensions.get('window');

const CourseDetailScreen = ({ navigation, route }) => {
  const { course } = route.params;
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const { userData } = useUser();

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (course && userData) {
      performAiAnalysis();
    }
  }, [course?.id, userData?.uid]);

  const performAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      console.log('Starting AI analysis for course:', course.title);
      const analysis = await getDetailedAiAnalysis(course, userData, 'course');
      setAiAnalysis(analysis);
      console.log('AI analysis completed:', analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAnalysisError('Unable to generate AI analysis at this time.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEnroll = () => {
    if (course.url) {
      Linking.openURL(course.url).catch(() => {
        Alert.alert(t('Error'), t('Unable to open course link'));
      });
    } else {
      Alert.alert(t('Info'), t('Course enrollment link not available'));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🎯';
    if (score >= 60) return '👍';
    return '🤔';
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
        {t('Course Details')}
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

  const renderCourseInfo = () => (
    <View style={[styles.courseCard, isDarkMode && styles.courseCardDark]}>
      <Text style={[styles.courseTitle, isDarkMode && styles.courseTitleDark]}>
        {course.title}
      </Text>
      
      <Text style={[styles.provider, isDarkMode && styles.providerDark]}>
        {course.provider}
      </Text>

      <View style={styles.courseMetaContainer}>
        {course.duration && (
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
              {course.duration}
            </Text>
          </View>
        )}
        
        {course.level && (
          <View style={styles.metaItem}>
            <Ionicons name="bar-chart-outline" size={16} color="#6B7280" />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
              {course.level}
            </Text>
          </View>
        )}
        
        {course.category && (
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={16} color="#6B7280" />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
              {course.category}
            </Text>
          </View>
        )}
      </View>

      {course.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('Description')}
          </Text>
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
            {course.description}
          </Text>
        </View>
      )}

      {course.skills && course.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('Skills You\'ll Learn')}
          </Text>
          <View style={styles.skillsGrid}>
            {course.skills.map((skill, index) => (
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
              {t('Analyzing this course for you...')}
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
            {t('AI Analysis')}
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
            {t('Summary')}
          </Text>
          <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark]}>
            {aiAnalysis.summary}
          </Text>
        </View>

        {/* Personalized Recommendation */}
        <View style={[styles.analysisSection, styles.recommendationSection]}>
          <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
            {t('Why This Course is Good for You')}
          </Text>
          <Text style={[styles.analysisText, isDarkMode && styles.analysisTextDark, styles.recommendationText]}>
            {aiAnalysis.personalizedRecommendation}
          </Text>
        </View>

        {/* Key Benefits */}
        {aiAnalysis.keyBenefits && aiAnalysis.keyBenefits.length > 0 && (
          <View style={styles.analysisSection}>
            <Text style={[styles.analysisSectionTitle, isDarkMode && styles.analysisSectionTitleDark]}>
              {t('Key Benefits')}
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
              {t('Skills You\'ll Gain')}
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
              {t('Regional Relevance')}
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
              {t('Bottom Line')}
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
        style={[styles.enrollButton, aiAnalysis?.relevanceScore >= 70 && styles.enrollButtonHighScore]}
        onPress={handleEnroll}
      >
        <Text style={styles.enrollButtonText}>
          {course.price ? `${t('Enroll Now')} - ${course.price}` : t('Enroll Now')}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.saveButton, isDarkMode && styles.saveButtonDark]}>
        <Ionicons name="bookmark-outline" size={20} color={isDarkMode ? "#FFFFFF" : "#374151"} />
        <Text style={[styles.saveButtonText, isDarkMode && styles.saveButtonTextDark]}>
          {t('Save for Later')}
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
        {renderCourseInfo()}
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
  courseCard: {
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
  courseCardDark: {
    backgroundColor: '#1F2937',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 8,
  },
  courseTitleDark: {
    color: '#F9FAFB',
  },
  provider: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 16,
  },
  providerDark: {
    color: '#A78BFA',
  },
  courseMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
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
  descriptionContainer: {
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
  skillsContainer: {
    marginBottom: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  skillChipDark: {
    backgroundColor: '#312E81',
    borderColor: '#4C1D95',
  },
  skillText: {
    fontSize: 14,
    color: '#3730A3',
    fontWeight: '500',
  },
  skillTextDark: {
    color: '#A78BFA',
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
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  recommendationText: {
    color: '#3730A3',
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
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  skillGainedChipDark: {
    backgroundColor: '#0C4A6E',
    borderColor: '#0284C7',
  },
  skillGainedText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '500',
  },
  skillGainedTextDark: {
    color: '#7DD3FC',
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
  enrollButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  enrollButtonHighScore: {
    backgroundColor: '#10B981',
  },
  enrollButtonText: {
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

export default CourseDetailScreen;