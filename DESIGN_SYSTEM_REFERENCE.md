# MoodLift Design System - Quick Reference Guide

## 🎨 Design Tokens

### Color Palette
```javascript
const colors = {
  primary: '#8E48BB',      // Indigo - Main actions
  success: '#10b981',      // Teal - Positive states
  warning: '#f59e0b',      // Amber - Alerts
  danger: '#ef4444',       // Red - Destructive
  
  // Neutrals
  dark: '#1f2937',         // Text, headings
  gray: '#374151',         // Body text
  lightGray: '#6b7280',    // Secondary text
  border: '#e5e7eb',       // Borders, dividers
  bg: '#f9fafb',           // Page background
  white: '#fff',           // Card background
};
```

### Typography Scale
```javascript
const typography = {
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '500', lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '600' },
  small: { fontSize: 13, fontWeight: '500' },
};
```

### Spacing Scale
```javascript
const spacing = {
  xs: 8,    // Compact elements
  sm: 12,   // Small gaps
  md: 16,   // Standard spacing
  lg: 20,   // Loose spacing
  xl: 24,   // Extra loose
  xxl: 28,  // Section breaks
  xxxl: 32, // Large sections
};
```

### Border Radius
```javascript
const radius = {
  small: 8,   // Inputs, small elements
  medium: 12, // Buttons, modals
  large: 16,  // Cards, sections
  circle: 50, // Avatars
};
```

### Shadows
```javascript
const shadows = {
  none: {},
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};
```

---

## 📐 Component Templates

### Header
```javascript
header: {
  backgroundColor: '#8E48BB',
  paddingVertical: 20,
  paddingHorizontal: 20,
  marginBottom: 24,
  paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
},
headerText: {
  fontSize: 28,
  fontWeight: '800',
  color: '#fff',
  letterSpacing: -0.5,
},
```

### Card
```javascript
card: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
},
```

### Button (Primary)
```javascript
button: {
  backgroundColor: '#8E48BB',
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#8E48BB',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
```

### Button (Secondary)
```javascript
secondaryButton: {
  backgroundColor: '#fff',
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#8E48BB',
  alignItems: 'center',
  justifyContent: 'center',
},
secondaryButtonText: {
  color: '#8E48BB',
  fontSize: 16,
  fontWeight: '700',
},
```

### Input
```javascript
input: {
  backgroundColor: '#f3f4f6',
  borderRadius: 12,
  padding: 14,
  color: '#1f2937',
  fontSize: 15,
  fontWeight: '500',
  borderWidth: 1,
  borderColor: '#e5e7eb',
},
```

### Section Container
```javascript
section: {
  marginBottom: 28,
  paddingHorizontal: 20,
},
sectionTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#1f2937',
  marginBottom: 18,
},
```

---

## 🔍 Common Patterns

### Safe Area + Scrollable Content
```javascript
<SafeAreaView style={styles.safeArea} edges={['top']}>
  <ScrollView
    style={styles.container}
    contentContainerStyle={{
      paddingTop: 0,
      paddingBottom: 32,  // Prevent tab bar overlap
    }}
  >
    {/* Content */}
  </ScrollView>
</SafeAreaView>

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: '#8E48BB',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
};
```

### Responsive Padding
```javascript
header: {
  paddingTop: Platform.OS === 'android' 
    ? (StatusBar.currentHeight || 0) + 12 
    : 12,
  paddingVertical: 20,
  paddingHorizontal: 20,
},
```

### Flex Row with Gap
```javascript
row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,  // Modern spacing (instead of marginHorizontal)
},
```

### Text Hierarchy
```javascript
// H1
{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }

// H2
{ fontSize: 20, fontWeight: '700' }

// H3
{ fontSize: 18, fontWeight: '700' }

// Body
{ fontSize: 15, fontWeight: '500', lineHeight: 24 }

// Label
{ fontSize: 14, fontWeight: '600', color: '#6b7280' }
```

---

## ✅ Best Practices

### ✅ DO
- Use consistent spacing scale (8px base)
- Apply shadows uniformly
- Maintain padding ratios (20-24px for cards)
- Use letterSpacing for headers (-0.5)
- Add bottom padding (32px) to scrollable content
- Keep touch targets 44x44+ pixels
- Use gap for flex layouts

### ❌ DON'T
- Mix shadow styles
- Use arbitrary padding values
- Forget safe area handling
- Make buttons too small
- Use inconsistent borders
- Skip bottom padding
- Nest shadows deeply

---

## 📱 Screen-Specific Patterns

### All Screens Include
```javascript
// Safe area setup
safeArea: {
  flex: 1,
  backgroundColor: '#8E48BB',
}

// Container with padding
container: {
  flex: 1,
  backgroundColor: '#f9fafb',
}

// Scrollable content
content: {
  paddingTop: 0,
  paddingBottom: 32,  // Critical!
}

// Consistent header
header: {
  backgroundColor: '#8E48BB',
  paddingVertical: 20,
  paddingHorizontal: 20,
  paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
  marginBottom: 24,
}
```

---

## 🎨 Color Usage Guide

| Element | Color | Usage |
|---------|-------|-------|
| Primary Buttons | #8E48BB | Main CTAs, active states |
| Header | #8E48BB | Page headers |
| Success | #10b981 | Positive, saved, completed |
| Warning | #f59e0b | Tips, helpful info |
| Danger | #ef4444 | Delete, stop, errors |
| Text (Primary) | #1f2937 | Headings, main text |
| Text (Secondary) | #374151 | Body text |
| Text (Tertiary) | #6b7280 | Labels, hints |
| Border | #e5e7eb | Dividers, borders |
| Background | #f9fafb | Page background |
| Card | #fff | Card backgrounds |

---

## 🔧 Setup Template

Use this as a template for new screens:

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Screen Title</Text>
        </View>
        
        {/* Your content here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8E48BB',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingTop: 0,
    paddingBottom: 32,  // Prevents tab bar overlap
  },
  header: {
    backgroundColor: '#8E48BB',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
});
```

---

## 🚀 Quick Updates

If you need to update a screen quickly:

1. **Header**: Update to 28px, 800 weight, add safe area
2. **Cards**: 20-24px padding, add shadows (0.08 opacity)
3. **Buttons**: 14-18px padding, add shadows on primary
4. **Spacing**: Use 24-28px margins between sections
5. **Bottom**: Add 32px padding to scrollable content

---

## 📞 Support

This guide contains all design tokens and patterns used in MoodLift. Follow these patterns consistently to maintain visual cohesion across the app.

**Version**: 1.0  
**Last Updated**: April 28, 2026  
**Status**: Production Ready ✅
