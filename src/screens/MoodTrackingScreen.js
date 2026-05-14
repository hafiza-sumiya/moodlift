import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { getDateKey, calculateStreak, getColorForMood } from "../utils/helpers";
import api from "../utils/api";
import { COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT, MOOD } from "../styles/theme";
import {
  FadeSlideIn,
  ScaleIn,
  BreathingCircle,
  CalmButton,
  MoodProgressBar,
  MoodOptionChip,
  NextStepBanner,
} from "../components/EmotionalComponents";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Data ─────────────────────────────────────────────────────────────────────
const MOOD_SLIDER = [
  { emoji: "😄", label: "Happy",   value: "happy",   color: "#fde68a" },
  { emoji: "😊", label: "Good",    value: "good",    color: "#bbf7d0" },
  { emoji: "😐", label: "Okay",    value: "neutral", color: "#e5e7eb" },
  { emoji: "😔", label: "Sad",     value: "sad",     color: "#bfdbfe" },
  { emoji: "😡", label: "Angry",   value: "angry",   color: "#fecaca" },
];

const MOOD_COLORS = [
  { name: "green",  label: "Calm",      emoji: "😌" },
  { name: "yellow", label: "Hopeful",   emoji: "😊" },
  { name: "blue",   label: "Tired",     emoji: "😴" },
  { name: "orange", label: "Motivated", emoji: "🔥" },
  { name: "red",    label: "Stressed",  emoji: "😰" },
  { name: "purple", label: "Confused",  emoji: "😕" },
];

const GROUNDING_STEPS = [
  { number: 5, sense: "things you can see",   timer: 30 },
  { number: 4, sense: "things you can touch", timer: 25 },
  { number: 3, sense: "things you can hear",  timer: 20 },
  { number: 2, sense: "things you can smell", timer: 15 },
  { number: 1, sense: "thing you can taste",  timer: 10 },
];

const TOTAL_STEPS = 4;

// ─── Animated Step Wrapper ────────────────────────────────────────────────────
function StepView({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(ty,      { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY: ty }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Step 1 — Feeling Selector ────────────────────────────────────────────────
function Step1({ onSelect, selected }) {
  return (
    <StepView>
      <Text style={s.stepLabel}>Step 1 of 4</Text>
      <Text style={s.stepTitle}>How do you feel right now?</Text>
      <Text style={s.stepSub}>Be honest — all feelings are valid here.</Text>
      <View style={s.moodRow}>
        {MOOD_SLIDER.map((item) => {
          const isSelected = selected?.value === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                s.moodCard,
                isSelected && { backgroundColor: item.color, borderColor: item.color, transform: [{ scale: 1.08 }] },
              ]}
              onPress={() => onSelect(item)}
              activeOpacity={0.8}
            >
              <Text style={s.moodEmoji}>{item.emoji}</Text>
              <Text style={[s.moodLabel, isSelected && { fontWeight: WEIGHT.bold }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </StepView>
  );
}

// ─── Step 2 — Tap Speed Test ──────────────────────────────────────────────────
function Step2({ tapCount, onTap }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handleTap = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 6 }),
    ]).start();
    onTap();
  };
  const pct = Math.min(100, (tapCount / 10) * 100);
  return (
    <StepView>
      <Text style={s.stepLabel}>Step 2 of 4</Text>
      <Text style={s.stepTitle}>Tap 10 times fast!</Text>
      <Text style={s.stepSub}>This helps us sense your energy level right now.</Text>
      <View style={s.tapArea}>
        <BreathingCircle size={160} color={COLORS.primary}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity onPress={handleTap} activeOpacity={0.85} style={s.tapBtn}>
              <Text style={s.tapCount}>{tapCount}</Text>
              <Text style={s.tapHint}>/ 10</Text>
            </TouchableOpacity>
          </Animated.View>
        </BreathingCircle>
      </View>
      <View style={s.tapProgress}>
        <View style={[s.tapProgressFill, { width: `${pct}%` }]} />
      </View>
    </StepView>
  );
}

// ─── Step 3 — Grounding Exercise ──────────────────────────────────────────────
function Step3({ groundingStep, timer, groundingResponses, onStart, onNext, onUpdate, onSkip }) {
  if (groundingStep === 0) {
    return (
      <StepView>
        <Text style={s.stepLabel}>Step 3 of 4</Text>
        <Text style={s.stepTitle}>Grounding exercise</Text>
        <Text style={s.stepSub}>
          A quick 5-sense exercise to bring you back to the present moment.
        </Text>
        <View style={s.groundIntroCard}>
          {GROUNDING_STEPS.map((gs) => (
            <View key={gs.number} style={s.groundIntroRow}>
              <View style={s.groundIntroNum}>
                <Text style={s.groundIntroNumText}>{gs.number}</Text>
              </View>
              <Text style={s.groundIntroSense}>{gs.sense}</Text>
            </View>
          ))}
        </View>
        <CalmButton label="Start Grounding" onPress={onStart} icon="meditation" style={{ marginTop: SPACING.xl }} />
        <TouchableOpacity onPress={onSkip} style={s.skipBtn}>
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </StepView>
    );
  }

  if (groundingStep > GROUNDING_STEPS.length) return null;

  const current = GROUNDING_STEPS[groundingStep - 1];
  if (!current) return null;

  const timerPct = (timer / current.timer) * 100;
  const timerColor = timer <= 5 ? COLORS.danger : timer <= 10 ? COLORS.warning : COLORS.success;

  return (
    <StepView>
      <Text style={s.stepLabel}>Grounding · {groundingStep} of 5</Text>
      <View style={s.timerRow}>
        <View style={[s.timerCircle, { borderColor: timerColor }]}>
          <Text style={[s.timerText, { color: timerColor }]}>{timer}</Text>
          <Text style={s.timerSec}>sec</Text>
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.xl }}>
          <Text style={s.groundNum}>{current.number}</Text>
          <Text style={s.groundSense}>{current.sense}</Text>
        </View>
      </View>
      <View style={s.timerBar}>
        <View style={[s.timerBarFill, { width: `${timerPct}%`, backgroundColor: timerColor }]} />
      </View>
      <TextInput
        style={s.groundInput}
        placeholder="Write what you notice here…"
        placeholderTextColor={COLORS.textMuted}
        value={groundingResponses[groundingStep] || ""}
        onChangeText={(t) => onUpdate(groundingStep, t)}
        multiline
        textAlignVertical="top"
      />
      <CalmButton label={groundingStep < 5 ? "Next →" : "Finish"} onPress={onNext} style={{ marginTop: SPACING.md }} />
    </StepView>
  );
}

