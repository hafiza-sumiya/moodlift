import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../utils/storage";
import { getDateKey, calculateStreak, getColorForMood } from "../utils/helpers";
import api from "../utils/api";

const { width } = Dimensions.get("window");

// New mood tracking screen with 4 steps:
const MOOD_SLIDER = [
  { emoji: "😄", label: "Happy", value: "happy", color: "#fde68a" },
  { emoji: "😊", label: "Good", value: "good", color: "#bbf7d0" },
  { emoji: "😐", label: "Okay", value: "neutral", color: "#e5e7eb" },
  { emoji: "😔", label: "Sad", value: "sad", color: "#bfdbfe" },
  { emoji: "😡", label: "Angry", value: "angry", color: "#fecaca" },
];

const MOOD_COLORS = [
  { name: "green", label: "Calm", emoji: "😌" },
  { name: "yellow", label: "Hopeful", emoji: "😊" },
  { name: "blue", label: "Tired", emoji: "😴" },
  { name: "orange", label: "Motivated", emoji: "🔥" },
  { name: "red", label: "Stressed", emoji: "😰" },
  { name: "purple", label: "Confused", emoji: "😕" },
];

const INITIAL_FEELINGS = [
  {
    id: 1,
    text: "I feel energetic",
    value: "energetic",
    color: "#f97316",
    gradient: ["#f97316", "#fb923c"],
  },
  {
    id: 2,
    text: "I feel distracted",
    value: "distracted",
    color: "#a855f7",
    gradient: ["#a855f7", "#c084fc"],
  },
  {
    id: 3,
    text: "I feel tired",
    value: "tired",
    color: "#3b82f6",
    gradient: ["#3b82f6", "#60a5fa"],
  },
  {
    id: 4,
    text: "I feel anxious",
    value: "anxious",
    color: "#ef4444",
    gradient: ["#ef4444", "#f87171"],
  },
  {
    id: 5,
    text: "I feel calm",
    value: "calm",
    color: "#10b981",
    gradient: ["#10b981", "#34d399"],
  },
  {
    id: 6,
    text: "I feel motivated",
    value: "motivated",
    color: "#f59e0b",
    gradient: ["#f59e0b", "#fbbf24"],
  },
];

