# MoodLift - Academic Stress Management App

A React Native mobile application built with Expo to help students monitor and manage academic stress through mood tracking, breathing exercises, focus timers, and insights.

## Features

- **Mood Tracking**: Multi-step mood tracking with swipe cards, emoji selection, grounding exercises (5-4-3-2-1 technique), and color-coded mood selection
- **Daily Calendar**: Visual mood calendar with color-coded weekly view
- **Breathing Exercises**: Guided breathing exercises with customizable timers
- **Focus Timer**: Pomodoro-style focus timer with preset and custom durations
- **Daily Reflection Journal**: Write about positive or negative moments
- **Triggers & Insights**: Analyze mood patterns, stress frequency, and weekly patterns
- **Achievements**: Track streaks and milestones
- **Motivational Feed**: Daily quotes and tips

## Tech Stack

- React Native with Expo
- React Navigation (Stack & Bottom Tabs)
- AsyncStorage for local data persistence
- React Native Gesture Handler for swipe interactions
- React Native Reanimated for animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your Android device (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on Android:
```bash
npm run android
```

Or scan the QR code with Expo Go app on your Android device.

## Project Structure

```
MoodLift/
├── App.js                 # Main app entry point with navigation
├── src/
│   ├── screens/          # All screen components
│   │   ├── HomeScreen.js
│   │   ├── MoodTrackingScreen.js
│   │   ├── CalendarScreen.js
│   │   ├── InsightsScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── BreathingExerciseScreen.js
│   │   ├── FocusTimerScreen.js
│   │   └── JournalScreen.js
│   ├── utils/            # Utility functions
│   │   ├── storage.js    # AsyncStorage wrapper
│   │   └── helpers.js    # Helper functions
│   └── data/             # Static data
│       └── motivationalQuotes.json
├── package.json
└── app.json              # Expo configuration
```

## Key Features Implementation

### Mood Tracking Flow
1. **Swipe Cards**: Tinder-style swipe to select initial feeling (energetic, distracted, tired)
2. **Emoji Selection**: Choose from positive, neutral, or stressed emojis
3. **Grounding Exercise**: 5-4-3-2-1 technique with 30-second timer
4. **Color Selection**: Choose mood color (Green=Calm, Yellow=Hopeful, Blue=Tired, Orange=Motivated, Red=Stressed, Purple=Confused)

### Data Persistence
All data is stored locally using AsyncStorage:
- User name
- Mood entries with timestamps
- Journal entries
- Achievements and streaks

### Insights & Analytics
- Most common mood analysis
- Stress frequency calculation
- Weekly pattern detection
- Common feeling triggers
- Personalized recommendations

## Notes

- The app is designed for Android but can be easily adapted for iOS
- All data is stored locally (no backend required)
- Notifications feature is prepared but not fully implemented
- Share functionality in journal uses placeholder (can be implemented with React Native Share API)

## License

This project is created for educational purposes.

