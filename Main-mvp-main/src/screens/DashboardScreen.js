import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JobDetailModal from '../components/JobDetailModal';
import CourseDetailModal from '../components/CourseDetailModal';
import { useDarkMode } from '../context/DarkModeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { runFullAiAnalysis, getDetailedAiAnalysis } from '../services/aiService';
// Import the enhanced services
import { fetchCourses } from '../services/courseService';
import { fetchJobs } from '../services/jobService';
import CareerPlanScreen from './CareerPlanScreen';

const HomepageScreen = ({ navigation, onScreenChange }) => {
  const { userData, updateUserData, clearUserData } = useUser();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Courses');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showCareerPlan, setShowCareerPlan] = useState(false);

  // Generate search keywords based on user profile
  const generateUserSearchKeywords = () => {
    if (!userData) return '';
    
    const keywords = [];
    
    // Add specialization/field of study
    if (userData.specialization) keywords.push(userData.specialization);
    if (userData.fieldOfStudy) keywords.push(userData.fieldOfStudy);
    
    // Add skills from questionnaire
    if (userData.technicalSkills) keywords.push(...userData.technicalSkills);
    if (userData.softSkills) keywords.push(...userData.softSkills);
    
    // Add interests
    if (userData.interests) keywords.push(...userData.interests);
    if (userData.careerGoals) keywords.push(...userData.careerGoals);
    
    // Add degree level context
    if (userData.degreeLevel) keywords.push(userData.degreeLevel);
    
    return keywords.join(' ');
  };

  // Load initial data based on user profile
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!userData) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Loading personalized recommendations for user:', userData.firstName);
        
        // Generate search keywords based on user profile
        const userKeywords = generateUserSearchKeywords();
        console.log('Generated search keywords:', userKeywords);

        // Fetch courses and jobs in parallel
        const [coursesData, jobsData] = await Promise.all([
          fetchCourses(userKeywords, {
            useRealAPIs: true,
            sources: ['udemy', 'coursera', 'classcentral'],
            maxPerSource: 15,
            fallbackToGenerated: true
          }),
          fetchJobs(userKeywords, {
            useRealAPIs: true,
            sources: ['indeed', 'linkedin', 'github'],
            maxPerSource: 15,
            fallbackToGenerated: true
          })
        ]);

        console.log(`Loaded ${coursesData.length} courses and ${jobsData.length} jobs`);

        // Normalize course data to prevent errors
        const normalizedCourses = coursesData.map(course => ({
          ...course,
          skills: Array.isArray(course.skills) 
            ? course.skills 
            : Array.isArray(course.tags) 
              ? course.tags 
              : typeof course.skills === 'string'
                ? course.skills.split(',').map(s => s.trim())
                : [],
          image: course.imageUrl || course.image || 'https://source.unsplash.com/400x300/?education,course',
          duration: course.duration || 'Self-paced',
          level: course.level || 'Beginner'
        }));

        // Normalize job data
        const normalizedJobs = jobsData.map(job => ({
          ...job,
          skills: Array.isArray(job.skills) 
            ? job.skills 
            : Array.isArray(job.requirements)
              ? job.requirements
              : typeof job.skills === 'string'
                ? job.skills.split(',').map(s => s.trim())
                : [],
          image: job.image || job.companyLogo || 'https://source.unsplash.com/400x400/?company,office',
          workType: job.workType || job.type || 'Full-time',
          category: job.category || job.department || 'General'
        }));

        setCourses(normalizedCourses);
        setJobs(normalizedJobs);
        setFilteredCourses(normalizedCourses);
        setFilteredJobs(normalizedJobs);

        // Update user data with recommendations (optional - for caching)
        const updatedUserData = {
          ...userData,
          recommendedCourses: normalizedCourses,
          recommendedJobs: normalizedJobs,
          lastAnalysisDate: new Date().toISOString()
        };
        updateUserData(updatedUserData);

      } catch (error) {
        console.error('Error loading recommendations:', error);
        
        // Fallback to any cached recommendations
        const cachedCourses = userData.recommendedCourses || [];
        const cachedJobs = userData.recommendedJobs || [];
        
        setCourses(cachedCourses);
        setJobs(cachedJobs);
        setFilteredCourses(cachedCourses);
        setFilteredJobs(cachedJobs);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [userData?.uid]); // Only re-run when user changes

  // Filter courses and jobs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
      setFilteredJobs(jobs);
    } else {
      const query = searchQuery.toLowerCase();
      const filteredC = courses.filter(course =>
        course.title?.toLowerCase().includes(query) ||
        course.provider?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query) ||
        (Array.isArray(course.skills) && course.skills.some(skill => 
          skill.toLowerCase().includes(query)
        ))
      );
      const filteredJ = jobs.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.category?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        (Array.isArray(job.skills) && job.skills.some(skill => 
          skill.toLowerCase().includes(query)
        ))
      );
      setFilteredCourses(filteredC);
      setFilteredJobs(filteredJ);
    }
  }, [searchQuery, courses, jobs]);

  const handleRefreshSuggestions = async () => {
    if (!userData) {
      Alert.alert(t('Error'), t('You must be logged in to refresh suggestions.'));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Refreshing recommendations...');
      
      const userKeywords = generateUserSearchKeywords();
      
      // Fetch fresh data
      const [coursesData, jobsData] = await Promise.all([
        fetchCourses(userKeywords, {
          useRealAPIs: true,
          sources: ['udemy', 'coursera', 'classcentral'],
          maxPerSource: 20,
          fallbackToGenerated: true
        }),
        fetchJobs(userKeywords, {
          useRealAPIs: true,
          sources: ['indeed', 'linkedin', 'github'],
          maxPerSource: 20,
          fallbackToGenerated: true
        })
      ]);

      // Normalize data
      const normalizedCourses = coursesData.map(course => ({
        ...course,
        skills: Array.isArray(course.skills) ? course.skills : [],
        image: course.imageUrl || course.image || 'https://source.unsplash.com/400x300/?education,course'
      }));

      const normalizedJobs = jobsData.map(job => ({
        ...job,
        skills: Array.isArray(job.skills) ? job.skills : [],
        image: job.image || job.companyLogo || 'https://source.unsplash.com/400x400/?company,office'
      }));

      setCourses(normalizedCourses);
      setJobs(normalizedJobs);
      setFilteredCourses(normalizedCourses);
      setFilteredJobs(normalizedJobs);

      // Update user data
      const updatedUserData = {
        ...userData,
        recommendedCourses: normalizedCourses,
        recommendedJobs: normalizedJobs,
        lastAnalysisDate: new Date().toISOString()
      };
      updateUserData(updatedUserData);

      Alert.alert(t('Success'), t('Your recommendations have been refreshed!'));
    } catch (error) {
      console.error("Refresh failed:", error);
      Alert.alert(t('Error'), t('Could not refresh suggestions at this time.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuPress = () => setShowSidebar(!showSidebar);
  
  const handleJobPress = async (job) => { 
    console.log('Opening job details for:', job.title);
    
    // Get AI analysis for this specific job
    try {
      const aiAnalysis = await getDetailedAiAnalysis(job, userData, 'job');
      console.log('AI analysis for job:', aiAnalysis);
      
      // Enhance job object with AI insights
      const enhancedJob = {
        ...job,
        skills: Array.isArray(job.skills) ? job.skills : [],
        suitabilityReason: aiAnalysis?.personalizedRecommendation || job.suitabilityReason,
        matchingSkills: aiAnalysis?.skillsGained || job.matchingSkills || job.skills || [],
        aiAnalysis: aiAnalysis
      };
      
      setSelectedJob(enhancedJob);
    } catch (error) {
      console.error('Failed to get AI analysis for job:', error);
      // Fallback to normalized job if AI fails
      const normalizedJob = {
        ...job,
        skills: Array.isArray(job.skills) ? job.skills : []
      };
      setSelectedJob(normalizedJob);
    }
    
    setShowJobModal(true); 
  };
  
  const handleCoursePress = async (course) => { 
    console.log('Opening course details for:', course.title);
    
    // Get AI analysis for this specific course
    try {
      const aiAnalysis = await getDetailedAiAnalysis(course, userData, 'course');
      console.log('AI analysis for course:', aiAnalysis);
      
      // Enhance course object with AI insights
      const enhancedCourse = {
        ...course,
        skills: Array.isArray(course.skills) ? course.skills : [],
        helpReason: aiAnalysis?.personalizedRecommendation || course.helpReason,
        skillsGained: aiAnalysis?.skillsGained || course.skills || [],
        aiAnalysis: aiAnalysis
      };
      
      setSelectedCourse(enhancedCourse);
    } catch (error) {
      console.error('Failed to get AI analysis for course:', error);
      // Fallback to normalized course if AI fails
      const normalizedCourse = {
        ...course,
        skills: Array.isArray(course.skills) ? course.skills : []
      };
      setSelectedCourse(normalizedCourse);
    }
    
    setShowCourseModal(true); 
  };
  
  const handleProfilePress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Profile'); };
  const handleCareerPlanPress = () => { setShowSidebar(false); setShowCareerPlan(true); };
  const handleSettingsPress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Settings'); };
  const handleLogout = () => {
    setShowSidebar(false);
    clearUserData();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  // Handler for viewing the career plan
  const handleViewPlan = () => {
    setShowCareerPlan(true);
  };
  
  const { isDarkMode } = useDarkMode();
  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  return (
    <SafeAreaView style={containerStyle}>
      {showSidebar && (
        <View style={[styles.sidebar, isDarkMode && styles.sidebarDark]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>
                  {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}
                </Text>
              </View>
              <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
            </View>
          </View>
          <View style={styles.sidebarMenu}>
            <TouchableOpacity style={[styles.menuItem, styles.activeMenuItem]}>
              <Ionicons name="home" size={20} color="#065F46" />
              <Text style={[styles.menuText, titleStyle]}>{t('Home')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
              <Ionicons name="person" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleCareerPlanPress}>
              <Ionicons name="rocket-outline" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Career Plan')}</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
              <Ionicons name="settings-outline" size={20} color="#6B7280" />
              <Text style={[styles.menuText, textStyle]}>{t('Settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>{t('Logout')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sidebarFooter}>
            <View style={styles.userInfo}>
              {userData?.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.userAvatarText}>
                    {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={[styles.userName, titleStyle]}>
                  {userData?.firstName && userData?.lastName 
                    ? `${userData.firstName} ${userData.lastName}` 
                    : userData?.specialization || 'ICT Graduate'
                  }
                </Text>
                <Text style={[styles.userLocation, textStyle]}>
                  {userData?.region || 'West Bank'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        {showSidebar && (
          <TouchableOpacity 
            style={styles.sidebarOverlay} 
            activeOpacity={1} 
            onPress={() => setShowSidebar(false)} 
          />
        )}
        
        {/* Header (Fixed) */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                {userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}
              </Text>
            </View>
            <Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text>
          </View>
          <TouchableOpacity onPress={handleRefreshSuggestions}>
            <Ionicons name="refresh" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, titleStyle]}>
              {t('Welcome')}, {userData?.firstName || 'User'}!
            </Text>
            <Text style={[styles.welcomeSubtitle, textStyle]}>
              {t('Your personalized career recommendations')}
            </Text>
          </View>
          
          {/* Career Plan Ready Section */}
          {userData && userData.analysisComplete && (
            <View style={[styles.careerPlanSection, isDarkMode && styles.careerPlanSectionDark]}>
              <View style={styles.careerPlanHeader}>
                <Ionicons name="sparkles" size={24} color="#11523d" />
                <Text style={[styles.careerPlanTitle, titleStyle]}>{t('Your Career Plan is Ready!')}</Text>
              </View>
              <Text style={[styles.careerPlanSubtitle, textStyle]}>
                {t('Based on your profile, we\'ve created a personalized career roadmap for you.')}
              </Text>
              <TouchableOpacity 
                style={styles.viewPlanButton} 
                onPress={handleViewPlan}
              >
                <Text style={styles.viewPlanText}>{t('View Plan')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Jobs' ? styles.activeTab : styles.inactiveTab]} 
              onPress={() => setActiveTab('Jobs')}
            >
              <Ionicons name="briefcase-outline" size={20} color={activeTab === 'Jobs' ? "#1f2937" : "#9ca3af"} />
              <Text style={[styles.tabText, activeTab === 'Jobs' ? styles.activeTabText : styles.inactiveTabText]}>
                {t('Jobs')} ({filteredJobs.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Courses' ? styles.activeTab : styles.inactiveTab]} 
              onPress={() => setActiveTab('Courses')}
            >
              <Ionicons name="book-outline" size={20} color={activeTab === 'Courses' ? "#1f2937" : "#9ca3af"} />
              <Text style={[styles.tabText, activeTab === 'Courses' ? styles.activeTabText : styles.inactiveTabText]}>
                {t('Courses')} ({filteredCourses.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, isDarkMode && styles.searchBarDark]}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                placeholder={activeTab === 'Jobs' ? t('Search jobs...') : t('Search courses...')}
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : "#065F46"} />
              <Text style={[textStyle, { marginTop: 16 }]}>Loading personalized recommendations...</Text>
            </View>
          ) : activeTab === 'Jobs' ? (
            <View style={styles.contentContainer}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <TouchableOpacity key={job.id} style={[styles.jobCard, cardStyle]} onPress={() => handleJobPress(job)}>
                    <View style={styles.jobHeader}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{job.category || 'General'}</Text>
                      </View>
                      <Image source={{uri: job.image}} style={styles.jobIcon} />
                    </View>
                    <Text style={[styles.jobTitle, titleStyle]}>{job.title}</Text>
                    <Text style={[styles.companyName, textStyle]}>{job.company}</Text>
                    <View style={styles.jobDetails}>
                      <View style={styles.jobDetailItem}>
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text style={styles.jobDetailText}>{job.location}</Text>
                      </View>
                      <View style={styles.jobDetailItem}>
                        <Ionicons name="business-outline" size={16} color="#6b7280" />
                        <Text style={styles.jobDetailText}>{job.workType}</Text>
                      </View>
                    </View>
                    <Text style={[styles.jobDescription, textStyle]} numberOfLines={3}>
                      {job.description}
                    </Text>
                    <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleJobPress(job)}>
                      <Text style={styles.viewDetailsText}>{t('View Details')}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={48} color="#6B7280" />
                  <Text style={[styles.emptyStateText, textStyle]}>
                    {searchQuery ? t('No jobs found matching your search') : t('No job recommendations yet')}
                  </Text>
                  <Text style={[styles.emptyStateSubtext, textStyle]}>
                    {searchQuery 
                      ? t('Try adjusting your search terms') 
                      : t('Complete your profile to get personalized job recommendations')
                    }
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TouchableOpacity key={course.id} style={[styles.courseCard, cardStyle]} onPress={() => handleCoursePress(course)}>
                    <View style={styles.courseCategoryTag}>
                      <Text style={styles.courseCategoryText}>{course.level || 'General'}</Text>
                    </View>
                    <Text style={[styles.courseTitle, titleStyle]}>{course.title}</Text>
                    <Text style={[styles.courseProvider, textStyle]}>{course.provider}</Text>
                    <View style={styles.courseDetails}>
                      {course.duration && (
                        <View style={styles.courseDetailItem}>
                          <Ionicons name="time-outline" size={16} color="#6b7280" />
                          <Text style={styles.courseDetailText}>{course.duration}</Text>
                        </View>
                      )}
                      <View style={styles.courseDetailItem}>
                        <Ionicons name="globe-outline" size={16} color="#6b7280" />
                        <Text style={styles.courseDetailText}>Online</Text>
                      </View>
                    </View>
                    <Text style={[styles.courseDescription, textStyle]} numberOfLines={3}>
                      {course.description}
                    </Text>
                    <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleCoursePress(course)}>
                      <Text style={styles.viewDetailsText}>{t('View Details')}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="book-outline" size={48} color="#6B7280" />
                  <Text style={[styles.emptyStateText, textStyle]}>
                    {searchQuery ? t('No courses found matching your search') : t('No course recommendations yet')}
                  </Text>
                  <Text style={[styles.emptyStateSubtext, textStyle]}>
                    {searchQuery 
                      ? t('Try adjusting your search terms') 
                      : t('Complete your profile to get personalized course recommendations')
                    }
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <JobDetailModal 
        visible={showJobModal} 
        job={selectedJob} 
        onClose={() => setShowJobModal(false)} 
      />
      <CourseDetailModal 
        visible={showCourseModal} 
        course={selectedCourse} 
        onClose={() => setShowCourseModal(false)} 
      />
      
      {/* Career Plan Screen */}
      {showCareerPlan && (
        <View style={StyleSheet.absoluteFillObject}>
          <CareerPlanScreen 
            navigation={navigation}
            onScreenChange={(screen) => {
              if (screen === 'Home') {
                setShowCareerPlan(false);
              } else {
                setShowCareerPlan(false);
                if (onScreenChange) onScreenChange(screen);
              }
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, backgroundColor: '#FFFFFF', zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  sidebarDark: { backgroundColor: '#1F2937' },
  sidebarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 },
  sidebarHeader: { paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#065F46', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  logoTitle: { fontSize: 20, fontWeight: '700', color: '#065F46' },
  sidebarMenu: { paddingVertical: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, marginBottom: 4 },
  activeMenuItem: { backgroundColor: '#F0FDF4', borderTopRightRadius: 20, borderBottomRightRadius: 20, borderLeftWidth: 4, borderLeftColor: '#10B981' },
  menuText: { fontSize: 16, color: '#6B7280', marginLeft: 12 },
  sidebarFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginLeft: 8 },
  userLocation: { fontSize: 12, color: '#6B7280', marginLeft: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  userAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#065F46', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  userAvatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  mainContent: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 8, 
    backgroundColor: '#FFFFFF',
    zIndex: 10
  },
  headerDark: { backgroundColor: '#1F2937' },
  scrollContainer: { 
    flex: 1 
  },
  scrollContent: {
    paddingBottom: 20
  },
  welcomeSection: { paddingHorizontal: 20, paddingVertical: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: '700', color: '#065f46', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: '#6b7280', fontWeight: '400' },
  
  // Career Plan Section Styles
  careerPlanSection: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#F0FDF4', 
    marginHorizontal: 20, 
    borderRadius: 12, 
    marginBottom: 16 
  },
  careerPlanSectionDark: { 
    backgroundColor: '#064E3B' 
  },
  careerPlanHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  careerPlanTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#11523d', 
    marginLeft: 8 
  },
  careerPlanSubtitle: { 
    fontSize: 14, 
    color: '#11523d', 
    lineHeight: 20, 
    marginBottom: 16 
  },
  viewPlanButton: {
    backgroundColor: '#11523d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  viewPlanText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8
  },

  textDark: { color: '#D1D5DB' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginHorizontal: 4 },
  activeTab: { backgroundColor: '#ffffff', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  inactiveTab: { backgroundColor: 'transparent' },
  tabText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  activeTabText: { color: '#1f2937' },
  inactiveTabText: { color: '#9ca3af' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  searchBarDark: { backgroundColor: '#1F2937' },
  searchInput: { 
    flex: 1, 
    marginLeft: 12, 
    fontSize: 16, 
    color: '#1F2937' 
  },
  searchInputDark: { color: '#D1D5DB' },
  contentContainer: { paddingHorizontal: 20 },
  jobCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardDark: { backgroundColor: '#1F2937' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryTag: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
  jobIcon: { width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginBottom: 4 },
  titleDark: { color: '#10B981' },
  title: { color: '#065f46' },
  companyName: { fontSize: 16, color: '#6b7280', marginBottom: 12 },
  text: { color: '#374151' },
  jobDetails: { flexDirection: 'row', marginBottom: 8 },
  jobDetailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  jobDetailText: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  jobDescription: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 },
  viewDetailsButton: { backgroundColor: '#065f46', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  viewDetailsText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  courseCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  courseCategoryTag: { backgroundColor: '#fef3c7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, margin: 20, marginBottom: 12 },
  courseCategoryText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
  courseTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginHorizontal: 20, marginBottom: 4 },
  courseProvider: { fontSize: 16, color: '#6b7280', marginHorizontal: 20, marginBottom: 12 },
  courseDetails: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginBottom: 12 },
  courseDetailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  courseDetailText: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  courseDescription: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginHorizontal: 20, marginBottom: 16 },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyStateText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#6B7280', 
    textAlign: 'center', 
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtext: { 
    fontSize: 14, 
    color: '#9CA3AF', 
    textAlign: 'center',
    lineHeight: 20
  },
});
export default HomepageScreen;