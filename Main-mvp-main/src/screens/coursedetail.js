import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { getDetailedAiAnalysis } from '../services/aiService';

const CourseDetailScreen = ({ route, navigation }) => {
  const { course } = route.params || {};
  const { userData } = useUser();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAnalysis = async () => {
      if (course && userData) {
        try {
          const analysis = await getDetailedAiAnalysis(course, userData, 'course');
          setAiAnalysis(analysis);
        } catch (error) {
          console.error('Failed to get AI analysis:', error);
        }
      }
      setLoading(false);
    };
    
    getAnalysis();
  }, [course, userData]);

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Title and Provider */}
        <View style={styles.titleSection}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.providerInfo}>{course.provider}</Text>
        </View>

        {/* Course Overview */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <Ionicons name="globe-outline" size={20} color="#6B7280" />
            <Text style={styles.overviewLabel}>{course.delivery || 'Online'}</Text>
            <Text style={styles.overviewDescription}>Delivery</Text>
          </View>
          <View style={styles.overviewCard}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.overviewLabel}>{course.duration}</Text>
            <Text style={styles.overviewDescription}>Duration</Text>
          </View>
          <View style={styles.overviewCard}>
            <Ionicons name="trending-up-outline" size={20} color="#6B7280" />
            <Text style={styles.overviewLabel}>{course.level}</Text>
            <Text style={styles.overviewDescription}>Level</Text>
          </View>
          <View style={styles.overviewCard}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.overviewLabel}>{course.price}</Text>
            <Text style={styles.overviewDescription}>Price</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
            <Text style={styles.loadingText}>Analyzing course for you...</Text>
          </View>
        ) : (
          <>
            {/* AI Analysis: Why This Course Is Perfect For You */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={20} color="#065F46" />
                <Text style={styles.sectionTitle}>Why This Course Is Perfect For You</Text>
              </View>
              <View style={styles.helpCard}>
                <Text style={styles.helpText}>
                  {aiAnalysis?.personalizedRecommendation || "This course is designed to enhance your skills and knowledge in the field. It's perfect for your current experience level and career goals."}
                </Text>
                {aiAnalysis?.relevanceScore && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>
                      Match Score: {aiAnalysis.relevanceScore}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* AI Analysis: Key Benefits */}
            {aiAnalysis?.keyBenefits && aiAnalysis.keyBenefits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star-outline" size={20} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>Key Benefits For You</Text>
                </View>
                <View style={styles.benefitsContainer}>
                  {aiAnalysis.keyBenefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Skills You'll Develop */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="target" size={20} color="#EA580C" />
                <Text style={styles.sectionTitle}>Skills You'll Develop</Text>
              </View>
              <View style={styles.skillsContainer}>
                {(aiAnalysis?.skillsGained || course.skills || []).map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Career Progression */}
            {aiAnalysis?.careerProgression && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trending-up" size={20} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Career Impact</Text>
                </View>
                <View style={styles.progressionCard}>
                  <Text style={styles.progressionText}>
                    {aiAnalysis.careerProgression}
                  </Text>
                </View>
              </View>
            )}

            {/* Course Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Description</Text>
              <Text style={styles.descriptionText}>{course.description}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>Enroll Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
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
  providerInfo: {
    fontSize: 16,
    color: '#6B7280',
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
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  overviewDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
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
  helpCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  helpText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  scoreContainer: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  benefitText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
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
  skillText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  progressionCard: {
    backgroundColor: '#F5F3FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  progressionText: {
    fontSize: 14,
    color: '#5B21B6',
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default CourseDetailScreen;