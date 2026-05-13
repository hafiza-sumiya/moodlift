import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import AchievementModal from "../components/AchievementModal";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../utils/AuthContext";

export default function ProfileScreen() {
  const [userName, setUserName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [achievements, setAchievements] = useState({});
  const { logout } = useAuth();
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedAchievementStreak, setSelectedAchievementStreak] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const name = await storage.getUserName();
    const currentStreak = await storage.getStreakCount();
    const moodData = await storage.getMoodData();
    const userAchievements = await storage.getAchievements();

    setUserName(name || "User");
    setStreak(currentStreak);
    setTotalEntries(moodData.length);
    setAchievements(userAchievements);
  };

  const startEditingName = () => {
    setEditedName(userName);
    setIsEditingName(true);
  };

  const saveUserName = async () => {
    if (editedName && editedName.trim()) {
      await storage.saveUserName(editedName.trim());
      setUserName(editedName.trim());
      setIsEditingName(false);
    } else {
      Alert.alert("Invalid Name", "Please enter a valid name.");
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your mood data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await storage.clearAllData();
              if (success) {
                Alert.alert("Data Cleared", "All data has been cleared.");
                // Reset state to initial values
                setUserName("User");
                setStreak(0);
                setTotalEntries(0);
                setAchievements({});
              } else {
                Alert.alert("Error", "Failed to clear data. Please try again.");
              }
            } catch (error) {
              Alert.alert("Error", "An error occurred while clearing data.");
              console.error("Clear data error:", error);
            }
          },
        },
      ],
    );
  };

  const handleAchievementPress = (streakValue) => {
    setSelectedAchievementStreak(streakValue);
    setAchievementModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderText}>Profile</Text>
        </View>

        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {!isEditingName ? (
            <>
              <Text style={styles.userName}>{userName}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={startEditingName}
              >
                <Text style={styles.editButtonText}>Edit Name</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                autoFocus
              />
              <View style={styles.nameEditButtons}>
                <TouchableOpacity
                  style={[styles.nameEditButton, styles.saveButton]}
                  onPress={saveUserName}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nameEditButton, styles.cancelButton]}
                  onPress={cancelEditingName}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
            <Text style={styles.statEmoji}>🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalEntries}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
            <Text style={styles.statEmoji}>📊</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            <TouchableOpacity
              style={[
                styles.achievementBadge,
                streak >= 1 && styles.achievementUnlocked,
                streak >= 1 && styles.achievementGlow,
              ]}
              onPress={() => handleAchievementPress(1)}
              disabled={streak < 1}
            >
              <Text style={styles.achievementEmoji}>
                {streak >= 1 ? "🔥" : "🔒"}
              </Text>
              <Text style={styles.achievementText}>1-Day Streak</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.achievementBadge,
                streak >= 7 && styles.achievementUnlocked,
                streak >= 7 && styles.achievementGlow,
              ]}
              onPress={() => handleAchievementPress(7)}
              disabled={streak < 7}
            >
              <Text style={styles.achievementEmoji}>
                {streak >= 7 ? "🏆" : "🔒"}
              </Text>
              <Text style={styles.achievementText}>7-Day Streak</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.achievementBadge,
                totalEntries >= 10 && styles.achievementUnlocked,
                totalEntries >= 10 && styles.achievementGlow,
              ]}
              onPress={() => handleAchievementPress(10)}
              disabled={totalEntries < 10}
            >
              <Text style={styles.achievementEmoji}>
                {totalEntries >= 10 ? "⭐" : "🔒"}
              </Text>
              <Text style={styles.achievementText}>10 Entries</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.achievementBadge,
                totalEntries >= 30 && styles.achievementUnlocked,
                totalEntries >= 30 && styles.achievementGlow,
              ]}
              onPress={() => handleAchievementPress(30)}
              disabled={totalEntries < 30}
            >
              <Text style={styles.achievementEmoji}>
                {totalEntries >= 30 ? "✨" : "🔒"}
              </Text>
              <Text style={styles.achievementText}>30 Entries</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.achievementBadge,
                streak >= 30 && styles.achievementUnlocked,
                streak >= 30 && styles.achievementGlow,
              ]}
              onPress={() => handleAchievementPress(30)}
              disabled={streak < 30}
            >
              <Text style={styles.achievementEmoji}>
                {streak >= 30 ? "👑" : "🔒"}
              </Text>
              <Text style={styles.achievementText}>30-Day Streak</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.achievementBadge,
                streak >= 180 && styles.achievementUnlocked,
                streak >= 180 && styles.achievementGlow,
              ]}
              onPress={() => handleAchievementPress(180)}
              disabled={streak < 180}
            >
              <Text style={styles.achievementEmoji}>
                {streak >= 180 ? "🌟" : "🔒"}
              </Text>
              <Text style={styles.achievementText}>6-Month Streak</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingSubtext}>Coming soon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Export Data</Text>
            <Text style={styles.settingSubtext}>Coming soon</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={clearAllData}
          >
            <Text style={[styles.settingText, styles.dangerText]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: "#8E48BB" }]}
          onPress={async () => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                onPress: async () => {
                  await logout();
                },
              },
            ]);
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>MoodLift</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your companion for tracking and managing academic stress
          </Text>
        </View>
      </ScrollView>

      <AchievementModal
        visible={achievementModalVisible}
        onClose={() => setAchievementModalVisible(false)}
        streak={selectedAchievementStreak}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#8E48BB",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingTop: 0,
    paddingBottom: 32,
  },
  pageHeader: {
    backgroundColor: "#8E48BB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  pageHeaderText: {
    fontSize: 22,
    fontWeight: "400",
    color: "#fff",
    letterSpacing: -0.5,
  },

  header: {
    alignItems: "center",
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#8E48BB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 14,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eef2ff",
  },
  editButtonText: {
    color: "#8E48BB",
    fontWeight: "600",
    fontSize: 14,
  },
  nameEditContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  nameInput: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    borderWidth: 2,
    borderColor: "#8E48BB",
    marginBottom: 12,
  },
  nameEditButtons: {
    flexDirection: "row",
    gap: 12,
  },
  nameEditButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: "#8E48BB",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#8E48BB",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
    fontWeight: "600",
  },
  statEmoji: {
    fontSize: 28,
  },
  section: {
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 18,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementBadge: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementUnlocked: {
    borderColor: "#fbbf24",
    backgroundColor: "#fef3c7",
  },
  achievementGlow: {
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  settingItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  settingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  dangerText: {
    color: "#ef4444",
    fontWeight: "700",
  },
  settingSubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
  appInfo: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8E48BB",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
});
