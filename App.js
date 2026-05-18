import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./src/utils/AuthContext";
import LogoLoader from "./src/components/LogoLoader";

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
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import DeepReflectionScreen from "./src/screens/DeepReflectionScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Loading splash shown while AsyncStorage token check runs ───────────────
function LoadingScreen() {
    return <LogoLoader />;
}

// ─── Bottom tab navigator (authenticated users only) ─────────────────────────
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

// ─── Root navigator — switches stacks based on auth state ────────────────────
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
                    <StatusBar style="auto" />
                    <Stack.Navigator screenOptions={{ headerShown: false }}>

                        {/* ── Unified Application Stack ───────────────────────────────────────── */}
                        {/* 
                          By placing all screens in the main stack, we allow guest users 
                          to freely navigate the app (like reading public stories) while keeping 
                          the authentication screens accessible whenever they attempt protected actions.
                        */}
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />

                        {/* ── Protected Features (Accessible but protected inside) ── */}
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
                        <Stack.Screen
                            name="DeepReflection"
                            component={DeepReflectionScreen}
                            options={{
                                headerShown: true,
                                title: "Reflect Deeper",
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

// ─── Root export ─────────────────────────────────────────────────────────────
export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
});
