import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import AIAnalysisModal from '../components/AIAnalysisModal';

// Import all necessary services
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadFile } from '../services/appwriteService';
import { runFullAiAnalysis } from '../services/aiService';

const QuestionnaireScreen = ({ navigation, route }) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Reset to first question when component mounts or when retaking
  useEffect(() => {
    setCurrentPage(0);
    setShowIntro(true);
    setAnswers({
      careerGoal: '',
      region: '',
      employmentStatus: '',
      experience: '',
      university: '',
      fieldExperience: [],
      desiredField: [],
      dreamJob: '',
      remoteCountries: [],
      cvFiles: [],
      profilePhoto: null, // Add profile photo state
    });
  }, []);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [answers, setAnswers] = useState({
    careerGoal: '',
    region: '',
    employmentStatus: '',
    experience: '',
    university: '',
    fieldExperience: [],
    desiredField: [],
    dreamJob: '',
    remoteCountries: [],
    cvFiles: [],
    profilePhoto: null, // Add profile photo state
  });

  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const { updateUserData } = useUser();
  const { userAuth, userData: initialUserData } = route.params;

  const questions = useMemo(() => [
    {
      id: 'careerGoal',
      question: t('Hey there, what are you looking for?'),
      type: 'single',
      options: [
        t('Looking for a new career'),
        t('Continuing my education'),
        t('Finding a job in my field of expertise'),
        t('Receiving new certification'),
        t('Other')
      ],
      hasOther: true
    },
    {
      id: 'region',
      question: t('Where do you live in the west bank?'),
      type: 'single',
      options: [
        'Ramallah',
        'Hebron',
        'Nablus',
        'Bethlehem',
        'Jenin',
        'Tulkarm',
        'Qalqilya',
        t('Other')
      ],
      hasOther: true
    },
    {
      id: 'employmentStatus',
      question: t('What is your current employment status?'),
      type: 'single',
      options: [
        t('Employed but not satisfied with my salary'),
        t('Employed but not in my field of study'),
        t('Recently laid off (up to 3 months)'),
        t('Unemployed for more than 3 months'),
        t('Never was employed before')
      ]
    },
    {
      id: 'experience',
      question: t('What Prior Experience do you have?'),
      type: 'single',
      options: [
        t('Bachelor\'s or Undergraduate'),
        t('Higher form of Education'),
        t('Field Experience'),
        t('High school Diploma'),
        t('Internship'),
        t('vocational training'),
        t('Other')
      ],
      hasOther: true
    },
    {
      id: 'university',
      question: t('What university did you attended?'),
      type: 'single',
      options: [
        'Birzeit University',
        'An-Najah National University',
        'Hebron University',
        'Palestine Polytechnic University',
        'Al-Quds University',
        'Bethlehem University',
        'Arab American University',
        'Palestine Technical University',
        'Al-Quds Open University',
        'Khadoorie Technical University',
        'Dar Al-Kalima University',
        'University College of Applied Sciences',
        'Modern University College',
        t('I didn\'t attend university'),
        t('Other')
      ],
      hasOther: true
    },
    {
      id: 'fieldExperience',
      question: t('What field/s is your experience in? (multiple answer)'),
      type: 'multiple',
      options: [
        {
          label: 'IT- ICT',
          subOptions: [
            'Software Development',
            'Network and Systems Administration',
            'Information Systems Management',
            'Telecommunications and Networking',
            'Mobile App Development',
            'UI/UX Design',
            'ICT Education and Training',
            'Cybersecurity',
            'Data Analysis',
            t('Other')
          ]
        },
        {
          label: 'Social & Behavioural Sciences',
          subOptions: [
            'Psychology',
            'Sociology',
            'Anthropology',
            'Political Science',
            'Criminology',
            'Communication Studies',
            'International Relations',
            'Human Geography',
            'Education / Educational Sciences',
            'Social Work',
            t('Other')
          ]
        },
        {
          label: 'AI Consulting',
          subOptions: []
        },
        {
          label: t('Other'),
          subOptions: []
        }
      ]
    },
    {
      id: 'desiredField',
      question: t('What field/s do you wish to work in? (multiple answer)'),
      type: 'multiple',
      options: [
        {
          label: 'IT- ICT',
          subOptions: [
            'Software Development',
            'Network and Systems Administration',
            'Information Systems Management',
            'Telecommunications and Networking',
            'Mobile App Development',
            'UI/UX Design',
            'ICT Education and Training',
            'Cybersecurity',
            'Data Analysis',
            t('Other')
          ]
        },
        {
          label: 'Social & Behavioural Sciences',
          subOptions: [
            'Psychology',
            'Sociology',
            'Anthropology',
            'Political Science',
            'Criminology',
            'Communication Studies',
            'International Relations',
            'Human Geography',
            'Education / Educational Sciences',
            'Social Work',
            t('Other')
          ]
        },
        {
          label: 'AI Consulting',
          subOptions: []
        },
        {
          label: t('Other'),
          subOptions: []
        }
      ]
    },
    {
      id: 'dreamJob',
      question: t('What is your dream job?'),
      type: 'text',
      placeholder: t('Describe your dream job...')
    },
    {
      id: 'remoteCountries',
      question: t('In what countries are you interested in working remotely?'),
      type: 'multiple',
      options: [
        'Bahrain',
        'Kuwait',
        'Oman',
        'Qatar',
        'Saudi Arabia',
        'United Arab Emirates',
        t('Other')
      ],
      hasOther: true
    }
  ], [t]);

  const totalQuestions = questions.length + 1; // +1 for CV upload page
  const progress = ((currentPage + 1) / totalQuestions) * 100;

  useEffect(() => {
    setCurrentPage(0);
  }, []);

  const handleAnswer = (questionId, answer, subOption = null) => {
    console.log('handleAnswer called:', { questionId, answer, subOption, currentAnswers: answers[questionId] });
    
    if (questions[currentPage]?.type === 'multiple') {
      // Check if this is an object option (has sub-options)
      const currentQuestion = questions[currentPage];
      const isObjectOption = currentQuestion.options.some(opt => typeof opt === 'object' && opt.label === answer);
      
      if (isObjectOption) {
        // Handle object options (like ICT with sub-options)
        const currentAnswers = typeof answers[questionId] === 'object' ? answers[questionId] : {};
        
        if (subOption) {
          // Handle sub-options
          const currentSubAnswers = Array.isArray(currentAnswers[answer]) ? currentAnswers[answer] : [];
          const updatedSubAnswers = currentSubAnswers.includes(subOption)
            ? currentSubAnswers.filter(a => a !== subOption)
            : [...currentSubAnswers, subOption];
          
          const newAnswers = {
            ...currentAnswers,
            [answer]: updatedSubAnswers
          };
          
          console.log('Updated sub-options:', newAnswers);
          setAnswers({ ...answers, [questionId]: newAnswers });
        } else {
          // Handle main object option selection
          const newAnswers = currentAnswers[answer]
            ? { ...currentAnswers }
            : { ...currentAnswers, [answer]: [] };
          
          console.log('Updated main option:', newAnswers);
          setAnswers({ ...answers, [questionId]: newAnswers });
        }
      } else {
        // Handle string options (simple array)
        const currentAnswers = Array.isArray(answers[questionId]) ? answers[questionId] : [];
        const newAnswers = currentAnswers.includes(answer)
          ? currentAnswers.filter(a => a !== answer)
          : [...currentAnswers, answer];
        
        setAnswers({ ...answers, [questionId]: newAnswers });
      }
    } else {
      // For single choice questions, handle "Other" option specially
      if (answer === t('Other')) {
        setAnswers({ ...answers, [questionId]: answer });
      } else {
        setAnswers({ ...answers, [questionId]: answer });
      }
    }
  };

  const handleOtherInput = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentPage >= questions.length - 1) {
      setCurrentPage(currentPage + 1);
      return;
    }

    const currentQuestion = questions[currentPage];
    const currentAnswer = answers[currentQuestion.id];
    
    // Check if question is answered
    let isAnswered = false;
    
    if (currentQuestion.type === 'text') {
      isAnswered = currentAnswer && currentAnswer.trim() !== '';
    } else if (currentQuestion.type === 'single') {
      isAnswered = currentAnswer && currentAnswer !== '';
    } else if (currentQuestion.type === 'multiple') {
      if (Array.isArray(currentAnswer)) {
        isAnswered = currentAnswer.length > 0;
      } else if (typeof currentAnswer === 'object') {
        isAnswered = Object.keys(currentAnswer).length > 0;
      } else {
        isAnswered = false;
      }
    }
    
    if (!isAnswered) {
      Alert.alert(t('Error'), t('Please answer the question before continuing.'));
      return;
    }
    
    setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*', // Add support for images
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ],
        multiple: true,
        copyToCacheDirectory: true, // Enable local caching
      });

      if (!result.canceled) {
        const newFiles = result.assets.map(file => ({
          name: file.name,
          uri: file.uri,
          size: file.size,
          type: file.mimeType || 'application/octet-stream',
          isImage: file.mimeType?.startsWith('image/') || false,
          localPath: file.uri, // Store local path for offline access
        }));
        setAnswers({ ...answers, cvFiles: [...answers.cvFiles, ...newFiles] });
      }
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to upload file. Please try again.'));
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map(file => ({
          name: file.name,
          uri: file.uri,
          size: file.size,
          type: file.mimeType || 'image/jpeg',
          isImage: true,
          localPath: file.uri,
        }));
        setAnswers({ ...answers, cvFiles: [...answers.cvFiles, ...newPhotos] });
      }
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to upload photo. Please try again.'));
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = answers.cvFiles.filter((_, i) => i !== index);
    setAnswers({ ...answers, cvFiles: newFiles });
  };

  const handleSkipCV = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    setShowAIModal(true);
    setAnalysisStep(0);
    let cvUrls = [];

    try {
      // Step 1: Upload documents
      setAnalysisStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (answers.cvFiles.length > 0) {
        const uploadPromises = answers.cvFiles.map(file => uploadFile(file, userAuth.uid));
        cvUrls = await Promise.all(uploadPromises);
      }

      // Step 2: Save profile
      setAnalysisStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalUserData = {
        ...initialUserData,
        ...answers,
        uid: userAuth.uid,
        email: userAuth.email,
        cvUrls: cvUrls,
        createdAt: new Date(),
      };
      delete finalUserData.cvFiles;

      const userDocRef = doc(db, 'users', userAuth.uid);
      await setDoc(userDocRef, finalUserData);
      console.log('User profile created in Firestore successfully!');

      // Step 3: AI Analysis
      setAnalysisStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { recommendedCourses, recommendedJobs } = await runFullAiAnalysis(finalUserData);
      
      // Step 4: Complete
      setAnalysisStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const completeUserData = { 
        ...finalUserData, 
        recommendedCourses, 
        recommendedJobs, 
        analysisComplete: true, 
        lastAnalysisDate: new Date() 
      };
      updateUserData(completeUserData);
      
      setShowAIModal(false);
      Alert.alert(
        t('Success'), 
        t('AI recommends these courses and jobs based on your profile!'), 
        [{ text: t('OK'), onPress: () => navigation.navigate('MainScreen') }]
      );

    } catch (error) {
      setShowAIModal(false);
      console.error('Error during final registration step:', error);
      Alert.alert(t('Error'), t('There was a problem saving your profile. We will try to generate recommendations later.'));
      navigation.navigate('MainScreen');
    }
  };

  const renderIntroPage = () => (
    <View style={[styles.introContainer, isDarkMode && styles.introContainerDark]}>
      <Text style={[styles.introTitle, isDarkMode && styles.introTitleDark]}>
        {t('Bridge-IT AI Analysis')}
      </Text>
      <Text style={[styles.introText, isDarkMode && styles.introTextDark]}>
        {t('Bridge-IT AI takes the information from this questionnaire to build up your profile and advise you on courses and jobs that match your skills and goals.')}
      </Text>
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={() => setShowIntro(false)}
      >
        <Text style={styles.startButtonText}>{t('Start Questionnaire')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestion = () => {
    if (currentPage < questions.length) {
      const question = questions[currentPage];
      const currentAnswer = answers[question.id];
      
      return (
        <ScrollView 
          style={styles.questionScrollView} 
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
            <View style={[styles.questionContainer, isDarkMode && styles.questionContainerDark]}>
              <Text style={[styles.questionText, isDarkMode && styles.questionTextDark]}>
                {question.question}
              </Text>
              
              {question.type === 'text' ? (
                <View style={styles.textInputContainer}>
                  <TextInput 
                    style={[styles.textInput, isDarkMode && styles.textInputDark]} 
                    placeholder={question.placeholder} 
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'} 
                    value={currentAnswer || ''} 
                    onChangeText={(text) => handleAnswer(question.id, text)}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    scrollEnabled={true}
                  />
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {question.options.map((option, index) => {
                    // Handle both string and object options
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const isSelected = question.type === 'single' 
                      ? currentAnswer === optionLabel
                      : typeof option === 'object' 
                        ? (currentAnswer && typeof currentAnswer === 'object' && currentAnswer.hasOwnProperty(option.label))
                        : (currentAnswer && Array.isArray(currentAnswer) && currentAnswer.includes(optionLabel));
                    
                    console.log('Rendering option:', { 
                      optionLabel, 
                      isSelected, 
                      currentAnswer, 
                      isObject: typeof option === 'object',
                      hasProperty: currentAnswer && typeof currentAnswer === 'object' && currentAnswer.hasOwnProperty(option.label)
                    });
                    
                    return (
                      <View key={index}>
                        <TouchableOpacity 
                          style={[
                            styles.optionButton, 
                            isDarkMode && styles.optionButtonDark, 
                            isSelected && styles.selectedOption
                          ]} 
                          onPress={() => handleAnswer(question.id, optionLabel)}
                        >
                          <Text style={[
                            styles.optionText, 
                            isDarkMode && styles.optionTextDark, 
                            isSelected && styles.selectedOptionText
                          ]}>
                            {optionLabel}
                          </Text>
                          {question.type === 'multiple' && isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#556B2F" />
                          )}
                        </TouchableOpacity>
                        
                        {/* Render sub-options for multiple choice questions */}
                        {question.type === 'multiple' && typeof option === 'object' && isSelected && option.subOptions && option.subOptions.length > 0 && (
                          <View style={styles.subOptionsContainer}>
                            {option.subOptions.map((subOption, subIndex) => {
                              const subIsSelected = Array.isArray(currentAnswer?.[option.label]) && currentAnswer[option.label].includes(subOption);
                              return (
                                <TouchableOpacity 
                                  key={subIndex}
                                  style={[
                                    styles.subOptionButton,
                                    isDarkMode && styles.subOptionButtonDark,
                                    subIsSelected && styles.selectedSubOption
                                  ]}
                                  onPress={() => handleAnswer(question.id, option.label, subOption)}
                                >
                                  <Ionicons 
                                    name="arrow-forward" 
                                    size={16} 
                                    color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                                    style={styles.subOptionArrow}
                                  />
                                  <Text style={[
                                    styles.subOptionText,
                                    isDarkMode && styles.subOptionTextDark,
                                    subIsSelected && styles.selectedSubOptionText
                                  ]}>
                                    {subOption}
                                  </Text>
                                  {subIsSelected && (
                                    <Ionicons name="checkmark-circle" size={16} color="#556B2F" />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                        
                        {/* Other input field for single choice questions */}
                        {question.type === 'single' && optionLabel === t('Other') && isSelected && (
                          <View style={styles.otherInputContainer}>
                            <Ionicons 
                              name="arrow-forward" 
                              size={16} 
                              color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                              style={styles.otherInputArrow}
                            />
                            <TextInput
                              style={[styles.otherInput, isDarkMode && styles.otherInputDark]}
                              placeholder={t('Please specify...')}
                              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                              value={answers[`${question.id}Other`] || ''}
                              onChangeText={(text) => handleOtherInput(`${question.id}Other`, text)}
                            />
                          </View>
                        )}
                        
                        {/* Other input field for multiple choice questions with string options */}
                        {question.type === 'multiple' && typeof option === 'string' && optionLabel === t('Other') && isSelected && (
                          <View style={styles.otherInputContainer}>
                            <Ionicons 
                              name="arrow-forward" 
                              size={16} 
                              color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                              style={styles.otherInputArrow}
                            />
                            <TextInput
                              style={[styles.otherInput, isDarkMode && styles.otherInputDark]}
                              placeholder={t('Please specify...')}
                              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                              value={answers[`${question.id}Other`] || ''}
                              onChangeText={(text) => handleOtherInput(`${question.id}Other`, text)}
                            />
                          </View>
                        )}
                        
                        {/* Other input field for multiple choice questions with object options */}
                        {question.type === 'multiple' && typeof option === 'object' && optionLabel === t('Other') && isSelected && (
                          <View style={styles.otherInputContainer}>
                            <Ionicons 
                              name="arrow-forward" 
                              size={16} 
                              color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                              style={styles.otherInputArrow}
                            />
                            <TextInput
                              style={[styles.otherInput, isDarkMode && styles.otherInputDark]}
                              placeholder={t('Please specify...')}
                              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                              value={answers[`${question.id}Other`] || ''}
                              onChangeText={(text) => handleOtherInput(`${question.id}Other`, text)}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
      );
    } else {
      return (
        <View style={[styles.cvContainer, isDarkMode && styles.cvContainerDark]}>
          <Text style={[styles.questionText, isDarkMode && styles.questionTextDark]}>
            {t('Please enter your credentials and resume')}
          </Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
            <Ionicons name="cloud-upload-outline" size={24} color="#10B981" />
            <Text style={styles.uploadButtonText}>{t('Upload CV/Resume')}</Text>
          </TouchableOpacity>
          {answers.cvFiles.length > 0 && (
            <View style={styles.filesContainer}>
              <Text style={[styles.filesTitle, isDarkMode && styles.filesTitleDark]}>
                {t('Uploaded Files:')}
              </Text>
              {answers.cvFiles.map((file, index) => (
                <View key={index} style={[styles.fileItem, isDarkMode && styles.fileItemDark]}>
                  <Ionicons name="document-outline" size={20} color="#6B7280" />
                  <Text style={[styles.fileName, isDarkMode && styles.fileNameDark]} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipCV}>
            <Text style={[styles.skipButtonText, isDarkMode && styles.skipButtonTextDark]}>
              {t('Skip CV Upload')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const headerStyle = isDarkMode ? styles.headerDark : styles.header;
  const progressContainerStyle = isDarkMode ? styles.progressContainerDark : styles.progressContainer;
  const progressTextStyle = isDarkMode ? styles.progressTextDark : styles.progressText;
  const navigationContainerStyle = isDarkMode ? styles.navigationContainerDark : styles.navigationContainer;

  if (showIntro) {
    return (
      <SafeAreaView style={containerStyle}>
        {renderIntroPage()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <AIAnalysisModal 
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        analysisStep={analysisStep}
        totalSteps={4}
      />
      <View style={headerStyle}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          {currentPage < questions.length ? t('Questionnaire') : t('CV Upload')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      <View style={progressContainerStyle}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={progressTextStyle}>{Math.round(progress)}% {t('Complete')}</Text>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {renderQuestion()}
        <View style={navigationContainerStyle}>
          {currentPage < totalQuestions - 1 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>{t('Next')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>{t('Finish Registration')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingContent: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 16, alignItems: 'center' },
  loadingContentDark: { backgroundColor: '#1F2937' },
  loadingText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: '#1F2937' },
  loadingTextDark: { color: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  headerTitleDark: { color: '#F9FAFB' },
  headerRight: { width: 40 },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF' },
  progressContainerDark: { backgroundColor: '#1F2937' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#556B2F', borderRadius: 4 },
  progressText: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center' },
  progressTextDark: { color: '#D1D5DB' },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  questionScrollView: { flex: 1 },
  questionScrollContent: { 
    flexGrow: 1,
    paddingBottom: 100,
    paddingHorizontal: 20,
    minHeight: '100%'
  },
  questionContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  questionContainerDark: { backgroundColor: '#1F2937' },
  questionText: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 24, lineHeight: 28 },
  questionTextDark: { color: '#F9FAFB' },
  textInputContainer: { marginTop: 16 },
  textInput: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: '#1F2937', 
    backgroundColor: '#FFFFFF', 
    minHeight: 150, 
    textAlignVertical: 'top',
    lineHeight: 24
  },
  textInputDark: { 
    borderColor: '#374151', 
    color: '#F9FAFB', 
    backgroundColor: '#374151' 
  },
  keyboardAvoidingView: { 
    flex: 1
  },
  optionsContainer: { gap: 12 },
  optionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF' },
  optionButtonDark: { borderColor: '#374151', backgroundColor: '#374151' },
  selectedOption: { borderColor: '#556B2F', backgroundColor: '#F0FDF4' },
  optionText: { fontSize: 16, color: '#374151', flex: 1 },
  optionTextDark: { color: '#D1D5DB' },
  selectedOptionText: { color: '#556B2F', fontWeight: '600' },
  subOptionsContainer: { marginLeft: 20, marginTop: 8, gap: 8 },
  subOptionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#F9FAFB' },
  subOptionButtonDark: { borderColor: '#374151', backgroundColor: '#374151' },
  selectedSubOption: { borderColor: '#556B2F', backgroundColor: '#F0FDF4' },
  subOptionArrow: { marginRight: 8 },
  subOptionText: { fontSize: 14, color: '#374151', flex: 1 },
  subOptionTextDark: { color: '#D1D5DB' },
  selectedSubOptionText: { color: '#556B2F', fontWeight: '600' },
  otherInputContainer: { marginLeft: 20, marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  otherInputArrow: { marginRight: 8 },
  otherInput: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#374151', backgroundColor: '#F9FAFB' },
  otherInputDark: { borderColor: '#374151', color: '#F9FAFB', backgroundColor: '#374151' },
  cvContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cvContainerDark: { backgroundColor: '#1F2937' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, borderWidth: 2, borderColor: '#556B2F', borderStyle: 'dashed', borderRadius: 12, marginVertical: 16 },
  uploadButtonText: { marginLeft: 8, fontSize: 16, color: '#556B2F', fontWeight: '600' },
  filesContainer: { marginTop: 20 },
  filesTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  filesTitleDark: { color: '#F9FAFB' },
  fileItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8 },
  fileItemDark: { backgroundColor: '#374151' },
  fileName: { flex: 1, marginLeft: 8, fontSize: 14, color: '#374151' },
  fileNameDark: { color: '#D1D5DB' },
  skipButton: { alignItems: 'center', paddingVertical: 16, marginTop: 16 },
  skipButtonText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  skipButtonTextDark: { color: '#9CA3AF' },
  navigationContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB',
    zIndex: 1000
  },
  navigationContainerDark: { 
    backgroundColor: '#1F2937', 
    borderTopColor: '#374151',
    zIndex: 1000
  },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#556B2F', paddingVertical: 16, borderRadius: 12 },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginRight: 8 },
  finishButton: { backgroundColor: '#556B2F', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  introContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  introContainerDark: { backgroundColor: '#111827' },
  introTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 24, textAlign: 'center' },
  introTitleDark: { color: '#F9FAFB' },
  introText: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  introTextDark: { color: '#D1D5DB' },
  startButton: { backgroundColor: '#556B2F', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});

export default QuestionnaireScreen;