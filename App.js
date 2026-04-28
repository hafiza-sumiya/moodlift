import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import MoodTrackingScreen from "./src/screens/MoodTrackingScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import InsightsScreen from "./src/screens/InsightsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import BreathingExerciseScreen from "./src/screens/BreathingExerciseScreen";
import FocusTimerScreen from "./src/screens/FocusTimerScreen";
import JournalScreen from "./src/screens/JournalScreen";
import StoryDetailsScreen from "./src/screens/StoryDetailsScreen";
import ShareConditionScreen from "./src/screens/ShareConditionScreen";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#8E48BB",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 45 + insets.bottom,
          paddingVertical: 6,
          borderRadius: 25,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: "Insights",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="MoodTracking"
              component={MoodTrackingScreen}
              options={{
                headerShown: true,
                title: "Track Your Mood",
                headerStyle: { backgroundColor: "#8E48BB" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="BreathingExercise"
              component={BreathingExerciseScreen}
              options={{
                headerShown: true,
                title: "Breathing Exercise",
                headerStyle: { backgroundColor: "#8E48BB" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="FocusTimer"
              component={FocusTimerScreen}
              options={{
                headerShown: true,
                title: "Focus Timer",
                headerStyle: { backgroundColor: "#8E48BB" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="Journal"
              component={JournalScreen}
              options={{
                headerShown: true,
                title: "Daily Reflection",
                headerStyle: { backgroundColor: "#8E48BB" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="StoryDetails"
              component={StoryDetailsScreen}
              options={{
                headerShown: true,
                title: "Recovery Story",
                headerStyle: { backgroundColor: "#8E48BB" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="ShareCondition"
              component={ShareConditionScreen}
              options={{
                headerShown: true,
                title: "Share Your Condition",
                headerStyle: { backgroundColor: "#8E48BB" },
                headerTintColor: "#fff",
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
