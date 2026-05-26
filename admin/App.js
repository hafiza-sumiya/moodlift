import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LogoLoader from "@/components/LogoLoader";
import { StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/utils/AuthContext";

import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import AdminUsersScreen from "@/screens/AdminUsersScreen";
import AdminStoriesScreen from "@/screens/AdminStoriesScreen";
import AdminCommentsScreen from "@/screens/AdminCommentsScreen";
import AdminLoginScreen from "@/screens/AdminLoginScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Loading splash shown while AsyncStorage token check runs ───────────────
function LoadingScreen() {
  return <LogoLoader />;
}

// ─── Bottom tab navigator (authenticated admin users only) ─────────────────────────
function AdminTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#8E48BB",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 50 + insets.bottom,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsersScreen}
        options={{
          tabBarLabel: "Users",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stories"
        component={AdminStoriesScreen}
        options={{
          tabBarLabel: "Stories",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Comments"
        component={AdminCommentsScreen}
        options={{
          tabBarLabel: "Comments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-multiple" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
// ─── Root navigator — switches stacks based on admin auth state ────────────────────
function AppNavigator() {
  const { isLoggedIn } = useAuth();

  // Still checking AsyncStorage — show branded splash
  if (isLoggedIn === null) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <NavigationContainer>
          <StatusBar barStyle="light-content" />
          {isLoggedIn ? (
            // Admin authenticated stack
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="AdminTabs" component={AdminTabs} />
            </Stack.Navigator>
          ) : (
            // Admin login stack
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 30, backgroundColor: "#f9fafb" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
});
