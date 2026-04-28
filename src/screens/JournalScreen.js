import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { getDateKey } from "../utils/helpers";
import * as Sharing from "expo-sharing";

export default function JournalScreen() {
  const [entry, setEntry] = useState("");
  const [type, setType] = useState(null); // 'positive' or 'negative'
  const [savedEntries, setSavedEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const entries = await storage.getJournalEntries();
    setSavedEntries(entries);
  };

  const handleSave = async () => {
    if (!entry.trim()) {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }

    if (!type) {
      Alert.alert(
        "Select Type",
        "Please select whether this is a positive or negative moment.",
      );
      return;
    }

    const journalEntry = {
      id: Date.now().toString(),
      date: getDateKey(),
      timestamp: new Date().toISOString(),
      text: entry.trim(),
      type: type,
    };

    await storage.saveJournalEntry(journalEntry);
    Alert.alert("Saved!", "Your reflection has been saved.", [
      {
        text: "OK",
        onPress: () => {
          setEntry("");
          setType(null);
          loadEntries();
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!entry.trim()) {
      Alert.alert("Empty Entry", "Please write something before sharing.");
      return;
    }

    try {
      await Sharing.shareAsync(
        "data:text/plain;base64," + 
        Buffer.from(entry.trim()).toString("base64"),
        {
          mimeType: "text/plain",
          dialogTitle: "Share Journal Entry",
        }
      );
    } catch (error) {
      console.log("Share error:", error);
      Alert.alert("Error", "Failed to share entry");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Write about today's one positive or negative moment
          </Text>
        </View>

        {/* Type Selection */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "positive" && styles.typeButtonActive,
              type === "positive" && styles.typeButtonPositive,
            ]}
            onPress={() => setType("positive")}
          >
            <MaterialCommunityIcons
              name="emoticon-happy"
              size={32}
              color={type === "positive" ? "#10b981" : "#6b7280"}
            />
            <Text
              style={[
                styles.typeButtonText,
                type === "positive" && styles.typeButtonTextActive,
              ]}
            >
              Positive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "negative" && styles.typeButtonActive,
              type === "negative" && styles.typeButtonNegative,
            ]}
            onPress={() => setType("negative")}
          >
            <MaterialCommunityIcons
              name="emoticon-sad"
              size={32}
              color={type === "negative" ? "#ef4444" : "#6b7280"}
            />
            <Text
              style={[
                styles.typeButtonText,
                type === "negative" && styles.typeButtonTextActive,
              ]}
            >
              Negative
            </Text>
          </TouchableOpacity>
        </View>

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write about your moment here..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={8}
            value={entry}
            onChangeText={setEntry}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
          >
            <MaterialCommunityIcons
              name="content-save"
              size={20}
              color="#fff"
            />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color="#8E48BB"
            />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Entries */}
        {savedEntries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={styles.entriesTitle}>Previous Entries</Text>
            {savedEntries
              .slice()
              .reverse()
              .slice(0, 10)
              .map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.entryCard,
                    item.type === "positive"
                      ? styles.entryCardPositive
                      : styles.entryCardNegative,
                  ]}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {formatDate(item.date)}
                    </Text>
                    <View
                      style={[
                        styles.entryTypeBadge,
                        item.type === "positive"
                          ? styles.entryTypeBadgePositive
                          : styles.entryTypeBadgeNegative,
                      ]}
                    >
                      <Text style={styles.entryTypeText}>
                        {item.type === "positive"
                          ? "😊 Positive"
                          : "😔 Negative"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.entryText}>{item.text}</Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
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
  header: {
    backgroundColor: "#8E48BB",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: '500',
    lineHeight: 24,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingHorizontal: 20,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 22,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonActive: {
    borderWidth: 3,
  },
  typeButtonPositive: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  typeButtonNegative: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  typeButtonEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  typeButtonTextActive: {
    color: "#1f2937",
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 180,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    fontWeight: "500",
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#8E48BB",
  },
  shareButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#8E48BB",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  shareButtonText: {
    color: "#8E48BB",
    fontSize: 16,
    fontWeight: "700",
  },
  entriesSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 18,
  },
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
  },
  entryCardPositive: {
    borderLeftColor: "#10b981",
  },
  entryCardNegative: {
    borderLeftColor: "#ef4444",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  entryTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  entryTypeBadgePositive: {
    backgroundColor: "#ecfdf5",
  },
  entryTypeBadgeNegative: {
    backgroundColor: "#fef2f2",
  },
  entryTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  entryText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "500",
  },
});
