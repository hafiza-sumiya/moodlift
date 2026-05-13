import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { authService } from "../utils/authService";
import { useAuth } from "../utils/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await authService.login({ email, password });
      login(); // signals AuthContext → navigator swaps to app stack
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to continue your journey</Text>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Signup */}
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>Don’t have an account? Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8E48BB",
  },

  header: {
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 40 : 60,
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#e9d5ff",
  },

  card: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    justifyContent: "center",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#8E48BB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  link: {
    marginTop: 18,
    textAlign: "center",
    color: "#8E48BB",
    fontWeight: "600",
  },
});
