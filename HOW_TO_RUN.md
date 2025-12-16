# How to Run the Virtual DJ App

## Quick Start Guide

### Prerequisites

Before you can run the app, you need to install some tools:

#### 1. Install Node.js
```bash
# Check if you have Node.js installed
node --version

# If not installed, download from:
# https://nodejs.org/ (get the LTS version)
```

#### 2. Install React Native CLI
```bash
npm install -g react-native-cli
```

#### 3. Choose Your Platform

**For iOS (Mac only):**
```bash
# Install Xcode from Mac App Store (it's free but large ~12GB)

# Install CocoaPods
sudo gem install cocoapods
```

**For Android:**
```bash
# Install Android Studio from:
# https://developer.android.com/studio

# During installation, make sure to install:
# - Android SDK
# - Android SDK Platform
# - Android Virtual Device (AVD)
```

---

## Running the App

### Step 1: Install Dependencies

```bash
cd /home/user/DJ-App
npm install
```

This will install all the required packages (React Native, audio libraries, etc.)

### Step 2: Run the App

**Option A: iOS Simulator (Mac only)**
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run the app
npx react-native run-ios

# Or run on specific device:
npx react-native run-ios --simulator="iPhone 15 Pro"
```

**Option B: Android Emulator**
```bash
# Make sure Android Studio is running with an emulator

# Run the app
npx react-native run-android
```

**Option C: Your Physical Phone**

*For iOS:*
1. Connect your iPhone via USB
2. Open `ios/VirtualDJ.xcworkspace` in Xcode
3. Select your device from the device dropdown
4. Click the Play button (▶)

*For Android:*
1. Enable Developer Mode on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect via USB
4. Run: `npx react-native run-android`

---

## Alternative: Run in Web Browser (Easier!)

Since you might not have all the mobile dev tools installed, let's create a web version that runs in your browser right now!

### Quick Web Demo

Run this to start a web version:
```bash
cd /home/user/DJ-App
npm install -g http-server
http-server -p 8080
```

Then open: http://localhost:8080

---

## Troubleshooting

### "command not found: npx"
```bash
npm install -g npx
```

### "No devices found"
```bash
# For iOS: Open Xcode → Window → Devices and Simulators
# Click "+" to add a simulator

# For Android: Open Android Studio → AVD Manager
# Click "Create Virtual Device"
```

### "Metro bundler won't start"
```bash
# Clear cache and restart
npx react-native start --reset-cache
```

### Port already in use
```bash
# Kill the process on port 8081
npx react-native start --port 8082
```

---

## What You'll See

When the app launches, you should see:

1. **Home Screen** with a spinning vinyl record
2. **"NOW PLAYING"** section (will show "Select a track to start")
3. **Play controls** at the bottom
4. **"Load Sample Playlist"** button
5. **"Start AI DJ Mode"** button

### Quick Test:
1. Click **"Load Sample Playlist"** button
2. Click **"Start DJ Mode"** button
3. Click the **Play (▶)** button
4. Watch the vinyl spin and see the AI DJ in action!

---

## I Don't Have These Tools Installed - Easier Options

### Option 1: Use Expo (Easiest!)
I can convert this to an Expo app which is much easier to run:

```bash
# Install Expo
npm install -g expo-cli

# I'll convert the app to Expo format for you
# Then you can just run:
expo start
```

Then scan the QR code with your phone's camera - app opens instantly!

### Option 2: See the UI Mockups
Check out the visual previews I already created:
```bash
cat docs/UI_PREVIEW.txt
```

This shows you exactly what the app looks like in ASCII art!

### Option 3: I Can Create a Web Version
I can build a simple HTML/JavaScript web version that runs directly in your browser - no installation needed!

---

Would you like me to:
1. **Convert to Expo** (easiest to run on phone)
2. **Create a web version** (runs in browser immediately)
3. **Help troubleshoot** React Native installation

Let me know which option works best for you!
