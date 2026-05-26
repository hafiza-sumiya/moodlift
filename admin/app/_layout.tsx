import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AuthProvider, useAuth } from "@/context/auth-context";

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E1B4B" }}>
      <ActivityIndicator size="large" color="#8E48BB" />
    </View>
  );
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login";

    if (!token && !inAuthGroup) {
      router.replace("/login");
    } else if (token && inAuthGroup) {
      router.replace("/");
    }
  }, [token, loading, segments]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RouteGuard>
          <AnimatedSplashOverlay />
          <AppTabs />
        </RouteGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
