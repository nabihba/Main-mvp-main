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
import { runFullAiAnalysis } from '../services/aiService';

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

  useEffect(() => {
    if (userData) {
      console.log('User data received:', userData);
      console.log('Recommended courses:', userData.recommendedCourses);
      console.log('Recommended jobs:', userData.recommendedJobs);
      
      // ✅ --- THIS IS THE FIX --- ✅
      // We add .filter(item => item && item.id) to safely remove any bad data
      // that might have been saved to the user's profile, preventing the crash.
      const filteredCourses = (userData.recommendedCourses || []).filter(c => c && c.id);
      const filteredJobs = (userData.recommendedJobs || []).filter(j => j && j.id);
      
      console.log('Filtered courses:', filteredCourses.length);
      console.log('Filtered jobs:', filteredJobs.length);
      
      // If no recommendations, try to get some test data
      if (filteredCourses.length === 0 || filteredJobs.length === 0) {
        console.log('No recommendations found, this might be a new user or analysis failed');
      }
      
      setCourses(filteredCourses);
      setJobs(filteredJobs);
      setFilteredCourses(filteredCourses);
      setFilteredJobs(filteredJobs);
    }
    setIsLoading(false);
  }, [userData]);

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
        course.skills?.toLowerCase().includes(query)
      );
      const filteredJ = jobs.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.category?.toLowerCase().includes(query)
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
      console.log('Starting AI analysis refresh...');
      const { recommendedCourses, recommendedJobs } = await runFullAiAnalysis(userData);
      
      console.log('AI analysis completed:', { recommendedCourses: recommendedCourses?.length, recommendedJobs: recommendedJobs?.length });
      
      const updatedUserData = { ...userData, recommendedCourses, recommendedJobs, lastAnalysisDate: new Date() };
      updateUserData(updatedUserData);

      // Also apply the safety filter here
      const filteredCourses = (recommendedCourses || []).filter(c => c && c.id);
      const filteredJobs = (recommendedJobs || []).filter(j => j && j.id);
      
      console.log('Setting filtered data:', { courses: filteredCourses.length, jobs: filteredJobs.length });
      setCourses(filteredCourses);
      setJobs(filteredJobs);

      Alert.alert(t('Success'), t('Your AI suggestions have been refreshed!'));
    } catch (error) {
      console.error("Refresh failed:", error);
      Alert.alert(t('Error'), t('Could not refresh suggestions at this time.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuPress = () => setShowSidebar(!showSidebar);
  const handleJobPress = (job) => { setSelectedJob(job); setShowJobModal(true); };
  const handleCoursePress = (course) => { setSelectedCourse(course); setShowCourseModal(true); };
  const handleProfilePress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Profile'); };
  const handleCalendarPress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Calendar'); };
  const handleSettingsPress = () => { setShowSidebar(false); if (onScreenChange) onScreenChange('Settings'); };
  const handleLogout = () => {
    setShowSidebar(false);
    clearUserData();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
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
          <View style={styles.sidebarHeader}><View style={styles.logoContainer}><View style={styles.logoCircle}><Text style={styles.logoText}>{userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}</Text></View><Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text></View></View>
          <View style={styles.sidebarMenu}><TouchableOpacity style={[styles.menuItem, styles.activeMenuItem]}><Ionicons name="home" size={20} color="#065F46" /><Text style={[styles.menuText, titleStyle]}>{t('Home')}</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}><Ionicons name="person" size={20} color="#6B7280" /><Text style={[styles.menuText, textStyle]}>{t('Profile')}</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={handleCalendarPress}><Ionicons name="calendar-outline" size={20} color="#6B7280" /><Text style={[styles.menuText, textStyle]}>{t('Calendar')}</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}><Ionicons name="settings-outline" size={20} color="#6B7280" /><Text style={[styles.menuText, textStyle]}>{t('Settings')}</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={handleLogout}><Ionicons name="log-out-outline" size={20} color="#EF4444" /><Text style={[styles.menuText, { color: '#EF4444' }]}>{t('Logout')}</Text></TouchableOpacity></View>
          <View style={styles.sidebarFooter}><View style={styles.userInfo}>{userData.profileImage ? <Image source={{ uri: userData.profileImage }} style={styles.userAvatar} /> : <View style={styles.userAvatarPlaceholder}><Text style={styles.userAvatarText}>{userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}</Text></View>}<View><Text style={[styles.userName, titleStyle]}>{userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.specialization || 'ICT Graduate'}</Text><Text style={[styles.userLocation, textStyle]}>{userData.region || 'West Bank'}</Text></View></View></View>
        </View>
      )}

      <View style={styles.mainContent}>
        {showSidebar && <TouchableOpacity style={styles.sidebarOverlay} activeOpacity={1} onPress={() => setShowSidebar(false)} />}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={handleMenuPress}><Ionicons name="menu" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} /></TouchableOpacity>
          <View style={styles.logoContainer}><View style={styles.logoCircle}><Text style={styles.logoText}>{userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'B'}</Text></View><Text style={[styles.logoTitle, titleStyle]}>BridgeIT</Text></View>
          <TouchableOpacity onPress={handleRefreshSuggestions}><Ionicons name="refresh" size={24} color={isDarkMode ? "#FFFFFF" : "#1f2937"} /></TouchableOpacity>
        </View>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, titleStyle]}>{t('Welcome')}, {userData.firstName || 'User'}!</Text>
          <Text style={[styles.welcomeSubtitle, textStyle]}>{t('Your career hub is ready.')}</Text>
        </View>
        
        {/* AI Recommendations Section */}
        {userData.analysisComplete && (
          <View style={styles.aiRecommendationsSection}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={24} color="#556B2F" />
              <Text style={[styles.aiTitle, titleStyle]}>{t('AI Recommendations')}</Text>
            </View>
            <Text style={[styles.aiSubtitle, textStyle]}>
              {activeTab === 'Courses' 
                ? t('These courses are recommended by our AI based on your profile')
                : t('These jobs are recommended by our AI based on your profile')
              }
            </Text>
          </View>
        )}
        
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'Jobs' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('Jobs')}>
            <Ionicons name="briefcase-outline" size={20} color={activeTab === 'Jobs' ? "#1f2937" : "#9ca3af"} />
            <Text style={[styles.tabText, activeTab === 'Jobs' ? styles.activeTabText : styles.inactiveTabText]}>{t('Jobs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Courses' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('Courses')}>
            <Ionicons name="book-outline" size={20} color={activeTab === 'Courses' ? "#1f2937" : "#9ca3af"} />
            <Text style={[styles.tabText, activeTab === 'Courses' ? styles.activeTabText : styles.inactiveTabText]}>{t('Courses')}</Text>
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDarkMode ? "#FFFFFF" : "#065F46"} />
              <Text style={textStyle}>Loading Recommendations...</Text>
            </View>
          ) : activeTab === 'Jobs' ? (
            <View>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <TouchableOpacity key={job.id} style={[styles.jobCard, cardStyle]} onPress={() => handleJobPress(job)}>
                    <View style={styles.jobHeader}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{job.category || 'General'}</Text>
                      </View>
                      <Image source={{uri: job.image || 'https://source.unsplash.com/400x400/?company,logo'}} style={styles.jobIcon} />
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
                    <Text style={[styles.jobDescription, textStyle]} numberOfLines={3}>{job.description}</Text>
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
                    {searchQuery ? t('Try adjusting your search terms') : t('Complete the questionnaire to get personalized job recommendations')}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TouchableOpacity key={course.id} style={[styles.courseCard, cardStyle]} onPress={() => handleCoursePress(course)}>
                    <Image source={{ uri: course.image }} style={styles.courseImage} />
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
                    <Text style={[styles.courseDescription, textStyle]} numberOfLines={3}>{course.description}</Text>
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
                    {searchQuery ? t('Try adjusting your search terms') : t('Complete the questionnaire to get personalized course recommendations')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <JobDetailModal visible={showJobModal} job={selectedJob} onClose={() => setShowJobModal(false)} />
      <CourseDetailModal visible={showCourseModal} course={selectedCourse} onClose={() => setShowCourseModal(false)} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  headerDark: { backgroundColor: '#1F2937' },
  welcomeSection: { paddingHorizontal: 20, paddingVertical: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: '700', color: '#065f46', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: '#6b7280', fontWeight: '400' },
  aiRecommendationsSection: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F0FDF4', marginHorizontal: 20, borderRadius: 12, marginBottom: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiTitle: { fontSize: 18, fontWeight: '600', color: '#556B2F', marginLeft: 8 },
  aiSubtitle: { fontSize: 14, color: '#556B2F', lineHeight: 20 },
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
  content: { paddingHorizontal: 20 },
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
  courseCard: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  courseImage: { height: 180 },
  courseCategoryTag: { backgroundColor: '#fef3c7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, margin: 20, marginBottom: 12 },
  courseCategoryText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
  courseTitle: { fontSize: 20, fontWeight: '700', color: '#065f46', marginHorizontal: 20, marginBottom: 4 },
  courseProvider: { fontSize: 16, color: '#6b7280', marginHorizontal: 20, marginBottom: 12 },
  courseDetails: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginBottom: 12 },
  courseDetailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  courseDetailText: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
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