const EMOJI_OPTIONS = [
  { emoji: "😄", label: "Happy", value: "happy" },
  { emoji: "😊", label: "Positive", value: "positive" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Stressed", value: "stressed" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "🤔", label: "Confused", value: "confused" },
  { emoji: "🔥", label: "Energetic", value: "energetic" },
];

const GROUNDING_STEPS = [
  { number: 5, sense: "things you can see", timer: 30 },
  { number: 4, sense: "things you can touch", timer: 25 },
  { number: 3, sense: "things you can hear", timer: 20 },
  { number: 2, sense: "things you can smell", timer: 15 },
  { number: 1, sense: "thing you can taste", timer: 10 },
];

export default function MoodTrackingScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [tapCount, setTapCount] = useState(0);
  const [tapStart, setTapStart] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [groundingStep, setGroundingStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [groundingResponses, setGroundingResponses] = useState({});

  // Timer effect with decreasing times
  React.useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // Auto-advance to next step when timer expires
            handleNextGroundingStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer, groundingStep]);

  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
    setTimeout(() => setStep(2), 500);
  };

  const handleTap = () => {
    if (!tapStart) {
      setTapStart(Date.now());
    }

    setTapCount((prev) => {
      const newCount = prev + 1;

      if (newCount === 10) {
        const time = Date.now() - tapStart;

        if (time < 2000) {
          setSelectedEmoji({ value: "energetic", emoji: "🔥" });
        } else {
          setSelectedEmoji({ value: "tired", emoji: "😴" });
        }

        setTimeout(() => setStep(3), 300);
      }

      return newCount;
    });
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    setTimeout(() => setStep(3), 500);
  };

  const startGroundingExercise = () => {
    setGroundingStep(1);
    const firstTimer = GROUNDING_STEPS[0].timer;
    setTimer(firstTimer);
    setTimerActive(true);
    setGroundingResponses({});
  };

  const handleNextGroundingStep = () => {
    if (groundingStep < 5) {
      const nextStep = groundingStep + 1;
      setGroundingStep(nextStep);
      const nextTimer = GROUNDING_STEPS[nextStep - 1].timer;
      setTimer(nextTimer);
      setTimerActive(true);
    } else {
      handleGroundingComplete();
    }
  };

  const handleGroundingComplete = () => {
    setTimerActive(false);
    setGroundingStep(6); // Completed
    setTimeout(() => setStep(4), 1000);
  };

  const updateGroundingResponse = (stepNumber, text) => {
    setGroundingResponses((prev) => ({
      ...prev,
      [stepNumber]: text,
    }));
  };

  const handleColorSelect = async (color) => {
    setSelectedColor(color);

    const moodEntry = {
      date: getDateKey(),
      feeling: selectedFeeling?.value,
      emoji: selectedEmoji?.value,
      color: color.name,
      timestamp: new Date().toISOString(),
      groundingExercise: groundingResponses, // Store grounding responses
    };

    try {
      await api.request("/moods", {
        method: "POST",
        body: JSON.stringify(moodEntry),
      });
    } catch (e) {
      console.log("Backend failed, saving local");
      await storage.saveMoodData(moodEntry);
    }
    await calculateStreak(storage);

    // Show appropriate message based on color
    if (color.name === "red") {
      Alert.alert("Take a Moment", "Take 3 deep breaths. You've got this. 💪", [
        {
          text: "Do Breathing Exercise",
          onPress: () => {
            navigation.goBack();
            setTimeout(() => navigation.navigate("BreathingExercise"), 300);
          },
        },
        { text: "OK", style: "default" },
      ]);
    } else if (color.name === "green" || color.name === "yellow") {
      Alert.alert(
        "Great Day!",
        "Spend 5 minutes reading something positive. 📚",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } else {
      Alert.alert("Mood Saved!", "Your mood has been recorded.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const renderStep1 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>How do you feel today?</Text>

        <View style={styles.sliderContainer}>
          {MOOD_SLIDER.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.moodItem,
                selectedFeeling?.value === item.value && {
                  backgroundColor: item.color,
                  transform: [{ scale: 1.1 }],
                },
              ]}
              onPress={() => {
                setSelectedFeeling(item);
                setTimeout(() => setStep((prev) => prev + 1), 300);
              }}
            >
              <Text style={styles.moodEmoji}>{item.emoji}</Text>
              <Text style={styles.moodLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tap 10 times fast!</Text>

      <TouchableOpacity style={styles.tapBox} onPress={handleTap}>
        <Text style={[styles.tapText, { fontSize: 30 }]}>{tapCount}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => {
    if (groundingStep === 0) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Take a moment 🧘</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep(4)}
          >
            <Text style={styles.primaryButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={startGroundingExercise}
          >
            <Text style={styles.secondaryButtonText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (groundingStep > GROUNDING_STEPS.length) return null;

    const current = GROUNDING_STEPS[groundingStep - 1];
    if (!current) return null;

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.timerText}>{timer}s</Text>

        <Text style={styles.stepTitle}>
          {current.number} {current.sense}
        </Text>

        <TextInput
          style={styles.groundingTextArea}
          placeholder="Write here..."
          value={groundingResponses[groundingStep] || ""}
          onChangeText={(t) => updateGroundingResponse(groundingStep, t)}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNextGroundingStep}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>You're feeling</Text>

      <Text style={styles.finalEmoji}>{selectedEmoji?.emoji || "😊"}</Text>

      <Text style={styles.finalText}>{selectedFeeling?.label || "Good"}</Text>

      <View style={styles.colorRow}>
        {MOOD_COLORS.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[
              styles.colorDot,
              { backgroundColor: getColorForMood(color.name) },
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => handleColorSelect(selectedColor)}
      >
        <Text style={styles.primaryButtonText}>Save Mood</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
        />
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tapBox: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#8E48BB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  tapText: {
    color: "#fff",
    fontWeight: "bold",
  },

  sliderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 40,
  },

  moodItem: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },

  moodEmoji: {
    fontSize: 32,
  },

  moodLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 30,
  },

  emojiCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  primaryButton: {
    backgroundColor: "#8E48BB",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryButton: {
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#8E48BB",
  },

  finalEmoji: {
    fontSize: 80,
    marginVertical: 20,
  },

  finalText: {
    fontSize: 24,
    fontWeight: "600",
  },

  colorRow: {
    flexDirection: "row",
    marginTop: 30,
  },

  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },

  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8E48BB",
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },

  emojiLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  emojiLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  groundingIntroText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },

  timerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#8E48BB",
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8E48BB",
  },
  groundingQuestion: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  groundingInstruction: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  groundingTextArea: {
    width: "100%",
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  groundingComplete: {
    alignItems: "center",
  },
});
