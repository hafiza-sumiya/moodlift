import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { authService } from "../utils/authService";
import { useAuth } from "../utils/AuthContext";
import { LogoImage } from "../components/LogoLoader";
import {
  COLORS,
  SHADOWS,
  RADIUS,
  FONT,
  WEIGHT,
  SPACING,
} from "@/styles/theme";

export default function AdminLoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.adminLogin({ email, password });

      if (response.success) {
        login();
        // Token is saved by authService
      } else {
        Alert.alert(
          "Login Failed",
          response.message || "Invalid admin credentials. Please try again."
        );
      }
    } catch (error) {
      console.error("Admin login error:", error);
      Alert.alert(
        "Login Error",
        "An error occurred during login. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple hero with logo */}
      <View style={s.hero}>
        <View style={s.logoRow}>
          <LogoImage size={44} style={{ borderRadius: 12 }} />
          <Text style={s.logoName}>MoodLift Admin</Text>
        </View>
        <Text style={s.title}>Admin Panel 🔐</Text>
        <Text style={s.subtitle}>Manage your community with care</Text>
      </View>

      {/* Form card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.cardWrap}
      >
        <ScrollView
          contentContainerStyle={s.card}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.formTitle}>Admin Sign In</Text>

          <Text style={s.label}>Admin Email</Text>
          <TextInput
            style={s.input}
            placeholder="admin@moodlift.com"
            placeholderTextColor="#9ca3af"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            editable={!loading}
          />

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={handleAdminLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>
              {loading ? "Signing in…" : "Admin Login"}
            </Text>
          </TouchableOpacity>

          <View style={s.infoBox}>
            <Text style={s.infoText}>
              🔒 This is a secure admin panel. Contact your administrator if you
              don't have credentials.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary || "#8E48BB",
  },
  hero: {
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 28 : 60,
    paddingHorizontal: SPACING.xl || 20,
    paddingBottom: 36,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm || 8,
    marginBottom: SPACING.xl || 20,
  },
  logoName: {
    fontSize: FONT.xl || 20,
    fontWeight: WEIGHT.extrabold || "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: WEIGHT.extrabold || "900",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONT.sm || 13,
    color: "rgba(255,255,255,0.78)",
    fontWeight: WEIGHT.medium || "500",
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    backgroundColor: "#F7F4FC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: SPACING.xl || 20,
    paddingTop: 32,
    flexGrow: 1,
  },
  formTitle: {
    fontSize: FONT.xl || 20,
    fontWeight: WEIGHT.extrabold || "900",
    color: COLORS.textPrimary || "#1F2937",
    marginBottom: SPACING.xl || 20,
  },
  label: {
    fontSize: FONT.sm || 13,
    fontWeight: WEIGHT.semibold || "600",
    color: COLORS.textSecondary || "#4B5563",
    marginBottom: SPACING.xs || 6,
    marginTop: SPACING.md || 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.md || 12,
    padding: SPACING.md || 12,
    fontSize: FONT.base || 15,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    color: COLORS.textPrimary || "#1F2937",
    ...SHADOWS.sm,
  },
  btn: {
    backgroundColor: COLORS.primary || "#8E48BB",
    borderRadius: RADIUS.full || 50,
    padding: (SPACING.md || 12) + 2,
    alignItems: "center",
    marginTop: SPACING.xl || 20,
    ...SHADOWS.md,
  },
  btnText: {
    color: "#fff",
    fontWeight: WEIGHT.bold || "700",
    fontSize: FONT.base || 15,
  },
  infoBox: {
    marginTop: SPACING.xl || 20,
    backgroundColor: "rgba(142, 72, 187, 0.08)",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary || "#8E48BB",
    padding: SPACING.md || 12,
    borderRadius: RADIUS.sm || 8,
  },
  infoText: {
    color: COLORS.textSecondary || "#4B5563",
    fontSize: FONT.sm || 13,
    lineHeight: 18,
  },
});
