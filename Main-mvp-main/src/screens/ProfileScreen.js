import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  Alert, TextInput, Modal, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useDarkMode } from '../context/DarkModeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadFile } from '../services/appwriteService';
// Import the new AI analysis function
import { runFullAiAnalysis } from '../services/aiService';

const ProfileScreen = ({ navigation, onScreenChange }) => {
  const { userData, updateUserData } = useUser();
  const { t } = useLanguage();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // For the refresh button
  const [editData, setEditData] = useState({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fullName = userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : t('User');
  const getUserInitial = () => fullName ? fullName.charAt(0).toUpperCase() : 'U';

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(t('Permission required'), t('You need to allow access to your photos to upload an image.'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true, 
        aspect: [1, 1], 
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhotoLocally(result.assets[0]);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert(t('Error'), t('Failed to pick image.'));
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(t('Permission required'), t('You need to allow access to your camera to take a photo.'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhotoLocally(result.assets[0]);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(t('Error'), t('Failed to take photo.'));
    }
  };

  const uploadProfilePhotoLocally = async (imageAsset) => {
    setIsUploadingPhoto(true);
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `profile_${userData.uid}_${timestamp}.jpg`;
      
      // Create the local directory if it doesn't exist
      const localDir = `${FileSystem.documentDirectory}profile_photos/`;
      const dirInfo = await FileSystem.getInfoAsync(localDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
      }

      // Copy the image to local storage
      const localUri = `${localDir}${fileName}`;
      await FileSystem.copyAsync({
        from: imageAsset.uri,
        to: localUri
      });

      // Update user data with local photo path
      const userDocRef = doc(db, 'users', userData.uid);
      await updateDoc(userDocRef, { 
        profileImage: localUri,
        profileImageLocal: true // Flag to indicate this is a local image
      });
      
      updateUserData({ 
        ...userData, 
        profileImage: localUri,
        profileImageLocal: true
      });
      
      Alert.alert(t('Success'), t('Profile photo updated successfully!'));
    } catch (error) {
      console.error("Local photo upload error:", error);
      Alert.alert(t('Error'), t('Failed to save profile photo locally.'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removeProfilePhoto = async () => {
    Alert.alert(
      t('Remove Photo'), 
      t('Are you sure you want to remove your profile photo?'), 
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete local file if it exists
              if (userData.profileImage && userData.profileImageLocal) {
                const fileInfo = await FileSystem.getInfoAsync(userData.profileImage);
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(userData.profileImage);
                }
              }

              // Update user data
              const userDocRef = doc(db, 'users', userData.uid);
              await updateDoc(userDocRef, { 
                profileImage: null,
                profileImageLocal: false
              });
              
              updateUserData({ 
                ...userData, 
                profileImage: null,
                profileImageLocal: false
              });
              
              Alert.alert(t('Success'), t('Profile photo removed!'));
            } catch (error) {
              console.error("Remove photo error:", error);
              Alert.alert(t('Error'), t('Failed to remove profile photo.'));
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(t('Logout'), t('Are you sure you want to logout?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Logout'), onPress: () => navigation.navigate('Welcome') }
    ]);
  };

  const handleEdit = () => {
    setEditData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.firstName || !editData.lastName) {
      Alert.alert(t('Error'), t('First and last name cannot be empty.'));
      return;
    }
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', userData.uid);
      await updateDoc(userDocRef, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
      });
      updateUserData({ ...userData, firstName: editData.firstName, lastName: editData.lastName, phone: editData.phone });
      setShowEditModal(false);
      Alert.alert(t('Success'), t('Profile updated successfully!'));
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to update profile.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => setShowEditModal(false);

  const handleRetakeQuestionnaire = () => {
    navigation.navigate('Questionnaire', {
      userAuth: { uid: userData.uid, email: userData.email },
      userData: { ...userData }
    });
  };
  
  const handleMenuPress = () => {
    if (onScreenChange) onScreenChange('Home');
  };

  const handleRefreshSuggestions = async () => {
    if (!userData) {
      Alert.alert(t('Error'), t('You must be logged in to refresh suggestions.'));
      return;
    }

    setIsRefreshing(true);
    try {
      const newRecommendations = await runFullAiAnalysis(userData);
      updateUserData({ ...userData, recommendedCourses: newRecommendations, lastAnalysisDate: new Date() });
      Alert.alert(t('Success'), t('Your AI suggestions have been refreshed based on your latest profile!'));
    } catch (error) {
      Alert.alert(t('Error'), t('Could not refresh suggestions at this time.'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const { isDarkMode } = useDarkMode();
  const containerStyle = isDarkMode ? styles.containerDark : styles.container;
  const cardStyle = isDarkMode ? styles.cardDark : styles.card;
  const textStyle = isDarkMode ? styles.textDark : styles.text;
  const titleStyle = isDarkMode ? styles.titleDark : styles.title;

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => {
              Alert.alert(
                t('Profile Photo'),
                t('Choose how to update your profile photo'),
                [
                  { text: t('Cancel'), style: 'cancel' },
                  { text: t('Take Photo'), onPress: takePhoto },
                  { text: t('Choose from Gallery'), onPress: pickImage },
                  ...(userData.profileImage ? [{ text: t('Remove Photo'), style: 'destructive', onPress: removeProfilePhoto }] : [])
                ]
              );
            }}>
              {userData.profileImage ? (
                <Image source={{ uri: userData.profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getUserInitial()}</Text>
                </View>
              )}
              <View style={styles.editImageButton}>
                {isUploadingPhoto ? (
                  <ActivityIndicator size={12} color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={12} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
            <Text style={[styles.username, titleStyle]}>{fullName}</Text>
          </View>
        </View>
        <View style={styles.section}><View style={styles.sectionHeader}><View><Text style={[styles.sectionTitle, titleStyle]}>{t('Your Profile')}</Text><Text style={[styles.sectionSubtitle, textStyle]}>{t('Manage your information and preferences.')}</Text></View><TouchableOpacity style={styles.logoutButton} onPress={handleLogout}><Ionicons name="log-out-outline" size={20} color="#6B7280" /><Text style={styles.logoutText}>{t('Logout')}</Text></TouchableOpacity></View></View>
        <View style={[styles.card, cardStyle]}><View style={styles.cardHeader}><Text style={[styles.cardTitle, titleStyle]}>{t('Personal Details')}</Text><TouchableOpacity style={styles.editButton} onPress={handleEdit}><Ionicons name="pencil-outline" size={16} color="#6B7280" /><Text style={styles.editText}>{t('Edit')}</Text></TouchableOpacity></View><View style={styles.detailsGrid}><View style={styles.detailItem}><Text style={[styles.detailLabel, textStyle]}>{t('Full Name')}</Text><Text style={[styles.detailValue, titleStyle]}>{fullName}</Text></View><View style={styles.detailItem}><Text style={[styles.detailLabel, textStyle]}>{t('Email')}</Text><Text style={[styles.detailValue, titleStyle]}>{userData.email || t('Not specified')}</Text></View><View style={styles.detailItem}><Text style={[styles.detailLabel, textStyle]}>{t('Phone')}</Text><Text style={[styles.detailValue, titleStyle]}>{userData.phone || t('Not specified')}</Text></View><View style={styles.detailItem}><Text style={[styles.detailLabel, textStyle]}>{t('Age')}</Text><Text style={[styles.detailValue, titleStyle]}>{userData.age || t('Not specified')}</Text></View></View></View>
        <View style={[styles.card, cardStyle]}><Text style={[styles.cardTitle, titleStyle]}>{t('Questionnaire Answers')}</Text><View style={styles.questionnaireSection}><View style={styles.questionItem}><Text style={[styles.questionLabel, titleStyle]}>{t('Career Goal')}</Text><Text style={[styles.questionAnswer, textStyle]}>{userData.careerGoal || t('Not specified')}</Text></View><View style={styles.questionItem}><Text style={[styles.questionLabel, titleStyle]}>{t('Region')}</Text><Text style={[styles.questionAnswer, textStyle]}>{userData.region || t('Not specified')}</Text></View><View style={styles.questionItem}><Text style={[styles.questionLabel, titleStyle]}>{t('Experience Level')}</Text><Text style={[styles.questionAnswer, textStyle]}>{userData.experience || t('Not specified')}</Text></View><View style={styles.questionItem}><Text style={[styles.questionLabel, titleStyle]}>{t('Field of Experience')}</Text><View style={styles.answerTags}>{userData.field && userData.field.length > 0 ? (userData.field.map((field, index) => (<View key={index} style={styles.answerTag}><Text style={styles.answerTagText}>{field}</Text></View>))) : <Text style={[styles.questionAnswer, textStyle]}>{t('Not specified')}</Text>}</View></View><View style={styles.questionItem}><Text style={[styles.questionLabel, titleStyle]}>{t('Languages')}</Text><View style={styles.answerTags}>{userData.languages && userData.languages.length > 0 ? (userData.languages.map((language, index) => (<View key={index} style={styles.answerTag}><Text style={styles.answerTagText}>{language}</Text></View>))) : <Text style={[styles.questionAnswer, textStyle]}>{t('Not specified')}</Text>}</View></View></View><TouchableOpacity style={styles.retakeButton} onPress={handleRetakeQuestionnaire}><Text style={[styles.retakeButtonText, titleStyle]}>{t('Retake Questionnaire')}</Text></TouchableOpacity></View>
        <View style={[styles.card, cardStyle]}><Text style={[styles.cardTitle, titleStyle]}>{t('AI Analyst')}</Text><Text style={[styles.cardDescription, textStyle]}>{t('Retake the survey or refresh your recommendations based on your latest profile updates.')}</Text><TouchableOpacity style={[styles.refreshButton, isRefreshing && { opacity: 0.7 }]} onPress={handleRefreshSuggestions} disabled={isRefreshing}>{isRefreshing ? <ActivityIndicator color="#FFFFFF" /> : <><Ionicons name="refresh" size={20} color="#FFFFFF" /><Text style={styles.refreshButtonText}>{t('Refresh AI Suggestions')}</Text></>}</TouchableOpacity></View>
      </ScrollView>
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet" transparent={false}><SafeAreaView style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}><View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}><Text style={[styles.modalTitle, titleStyle]}>{t('Edit Profile')}</Text><TouchableOpacity onPress={handleCancelEdit}><Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#1F2937"} /></TouchableOpacity></View><ScrollView style={styles.modalContent}><View style={styles.inputGroup}><Text style={[styles.inputLabel, textStyle]}>{t('First Name')}</Text><TextInput style={[styles.textInput, isDarkMode && styles.textInputDark]} value={editData.firstName} onChangeText={(text) => setEditData({ ...editData, firstName: text })} /></View><View style={styles.inputGroup}><Text style={[styles.inputLabel, textStyle]}>{t('Last Name')}</Text><TextInput style={[styles.textInput, isDarkMode && styles.textInputDark]} value={editData.lastName} onChangeText={(text) => setEditData({ ...editData, lastName: text })} /></View><View style={styles.inputGroup}><Text style={[styles.inputLabel, textStyle]}>{t('Phone')}</Text><TextInput style={[styles.textInput, isDarkMode && styles.textInputDark]} value={editData.phone} onChangeText={(text) => setEditData({ ...editData, phone: text })} keyboardType="phone-pad" /></View></ScrollView><View style={[styles.modalFooter, isDarkMode && styles.modalFooterDark]}><TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}><Text style={styles.cancelButtonText}>{t('Cancel')}</Text></TouchableOpacity><TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit} disabled={isSaving}>{isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{t('Save Changes')}</Text>}</TouchableOpacity></View></SafeAreaView></Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { flex: 1, backgroundColor: '#111827' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  menuButton: { padding: 8, marginRight: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { position: 'relative', width: 60, height: 60, borderRadius: 30, overflow: 'hidden', marginRight: 12, borderWidth: 3, borderColor: '#10B981' },
  avatar: { width: '100%', height: '100%', backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 30 },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  editImageButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', elevation: 5 },
  username: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  titleDark: { color: '#F9FAFB' },
  section: { paddingHorizontal: 16, paddingVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  textDark: { color: '#D1D5DB' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  logoutText: { marginLeft: 4, fontSize: 14, color: '#6B7280', fontWeight: '500' },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cardDark: { backgroundColor: '#1F2937' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
  cardDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8 },
  editText: { marginLeft: 4, fontSize: 14, color: '#6B7280', fontWeight: '500' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  detailItem: { width: '50%', marginBottom: 16, paddingRight: 8 },
  detailLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  detailValue: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
  questionnaireSection: { marginBottom: 20 },
  questionItem: { marginBottom: 16 },
  questionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  questionAnswer: { fontSize: 16, color: '#1F2937', fontWeight: '500' },
  answerTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  answerTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 4 },
  answerTagText: { fontSize: 12, color: '#1E40AF', fontWeight: '500' },
  retakeButton: { alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 16 },
  retakeButtonText: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  refreshButton: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginBottom: 12 },
  refreshButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  modalContainerDark: { backgroundColor: '#111827' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalHeaderDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: '#1F2937', backgroundColor: '#FFFFFF' },
  textInputDark: { borderColor: '#374151', color: '#F9FAFB', backgroundColor: '#374151' },
  modalFooter: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  modalFooterDark: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', marginRight: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '500', color: '#6B7280' },
  saveButton: { flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default ProfileScreen;