import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator, // Added for loading state
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
// Import Firebase services
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const RegistrationScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added for loading state

  const handleCreateAccount = async () => { // Made this function async
    if (!email || !password || !confirmPassword || !firstName || !lastName || !age || !phone) {
      Alert.alert(t('Error'), t('Please fill in all fields'));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t('Error'), t('Password must be at least 8 characters'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('Error'), t('Passwords do not match'));
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      Alert.alert(t('Error'), t('Age must be at least 18 years old'));
      return;
    }

    setIsLoading(true); // Start loading
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Firebase user created successfully:', user.uid);
      
      // Navigate to the Questionnaire with all user info, including the new UID
      navigation.navigate('Questionnaire', {
        userAuth: { uid: user.uid, email: user.email }, // Pass auth info
        userData: { // Pass form data
          firstName,
          lastName,
          age: ageNum.toString(),
          phone,
        }
      });

    } catch (error) {
      console.error('Firebase Signup Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(t('Error'), t('That email address is already in use!'));
      } else {
        Alert.alert(t('Error'), error.message);
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleBackToSignIn = () => {
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToSignIn}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
              <Text style={styles.backText}>{t('Back to sign in')}</Text>
            </TouchableOpacity>
            <View style={styles.formContainer}>
              <Text style={styles.title}>{t('Create your account')}</Text>

              {/* All TextInput fields remain the same */}
              <View style={styles.inputGroup}><Text style={styles.label}>{t('First Name')}</Text><View style={styles.inputContainer}><Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your first name" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} autoCapitalize="words" autoComplete="given-name" /></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>{t('Last Name')}</Text><View style={styles.inputContainer}><Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your last name" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} autoCapitalize="words" autoComplete="family-name" /></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>{t('Age')}</Text><View style={styles.inputContainer}><Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your age (minimum 18)" placeholderTextColor="#9CA3AF" value={age} onChangeText={setAge} keyboardType="numeric" autoComplete="off" /></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>{t('Phone Number')}</Text><View style={styles.inputContainer}><Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor="#9CA3AF" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" /></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>{t('Email')}</Text><View style={styles.inputContainer}><Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" /></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>{t('Password')}</Text><View style={styles.inputContainer}><Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Min. 8 characters" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="new-password" /><TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" /></TouchableOpacity></View></View>
              <View style={styles.inputGroup}><Text style={styles.label}>{t('Confirm Password')}</Text><View style={styles.inputContainer}><Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor="#9CA3AF" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} autoComplete="new-password" /><TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}><Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" /></TouchableOpacity></View></View>
              
              <TouchableOpacity style={[styles.createButton, isLoading && { opacity: 0.7 }]} onPress={handleCreateAccount} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>{t('Create Account')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center',
    paddingVertical: 40,
    minHeight: '100%'
  },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, paddingVertical: 10 },
  backText: { marginLeft: 8, fontSize: 16, color: '#6B7280', fontWeight: '400' },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 32 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 14 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2937', fontWeight: '400' },
  eyeIcon: { padding: 4 },
  createButton: { backgroundColor: '#1F2937', borderRadius: 12, paddingVertical: 16, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default RegistrationScreen;