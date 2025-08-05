import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const AIAnalysisModal = ({ visible, onClose, analysisStep = 0, totalSteps = 3 }) => {
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const analysisSteps = [
    t('Analyzing your profile...'),
    t('Searching for relevant courses...'),
    t('Finding matching job opportunities...'),
    t('Generating personalized recommendations...'),
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (analysisStep + 1) / totalSteps,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [analysisStep]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            isDarkMode && styles.modalContainerDark,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={32} color="#556B2F" />
            </View>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>
              {t('Bridge-IT AI Analysis')}
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              {t('Building your personalized recommendations')}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, isDarkMode && styles.progressBarDark]}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
                ]}
              />
            </View>
            <Text style={[styles.progressText, isDarkMode && styles.progressTextDark]}>
              {Math.round(((analysisStep + 1) / totalSteps) * 100)}%
            </Text>
          </View>

          {/* Current Step */}
          <View style={styles.stepContainer}>
            <View style={styles.stepIcon}>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color="#556B2F" 
              />
            </View>
            <Text style={[styles.stepText, isDarkMode && styles.stepTextDark]}>
              {analysisSteps[analysisStep] || analysisSteps[analysisSteps.length - 1]}
            </Text>
          </View>

          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((dot) => (
              <Animated.View
                key={dot}
                style={[
                  styles.dot,
                  isDarkMode && styles.dotDark,
                  {
                    backgroundColor: dot <= analysisStep ? '#556B2F' : '#E5E7EB',
                    transform: [{
                      scale: dot === analysisStep ? 1.2 : 1
                    }]
                  }
                ]}
              />
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isDarkMode && styles.footerTextDark]}>
              {t('Please wait while we analyze your profile...')}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDark: {
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#D1D5DB',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarDark: {
    backgroundColor: '#374151',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#556B2F',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressTextDark: {
    color: '#D1D5DB',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepIcon: {
    marginRight: 12,
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  stepTextDark: {
    color: '#F9FAFB',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  dotDark: {
    backgroundColor: '#374151',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerTextDark: {
    color: '#9CA3AF',
  },
});

export default AIAnalysisModal; 