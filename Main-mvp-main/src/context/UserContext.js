import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    profileImage: null,
    // Questionnaire fields
    careerGoal: '',
    experience: '',
    field: [],
    languages: [],
    location: '',
    university: '',
    degree: '',
    specialization: '',
    // Add other user fields as needed
  });

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const updateProfileImage = (imageUri) => {
    console.log('Updating profile image in UserContext:', imageUri);
    setUserData(prev => ({ ...prev, profileImage: imageUri }));
  };

  const clearUserData = () => {
    setUserData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: '',
      profileImage: null,
      // Questionnaire fields
      careerGoal: '',
      experience: '',
      field: [],
      languages: [],
      location: '',
      university: '',
      degree: '',
      specialization: '',
    });
  };

  const value = {
    userData,
    updateUserData,
    updateProfileImage,
    clearUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 