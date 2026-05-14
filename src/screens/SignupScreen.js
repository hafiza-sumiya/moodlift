import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform, StatusBar, ScrollView, KeyboardAvoidingView,
} from "react-native";
import { authService } from "../utils/authService";
import { useAuth } from "../utils/AuthContext";
import { LogoImage } from "../components/LogoLoader";
import { COLORS, SHADOWS, RADIUS, FONT, WEIGHT, SPACING } from "../styles/theme";

export default function SignupScreen({ navigation }) {
  const { login }                       = useAuth();
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      return Alert.alert("Error", "All fields are required");
    }
    if (loading) return;
    try {
      setLoading(true);
      await authService.signup({ name, email, password });
      Alert.alert("Success", "Account created!");
      await authService.login({ email, password });
      login();
    } catch (err) {
      Alert.alert("Signup failed", err.message);
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
        <Text style={s.title}>Create account 🚀</Text>
        <Text style={s.subtitle}>Start your emotional wellness journey</Text>
      </View>

      {/* Form card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.cardWrap}
      >
        <ScrollView contentContainerStyle={s.card} keyboardShouldPersistTaps="handled">
          <Text style={s.formTitle}>Sign up</Text>

          <Text style={s.label}>Name</Text>
          <TextInput
            style={s.input}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@email.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={s.label}>Password</Text>
          <View style={s.pwdRow}>
            <TextInput
              style={s.pwdInput}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Sign Up</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={s.linkWrap}>
            <Text style={s.link}>Already have an account? <Text style={s.linkBold}>Login</Text></Text>
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
  pwdRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    ...SHADOWS.sm,
  },
  pwdInput: { flex: 1, padding: SPACING.md, fontSize: FONT.base, color: COLORS.textPrimary },
  eyeBtn:   { padding: SPACING.md },
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