// ─── Step 4 — Color + Save ────────────────────────────────────────────────────
function Step4({ selectedFeeling, selectedEmoji, selectedColor, onColorPick, onSave, saving }) {
  return (
    <StepView>
      <Text style={s.stepLabel}>Step 4 of 4</Text>
      <Text style={s.stepTitle}>How would you colour this feeling?</Text>
      <Text style={s.stepSub}>Pick the shade that resonates most right now.</Text>

      <View style={s.colorSummary}>
        <Text style={s.colorSummaryEmoji}>{selectedEmoji?.emoji || "😊"}</Text>
        <Text style={s.colorSummaryLabel}>{selectedFeeling?.label || "Good"}</Text>
      </View>

      <View style={s.colorGrid}>
        {MOOD_COLORS.map((mc) => {
          const moodInfo = MOOD[mc.name];
          const isSelected = selectedColor?.name === mc.name;
          return (
            <TouchableOpacity
              key={mc.name}
              style={[
                s.colorCard,
                { backgroundColor: moodInfo?.light || "#f3f4f6" },
                isSelected && { borderWidth: 2.5, borderColor: moodInfo?.color || COLORS.primary },
              ]}
              onPress={() => onColorPick(mc)}
              activeOpacity={0.8}
            >
              <Text style={s.colorEmoji}>{mc.emoji}</Text>
              <Text style={[s.colorName, { color: moodInfo?.color || COLORS.textSecondary }]}>
                {mc.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CalmButton
        label={saving ? "Saving…" : "Save Mood ✓"}
        onPress={onSave}
        style={{ marginTop: SPACING.xl }}
      />
    </StepView>
  );
}

// ─── Post-Save Screen ─────────────────────────────────────────────────────────
function PostSaveScreen({ selectedColor, selectedFeeling, onReflect, onDone }) {
  const moodInfo = selectedColor ? MOOD[selectedColor.name] : null;
  return (
    <ScaleIn>
      <View style={s.postSave}>
        <View style={[s.postSaveCircle, { backgroundColor: moodInfo?.light || COLORS.primarySoft }]}>
          <Text style={s.postSaveEmoji}>{moodInfo?.emoji || "😊"}</Text>
        </View>
        <Text style={s.postSaveTitle}>Mood saved 🌿</Text>
        <Text style={s.postSaveSub}>
          You felt {moodInfo?.label?.toLowerCase() || "it"} — that took courage to acknowledge.
        </Text>

        <View style={s.postSaveActions}>
          <TouchableOpacity style={s.reflectCard} onPress={onReflect} activeOpacity={0.85}>
            <MaterialCommunityIcons name="thought-bubble-outline" size={24} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.reflectTitle}>Understand this feeling better</Text>
              <Text style={s.reflectSub}>6 quick emotional questions · ~2 min</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.doneBtn} onPress={onDone}>
            <Text style={s.doneBtnText}>Done for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScaleIn>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MoodTrackingScreen() {
  const navigation = useNavigation();

  // ── Core state (unchanged logic from original)
  const [step, setStep]                           = useState(1);
  const [tapCount, setTapCount]                   = useState(0);
  const [tapStart, setTapStart]                   = useState(null);
  const [selectedFeeling, setSelectedFeeling]     = useState(null);
  const [selectedEmoji, setSelectedEmoji]         = useState(null);
  const [groundingStep, setGroundingStep]         = useState(0);
  const [timer, setTimer]                         = useState(30);
  const [timerActive, setTimerActive]             = useState(false);
  const [selectedColor, setSelectedColor]         = useState(null);
  const [groundingResponses, setGroundingResponses] = useState({});
  const [saving, setSaving]                       = useState(false);
  const [saved, setSaved]                         = useState(false); // post-save screen

  // ── Timer effect (unchanged)
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleNextGroundingStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive, timer, groundingStep]);

  // ── Handlers (unchanged logic, enhanced feedback)
  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
    setTimeout(() => setStep(2), 320);
  };

  const handleTap = () => {
    if (!tapStart) setTapStart(Date.now());
    setTapCount((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        const time = Date.now() - (tapStart || Date.now());
        setSelectedEmoji(time < 2000
          ? { value: "energetic", emoji: "🔥" }
          : { value: "tired",     emoji: "😴" }
        );
        setTimeout(() => setStep(3), 400);
      }
      return next;
    });
  };

  const startGroundingExercise = () => {
    setGroundingStep(1);
    setTimer(GROUNDING_STEPS[0].timer);
    setTimerActive(true);
    setGroundingResponses({});
  };

  const handleNextGroundingStep = () => {
    setGroundingStep((prev) => {
      const next = prev + 1;
      if (next <= GROUNDING_STEPS.length) {
        setTimer(GROUNDING_STEPS[next - 1].timer);
        setTimerActive(true);
      } else {
        setTimerActive(false);
        setTimeout(() => setStep(4), 800);
      }
      return next;
    });
  };

  const updateGroundingResponse = (stepNum, text) => {
    setGroundingResponses((prev) => ({ ...prev, [stepNum]: text }));
  };

  const handleColorSelect = (color) => setSelectedColor(color);

  const handleSave = async () => {
    if (!selectedColor) {
      Alert.alert("Pick a colour", "Please choose a colour that represents your mood.");
      return;
    }
    setSaving(true);
    const moodEntry = {
      date:              getDateKey(),
      feeling:           selectedFeeling?.value,
      emoji:             selectedEmoji?.value,
      color:             selectedColor.name,
      timestamp:         new Date().toISOString(),
      groundingExercise: groundingResponses,
    };

    // ✅ Always save locally first — guaranteed regardless of network/auth
    await storage.saveMoodData(moodEntry);

    // 🔄 Best-effort backend sync — silently ignored if it fails
    try {
      await api.request("/moods", { method: "POST", body: JSON.stringify(moodEntry) });
    } catch {
      // Backend unavailable or unauthenticated — local data is already safe
    }

    await calculateStreak(storage);
    setSaving(false);
    setSaved(true);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        {!saved && (
          <View style={s.progressWrap}>
            <MoodProgressBar step={step} total={TOTAL_STEPS} />
            <Text style={s.progressLabel}>Step {step} of {TOTAL_STEPS}</Text>
          </View>
        )}

        {/* Steps */}
        {!saved && step === 1 && (
          <Step1 selected={selectedFeeling} onSelect={handleFeelingSelect} />
        )}
        {!saved && step === 2 && (
          <Step2 tapCount={tapCount} onTap={handleTap} />
        )}
        {!saved && step === 3 && (
          <Step3
            groundingStep={groundingStep}
            timer={timer}
            groundingResponses={groundingResponses}
            onStart={startGroundingExercise}
            onNext={handleNextGroundingStep}
            onUpdate={updateGroundingResponse}
            onSkip={() => setStep(4)}
          />
        )}
        {!saved && step === 4 && (
          <Step4
            selectedFeeling={selectedFeeling}
            selectedEmoji={selectedEmoji}
            selectedColor={selectedColor}
            onColorPick={handleColorSelect}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {/* Post-Save */}
        {saved && (
          <PostSaveScreen
            selectedColor={selectedColor}
            selectedFeeling={selectedFeeling}
            onReflect={() =>
              navigation.navigate("DeepReflection", {
                mood: { feeling: selectedFeeling, color: selectedColor, emoji: selectedEmoji },
              })
            }
            onDone={() => {
              if (selectedColor?.name === "red") {
                Alert.alert("Take a Moment", "Try a 2-min breathing exercise. 💜", [
                  { text: "Breathe", onPress: () => { navigation.goBack(); setTimeout(() => navigation.navigate("BreathingExercise"), 200); } },
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              } else {
                navigation.goBack();
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  scroll: { flex: 1 },
  content: {
    padding: SPACING.xl,
    paddingBottom: 60,
    flexGrow: 1,
  },
  progressWrap: {
    marginBottom: SPACING.xxl,
  },
  progressLabel: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    textAlign: "right",
    marginTop: SPACING.xs,
    fontWeight: WEIGHT.medium,
  },
  stepLabel: {
    fontSize: FONT.xs,
    color: COLORS.primary,
    fontWeight: WEIGHT.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  stepTitle: {
    fontSize: FONT.xxl,
    fontWeight: WEIGHT.extrabold,
    color: COLORS.textPrimary,
    lineHeight: 34,
    marginBottom: SPACING.sm,
  },
  stepSub: {
    fontSize: FONT.base,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  // Step 1 — Moods
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  moodCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  moodEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  moodLabel: { fontSize: FONT.xs, color: COLORS.textSecondary, fontWeight: WEIGHT.medium },

  // Step 2 — Tap
  tapArea: { alignItems: "center", marginVertical: SPACING.xxl },
  tapBtn:  { alignItems: "center" },
  tapCount: { fontSize: 48, fontWeight: WEIGHT.extrabold, color: COLORS.primary },
  tapHint:  { fontSize: FONT.sm, color: COLORS.primaryLight, fontWeight: WEIGHT.medium },
  tapProgress: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    overflow: "hidden",
    marginTop: SPACING.md,
  },
  tapProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  // Step 3 — Grounding
  groundIntroCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.card,
    marginTop: SPACING.md,
  },
  groundIntroRow:     { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  groundIntroNum:     { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryMuted, justifyContent: "center", alignItems: "center" },
  groundIntroNumText: { fontSize: FONT.base, fontWeight: WEIGHT.extrabold, color: COLORS.primary },
  groundIntroSense:   { fontSize: FONT.base, color: COLORS.textSecondary, fontWeight: WEIGHT.medium },
  skipBtn:  { alignItems: "center", marginTop: SPACING.lg, padding: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontWeight: WEIGHT.medium, fontSize: FONT.sm },
  timerRow:    { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  timerCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#fff", ...SHADOWS.sm,
  },
  timerText: { fontSize: 26, fontWeight: WEIGHT.extrabold },
  timerSec:  { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: WEIGHT.medium },
  groundNum: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: COLORS.primary },
  groundSense: { fontSize: FONT.base, color: COLORS.textSecondary, fontWeight: WEIGHT.medium, marginTop: 2 },
  timerBar:    { height: 5, backgroundColor: COLORS.divider, borderRadius: RADIUS.full, overflow: "hidden", marginBottom: SPACING.lg },
  timerBarFill: { height: "100%", borderRadius: RADIUS.full },
  groundInput: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT.base,
    color: COLORS.textPrimary,
    minHeight: 110,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    textAlignVertical: "top",
    ...SHADOWS.sm,
  },

  // Step 4 — Color
  colorSummary:      { alignItems: "center", marginBottom: SPACING.xl },
  colorSummaryEmoji: { fontSize: 64, marginBottom: SPACING.sm },
  colorSummaryLabel: { fontSize: FONT.xl, fontWeight: WEIGHT.bold, color: COLORS.textPrimary },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    justifyContent: "center",
  },
  colorCard: {
    width: (SCREEN_W - SPACING.xl * 2 - SPACING.md * 2) / 3,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    ...SHADOWS.sm,
  },
  colorEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  colorName:  { fontSize: FONT.xs, fontWeight: WEIGHT.bold },

  // Post-save
  postSave: { alignItems: "center", paddingVertical: SPACING.xxxl },
  postSaveCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.xl,
  },
  postSaveEmoji:  { fontSize: 60 },
  postSaveTitle:  { fontSize: FONT.xxl, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  postSaveSub:    { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center", lineHeight: 24, marginBottom: SPACING.xxl, paddingHorizontal: SPACING.md },
  postSaveActions: { width: "100%", gap: SPACING.md },
  reflectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.sm,
  },
  reflectTitle: { fontSize: FONT.base, fontWeight: WEIGHT.bold, color: COLORS.textPrimary, marginBottom: 2 },
  reflectSub:   { fontSize: FONT.xs,   color: COLORS.textMuted,    fontWeight: WEIGHT.medium },
  doneBtn:  { alignItems: "center", padding: SPACING.md },
  doneBtnText: { color: COLORS.textMuted, fontWeight: WEIGHT.medium, fontSize: FONT.base },
});

// Legacy exports for backwards compat (not needed but safe)
const MOOD_COLORS_EXPORT = MOOD_COLORS;
