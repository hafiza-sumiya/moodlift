import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Platform, KeyboardAvoidingView, ScrollView,
} from "react-native";
import { authService } from "../utils/authService";
import { useAuth } from "../utils/AuthContext";
import { LogoImage } from "../components/LogoLoader";
import { COLORS, SHADOWS, RADIUS, FONT, WEIGHT, SPACING } from "../styles/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { alert("Please fill all fields."); return; }
    try {
      setLoading(true);
      await authService.login({ email, password });
      login();
    } catch {
      alert("Login failed. Check your credentials.");
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
          <Text style={s.logoName}>MoodLift</Text>
        </View>
        <Text style={s.title}>Welcome back 👋</Text>
        <Text style={s.subtitle}>Your emotional journey continues here</Text>
      </View>

      {/* Form card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.cardWrap}
      >
        <ScrollView contentContainerStyle={s.card} keyboardShouldPersistTaps="handled">
          <Text style={s.formTitle}>Sign in</Text>

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@email.com"
            placeholderTextColor="#9ca3af"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>{loading ? "Signing in…" : "Login"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={s.linkWrap}>
            <Text style={s.link}>Don't have an account? <Text style={s.linkBold}>Sign up</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: COLORS.primary },
  hero: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 28 : 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 36,
  },
  logoRow:  { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.xl },
  logoName: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: "#fff", letterSpacing: -0.5 },
  title:    { fontSize: 28, fontWeight: WEIGHT.extrabold, color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: FONT.sm, color: "rgba(255,255,255,0.78)", fontWeight: WEIGHT.medium },
  cardWrap: { flex: 1 },
  card: {
    backgroundColor: "#F7F4FC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: SPACING.xl,
    paddingTop: 32,
    flexGrow: 1,
  },
  formTitle: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  label:     { fontSize: FONT.sm, fontWeight: WEIGHT.semibold, color: COLORS.textSecondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT.base,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    color: COLORS.textPrimary,
    ...SHADOWS.sm,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: SPACING.md + 2,
    alignItems: "center",
    marginTop: SPACING.xl,
    ...SHADOWS.md,
  },
  btnText:  { color: "#fff", fontWeight: WEIGHT.bold, fontSize: FONT.base },
  linkWrap: { marginTop: SPACING.lg, alignItems: "center" },
  link:     { color: COLORS.textMuted, fontSize: FONT.sm },
  linkBold: { color: COLORS.primary, fontWeight: WEIGHT.bold },
});
