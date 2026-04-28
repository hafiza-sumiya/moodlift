import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  TextInput,
  Dimensions,
  PanResponder,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../utils/storage";
import { getDateKey, calculateStreak, getColorForMood } from "../utils/helpers";

const { width } = Dimensions.get("window");

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
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [groundingStep, setGroundingStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [groundingResponses, setGroundingResponses] = useState({});
  const pan = useRef(new Animated.ValueXY()).current;

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        if (Math.abs(gestureState.dx) > 50) {
          if (gestureState.dx > 0) {
            // Swipe right - go to previous (decrease index)
            if (swipeIndex > 0) {
              const newIndex = swipeIndex - 1;
              setSwipeIndex(newIndex);
              // Animate card change
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 50,
                friction: 7,
              }).start();
            } else {
              // Bounce back if at start
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 50,
                friction: 7,
              }).start();
            }
          } else {
            // Swipe left - go to next (increase index)
            if (swipeIndex < INITIAL_FEELINGS.length - 1) {
              const newIndex = swipeIndex + 1;
              setSwipeIndex(newIndex);
              // Animate card change
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 50,
                friction: 7,
              }).start();
            } else {
              // Bounce back if at end
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 50,
                friction: 7,
              }).start();
            }
          }
        } else {
          // Small movement - snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    }),
  ).current;

  const handleSwipeRight = () => {
    // Right arrow = go to next card (increase index)
    if (swipeIndex < INITIAL_FEELINGS.length - 1) {
      const newIndex = swipeIndex + 1;
      setSwipeIndex(newIndex);
      // Reset pan position
      pan.setValue({ x: 0, y: 0 });
    }
  };

  const handleSwipeLeft = () => {
    // Left arrow = go to previous card (decrease index)
    if (swipeIndex > 0) {
      const newIndex = swipeIndex - 1;
      setSwipeIndex(newIndex);
      // Reset pan position
      pan.setValue({ x: 0, y: 0 });
    }
  };

  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
    setTimeout(() => setStep(2), 500);
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

    await storage.saveMoodData(moodEntry);
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
    const currentFeeling = INITIAL_FEELINGS[swipeIndex];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>How are you feeling?</Text>
        <Text style={styles.stepSubtitle}>Use buttons to browse</Text>

        <Animated.View
          style={[
            styles.swipeCard,
            {
              backgroundColor: currentFeeling?.color || "#8E48BB",
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.swipeCardContent}>
            <Text style={styles.swipeCardText}>{currentFeeling?.text}</Text>
            <View style={styles.cardIndicator}>
              <Text style={styles.cardIndicatorText}>
                {swipeIndex + 1} / {INITIAL_FEELINGS.length}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.swipeButtons}>
          <TouchableOpacity
            style={[
              styles.swipeButton,
              swipeIndex === 0 && styles.swipeButtonDisabled,
            ]}
            onPress={handleSwipeLeft}
            disabled={swipeIndex === 0}
          >
            <Text
              style={[
                styles.swipeButtonText,
                swipeIndex === 0 && styles.swipeButtonTextDisabled,
              ]}
            >
              ←
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeButton, styles.selectButton]}
            onPress={() => handleFeelingSelect(currentFeeling)}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.swipeButton,
              swipeIndex === INITIAL_FEELINGS.length - 1 &&
                styles.swipeButtonDisabled,
            ]}
            onPress={handleSwipeRight}
            disabled={swipeIndex === INITIAL_FEELINGS.length - 1}
          >
            <Text
              style={[
                styles.swipeButtonText,
                swipeIndex === INITIAL_FEELINGS.length - 1 &&
                  styles.swipeButtonTextDisabled,
              ]}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose an emoji</Text>
      <ScrollView
        vertical
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emojiScrollContainer}
      >
        {EMOJI_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.emojiOption,
              selectedEmoji?.value === option.value &&
                styles.emojiOptionSelected,
            ]}
            onPress={() => handleEmojiSelect(option)}
          >
            <Text style={styles.emojiLarge}>{option.emoji}</Text>
            <Text style={styles.emojiLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3 = () => {
    const currentStep =
      groundingStep > 0 && groundingStep <= 5
        ? GROUNDING_STEPS[groundingStep - 1]
        : null;

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Grounding Exercise</Text>
        <Text style={styles.stepSubtitle}>5-4-3-2-1 Technique</Text>

        {groundingStep === 0 && (
          <View style={styles.groundingIntro}>
            <Text style={styles.groundingIntroText}>
              This exercise helps you stay present and calm. We'll guide you
              through identifying:
            </Text>
            <View style={styles.groundingList}>
              {GROUNDING_STEPS.map((step) => (
                <View key={step.number} style={styles.groundingListItem}>
                  <Text style={styles.groundingListItemText}>
                    {step.number} {step.sense} ({step.timer}s)
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGroundingExercise}
            >
              <Text style={styles.startButtonText}>Start Exercise</Text>
            </TouchableOpacity>
          </View>
        )}

        {groundingStep > 0 && groundingStep <= 5 && currentStep && (
          <View style={styles.groundingActive}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{timer}s</Text>
            </View>
            <Text style={styles.groundingQuestion}>
              {currentStep.number} {currentStep.sense}
            </Text>
            <Text style={styles.groundingInstruction}>
              Write them down below...
            </Text>

            <TextInput
              style={styles.groundingTextArea}
              placeholder={`List ${currentStep.number} ${currentStep.sense}...`}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={groundingResponses[groundingStep] || ""}
              onChangeText={(text) =>
                updateGroundingResponse(groundingStep, text)
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.nextStepButton}
              onPress={handleNextGroundingStep}
            >
              <Text style={styles.nextStepButtonText}>
                {groundingStep < 5 ? "Next" : "Complete"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {groundingStep === 6 && (
          <View style={styles.groundingComplete}>
            <Text style={styles.completeEmoji}>✅</Text>
            <Text style={styles.completeText}>Exercise Complete!</Text>
            <Text style={styles.completeSubtext}>Moving to next step...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pick a color for today</Text>
      <View style={styles.colorGrid}>
        {MOOD_COLORS.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[
              styles.colorOption,
              { backgroundColor: getColorForMood(color.name) },
              selectedColor?.name === color.name && styles.colorOptionSelected,
            ]}
            onPress={() => handleColorSelect(color)}
          >
            <Text style={styles.colorEmoji}>{color.emoji}</Text>
            <Text style={styles.colorLabel}>{color.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  swipeCard: {
    width: "90%",
    height: 220,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
    alignSelf: "center",
  },
  swipeCardContent: {
    padding: 20,
    alignItems: "center",
  },
  swipeCardText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardIndicator: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
  },
  cardIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  swipeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    alignItems: "center",
  },
  swipeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  swipeButtonDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.5,
  },
  selectButton: {
    backgroundColor: "#8E48BB",
    width: 100,
  },
  swipeButtonText: {
    fontSize: 24,
    color: "#6b7280",
    fontWeight: "bold",
  },
  swipeButtonTextDisabled: {
    color: "#d1d5db",
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emojiScrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  emojiOption: {
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    width: "30%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiOptionSelected: {
    backgroundColor: "#eef2ff",
    borderWidth: 3,
    borderColor: "#8E48BB",
    transform: [{ scale: 1.1 }],
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
  groundingIntro: {
    width: "100%",
    alignItems: "center",
  },
  groundingIntroText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  groundingList: {
    width: "100%",
    marginBottom: 32,
  },
  groundingListItem: {
    marginBottom: 12,
    paddingLeft: 20,
  },
  groundingListItemText: {
    fontSize: 18,
    color: "#1f2937",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#8E48BB",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  groundingActive: {
    width: "100%",
    alignItems: "center",
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
  nextStepButton: {
    backgroundColor: "#8E48BB",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  nextStepButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  groundingComplete: {
    alignItems: "center",
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 8,
  },
  completeSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  colorOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: "#fff",
    transform: [{ scale: 1.1 }],
  },
  colorEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
