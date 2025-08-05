# Bridge It Mobile App

A clean React Native mobile application built with Expo.

## 🚀 Features

- **Welcome Screen** - Beautiful gradient design with olive theme
- **Registration Screen** - User registration form with validation
- **Dashboard Screen** - Main dashboard with statistics and quick actions
- **Profile Screen** - User profile management with settings
- **Navigation** - Smooth navigation between screens
- **Olive Theme** - Consistent olive green color scheme throughout

## 📱 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your phone

## 🛠️ Installation

1. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli@latest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🎯 Running the App

### Method 1: Using Expo Go (Recommended)

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Scan the QR code:**
   - Open the Expo Go app on your phone
   - Scan the QR code that appears in your terminal
   - The app will load on your phone

### Method 2: Using Tunnel Mode

If you have network issues, try tunnel mode:
```bash
npx expo start --tunnel
```

### Method 3: Web Development

Run on web browser:
```bash
npm run web
```

## 📁 Clean Project Structure

```
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── src/
│   └── screens/         # Screen components
│       ├── WelcomeScreen.js
│       ├── RegistrationScreen.js
│       ├── DashboardScreen.js
│       └── ProfileScreen.js
└── assets/              # App icons and images
```

## 🎨 Design Features

- **Olive Green Theme** (`#556B2F`) throughout the app
- **Material Design Icons** from Expo Vector Icons
- **React Native Paper** components for consistent UI
- **Linear Gradients** for beautiful backgrounds
- **Responsive Design** optimized for mobile screens

## 📋 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser

## 🔧 Troubleshooting

1. **If you get dependency errors:**
   ```bash
   npm install --force
   ```

2. **If Expo CLI is not found:**
   ```bash
   npm install -g @expo/cli@latest
   ```

3. **If the QR code doesn't work:**
   - Make sure your phone and computer are on the same WiFi network
   - Try using tunnel mode: `npx expo start --tunnel`
   - Use the Expo Go app's manual connection option

## 🎯 What's Included

✅ **Welcome Screen** - Beautiful gradient welcome page
✅ **Registration Form** - Complete user registration with validation
✅ **Dashboard** - Statistics, quick actions, and recent activity
✅ **Profile Management** - User profile with settings and preferences
✅ **Navigation** - Smooth transitions between screens
✅ **Mobile-Optimized** - Designed specifically for mobile devices
✅ **Clean Code** - Removed all unnecessary web files

## 📞 Support

For more information and support, please contact the development team.