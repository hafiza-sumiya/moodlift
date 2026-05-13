# 🚀 How to Test MoodLift on Your Device

## Current Status
✅ Project is running successfully on Expo
✅ All dependencies installed and working
✅ No compilation errors
✅ Metro Bundler is ready for connections

---

## Option 1: Test on Android Device/Emulator (Recommended)

### Step 1: Start Expo Server
```bash
cd "C:\Users\ziddi\Desktop\MoodLift - Copy (2)"
npm start
```

### Step 2: Open on Android
```
Option A: Press 'a' in the terminal to open on Android Emulator
Option B: Scan QR code with Android device that has Expo Go installed
```

### Step 3: Test Features
1. **Home Screen** - Verify:
   - Icons display (emoticon-happy, meditation, timer)
   - Stories load from backend
   - Streak badge shows
   - Quick action buttons work

2. **Journal Screen** - Test:
   - Type selector icons (emoticon-happy, emoticon-sad)
   - Share button (should open share dialog)
   - Save functionality
   - Previous entries display

3. **Calendar Screen** - Check:
   - Navigation icons (chevron-left, chevron-right)
   - Calendar grid displays
   - Mood colors show correctly

4. **Profile Screen** - Verify:
   - Achievement badges show
   - Click on achievement = opens popup with animation
   - Clear All Data button works
   - Achievement modal displays surprise message

---

## Option 2: Test on iOS (if available)

```bash
npm start
# Press 'i' to open on iOS Simulator
```

---

## Option 3: Test on Web

```bash
npm start
# Press 'w' to open in web browser
```

**Note**: Some features like device sharing might behave differently on web

---

## Common Commands

| Command | Action |
|---------|--------|
| `npm start` | Start Expo development server |
| `npm start -- --reset-cache` | Start with cleared cache (if you get errors) |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `Press a` | Open on Android emulator |
| `Press w` | Open on web |
| `Press r` | Reload app |
| `Press m` | Toggle Expo menu |
| `Ctrl+C` | Exit Expo |

---

## Testing Checklist

### Recovery Stories ✅
- [ ] Stories appear on HomeScreen
- [ ] Loading indicator shows while fetching
- [ ] Can click on stories to see details
- [ ] Can share condition from HomeScreen

### Share Functionality ✅
- [ ] Navigate to Journal screen
- [ ] Write an entry
- [ ] Click Share button
- [ ] Native share dialog opens
- [ ] Can select share option (Email, SMS, etc.)

### Icons Display ✅
- [ ] HomeScreen: 3 action icons visible
- [ ] CalendarScreen: Previous/Next arrows visible
- [ ] JournalScreen: Mood selector icons visible
- [ ] JournalScreen: Save & Share icons visible
- [ ] ProfileScreen: Trophy icon in achievement modal

### Achievement System ✅
- [ ] Click unlocked achievement badge
- [ ] Modal popup appears with animation
- [ ] Surprise message displays
- [ ] Celebration emojis show
- [ ] "Continue" button closes modal

### Clear Data ✅
- [ ] Go to ProfileScreen > Settings
- [ ] Click "Clear All Data"
- [ ] Confirmation alert appears
- [ ] Click Delete
- [ ] All data removed from device
- [ ] UI resets to initial state

---

## If You Encounter Errors

### Error: "Unable to resolve module"
```bash
npm start -- --reset-cache
```

### Error: "Port 8081 is in use"
- Close any other Expo instances
- Or press 'y' when asked to use another port

### Error: "Module not found"
```bash
npm install
npm start -- --reset-cache
```

### Bundling Takes Too Long
- This is normal on first load
- Be patient, it may take 1-2 minutes
- Subsequent reloads are much faster

---

## Backend Connection

For recovery stories to load, ensure:
1. Backend is running: `npm run dev` in `/backend` folder
2. MongoDB is running (locally or remote)
3. API URL is correct: `http://192.168.43.187:5000/api`

---

## Screenshots/Demo Points

When testing, check these specific features:

1. **HomeScreen Icons** - All three quick action buttons have proper Material Community Icons
2. **Achievement Popup** - Beautiful animation with elastic effect (bouncy feeling)
3. **Surprise Messages** - Different messages for different streak levels
4. **Share Dialog** - Native OS share sheet opens when clicking share
5. **Data Persistence** - Mood entries saved to device storage

---

## Helpful Tips

✅ Restart app after clearing cache: Press 'r' in terminal
✅ Check console for errors: Press 'j' for debugger
✅ Toggle menu: Press 'm' to see all options
✅ Network issues: Ensure device is on same WiFi as development machine
✅ Icons not showing: Clear cache and reload

---

## Support

If you encounter any issues:
1. Check PROJECT_STATUS.md for current state
2. Check CODE_SNIPPETS.md for implementation details
3. Run with `--reset-cache` flag
4. Check console logs for error messages
5. Verify backend is running for story features

---

**Happy Testing! 🎉**

The app is fully functional and ready for use.
