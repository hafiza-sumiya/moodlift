import { useState, useRef, useEffect } from "react";
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
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { getDateKey, calculateStreak } from "../utils/helpers";
import api from "../utils/api";
import { COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT, MOOD } from "../styles/theme";
import {
  ScaleIn,
  BreathingCircle,
  CalmButton,
  MoodProgressBar,
} from "../components/EmotionalComponents";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Data ─────────────────────────────────────────────────────────────────────
const MOOD_SLIDER = [
  { emoji: "😡", label: "Angry", value: "angry", color: "#fecaca" },
  { emoji: "😔", label: "Sad", value: "sad", color: "#bfdbfe" },
  { emoji: "😐", label: "Okay", value: "neutral", color: "#e5e7eb" },
  { emoji: "😊", label: "Good", value: "good", color: "#bbf7d0" },
  { emoji: "😄", label: "Awesome", value: "happy", color: "#fde68a" },
];

const MOOD_COLORS = [
  { name: "green", label: "Calm", emoji: "😌" },
  { name: "yellow", label: "Hopeful", emoji: "😊" },
  { name: "blue", label: "Tired", emoji: "😴" },
  { name: "orange", label: "Motivated", emoji: "🔥" },
  { name: "red", label: "Stressed", emoji: "😰" },
  { name: "purple", label: "Confused", emoji: "😕" },
];

const GROUNDING_STEPS = [
  { number: 5, sense: "things you can see", timer: 30 },
  { number: 4, sense: "things you can touch", timer: 25 },
  { number: 3, sense: "things you can hear", timer: 20 },
  { number: 2, sense: "things you can smell", timer: 15 },
  { number: 1, sense: "thing you can taste", timer: 10 },
];

const TOTAL_STEPS = 4;

// ─── Animated Step Wrapper ────────────────────────────────────────────────────
function StepView({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(ty, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY: ty }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Step 1 — Feeling Selector (NEW UI) ───────────────────────────────────────
const SLIDER_WIDTH = SCREEN_W - 80;
const STEP_WIDTH = SLIDER_WIDTH / 4;

function ArcSlider({ moodIndex, setMoodIndex }) {
  const pan = useRef(new Animated.Value(moodIndex * STEP_WIDTH)).current;
  const panValue = useRef(moodIndex * STEP_WIDTH);

  useEffect(() => {
    const listenerId = pan.addListener((state) => {
      panValue.current = state.value;
    });
    return () => pan.removeListener(listenerId);
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(panValue.current);
        pan.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        let newX = panValue.current;
        if (newX < 0) newX = 0;
        if (newX > SLIDER_WIDTH) newX = SLIDER_WIDTH;

        let closestIndex = Math.round(newX / STEP_WIDTH);
        setMoodIndex(closestIndex);

        Animated.spring(pan, {
          toValue: closestIndex * STEP_WIDTH,
          useNativeDriver: false,
          tension: 100,
          friction: 12
        }).start();
      },
    })
  ).current;

  const r = SLIDER_WIDTH;
  const h = SLIDER_WIDTH / 2;
  const k = r + 40;

  const inputRange = [0, STEP_WIDTH, 2 * STEP_WIDTH, 3 * STEP_WIDTH, 4 * STEP_WIDTH];
  const outputRange = inputRange.map(x => k - Math.sqrt(r * r - Math.pow(x - h, 2)) - 13);

  const translateY = pan.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp'
  });

  return (
    <View style={{ width: SLIDER_WIDTH, height: 100, alignSelf: 'center', marginTop: 20 }}>
      <View style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        <View style={{
          position: 'absolute',
          width: SLIDER_WIDTH * 2,
          height: SLIDER_WIDTH * 2,
          borderRadius: SLIDER_WIDTH,
          borderWidth: 4,
          borderColor: '#A8C3D8',
          top: 40,
          left: -SLIDER_WIDTH / 2,
        }} />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: 50,
          height: 26,
          borderRadius: 13,
          backgroundColor: '#222',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          position: 'absolute',
          transform: [
            { translateX: pan },
            { translateY }
          ],
          marginLeft: -25,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <View style={{ width: 2, height: 10, backgroundColor: 'white', borderRadius: 1 }} />
        <View style={{ width: 2, height: 10, backgroundColor: 'white', borderRadius: 1 }} />
        <View style={{ width: 2, height: 10, backgroundColor: 'white', borderRadius: 1 }} />
      </Animated.View>

      <View style={{ position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map(idx => (
          <View key={idx} style={{
            width: moodIndex === idx ? 16 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: moodIndex === idx ? '#222' : '#A8C3D8'
          }} />
        ))}
      </View>
    </View>
  );
}

function SimpleCloud({ style }) {
  return (
    <View style={[{ opacity: 0.9, position: 'absolute' }, style]}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 10 }} />
      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 30 }} />
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 70 }} />
      <View style={{ width: 100, height: 30, backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 15, borderRadius: 15 }} />
    </View>
  );
}

function Step1({ onNext }) {
  const [moodIndex, setMoodIndex] = useState(2);
  const currentMood = MOOD_SLIDER[moodIndex];
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: '#D2F4F8', width: SCREEN_W }}>
      <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60, paddingHorizontal: 24, height: 320 }}>
        <SimpleCloud style={{ top: 80, left: -20, transform: [{ scale: 0.7 }] }} />
        <SimpleCloud style={{ top: 150, right: -10, transform: [{ scale: 0.9 }] }} />
        <SimpleCloud style={{ top: 60, right: 40, transform: [{ scale: 0.5 }] }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
          </TouchableOpacity>
          <View style={{ backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: '#E4F087', fontWeight: 'bold' }}>Today</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color="#E4F087" />
          </View>
          <View style={{ width: 32 }} />
        </View>

        <Text style={{ fontSize: 36, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginTop: 40, lineHeight: 42, zIndex: 10 }}>
          How are you{"\n"}feeling
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{
          position: 'absolute',
          top: 0,
          width: SCREEN_W * 2,
          height: SCREEN_W * 2,
          borderRadius: SCREEN_W,
          backgroundColor: '#FFFFFF',
          alignSelf: 'center',
        }} />

        <View style={{ marginTop: -80, alignItems: 'center', zIndex: 10, width: 140, height: 140 }}>
          <Text style={{ fontSize: 110, textAlign: 'center' }}>{currentMood.emoji}</Text>
          <Text style={{ fontSize: 40, position: 'absolute', right: -10, bottom: 0, opacity: 0.9 }}>
            {currentMood.emoji}
          </Text>
        </View>

        <Text style={{ fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginTop: 10, marginBottom: 10, zIndex: 10 }}>
          {currentMood.label}
        </Text>

        <ArcSlider moodIndex={moodIndex} setMoodIndex={setMoodIndex} />

        <TouchableOpacity
          style={{
            backgroundColor: '#1A1A1A',
            width: SCREEN_W - 48,
            height: 60,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 'auto',
            marginBottom: 40,
            zIndex: 10,
          }}
          onPress={() => onNext(currentMood)}
        >
          <Text style={{ color: '#E4F087', fontSize: 18, fontWeight: 'bold' }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  useEffect(() => {
    if (groundingStep === 0 || groundingStep > GROUNDING_STEPS.length) return;
    const current = GROUNDING_STEPS[groundingStep - 1];
    const responses = groundingResponses[groundingStep] || [];
    const filledCount = responses.filter((t) => t && t.trim().length > 0).length;
    
    if (filledCount === current.number) {
      const timeout = setTimeout(() => {
        onNext();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [groundingResponses, groundingStep, onNext]);

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

  const responses = groundingResponses[groundingStep] || [];

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
      
      <View style={{ width: "100%", gap: SPACING.sm }}>
        {Array.from({ length: current.number }).map((_, idx) => (
          <TextInput
            key={idx}
            style={s.groundInput}
            placeholder={`Thing ${idx + 1} you notice...`}
            placeholderTextColor={COLORS.textMuted}
            value={responses[idx] || ""}
            onChangeText={(t) => {
              const newArr = [...responses];
              newArr[idx] = t;
              onUpdate(groundingStep, newArr);
            }}
          />
        ))}
      </View>
    </StepView>
  );
}

// ─── Step 4 — Detailed Mood Sliders (NEW UI) ────────────────────────────────────
const TRACK_WIDTH = SCREEN_W - 80;

function EmojiSlider({ label, emoji, value, onValueChange }) {
  const pan = useRef(new Animated.Value((value / 100) * TRACK_WIDTH)).current;
  const panValue = useRef((value / 100) * TRACK_WIDTH);

  useEffect(() => {
    const listenerId = pan.addListener((state) => {
      panValue.current = state.value;
    });
    return () => pan.removeListener(listenerId);
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(panValue.current);
        pan.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        let newX = panValue.current;
        if (newX < 0) newX = 0;
        if (newX > TRACK_WIDTH) newX = TRACK_WIDTH;
        
        const percentage = Math.round((newX / TRACK_WIDTH) * 100);
        onValueChange(percentage);
        
        Animated.spring(pan, {
          toValue: (percentage / 100) * TRACK_WIDTH,
          useNativeDriver: false,
          friction: 10,
          tension: 100
        }).start();
      }
    })
  ).current;

  return (
    <View style={{ marginBottom: 36, width: TRACK_WIDTH }}>
      {/* Label Pill */}
      <View style={{
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
        shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>{label}</Text>
      </View>
      
      {/* Track */}
      <View style={{
        width: TRACK_WIDTH,
        height: 8,
        backgroundColor: '#E6DDD4',
        borderRadius: 4,
        justifyContent: 'center'
      }}>
        {/* Thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: 'absolute',
            transform: [{ translateX: pan }],
            marginLeft: -20, // center the 40px thumb
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40,
            backgroundColor: '#fff',
            borderRadius: 20,
            shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4
          }}
        >
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

function Step4({ detailedEmotions, setDetailedEmotions, onSave, onSkip, saving }) {
  return (
    <StepView>
      <Text style={[s.stepTitle, { textAlign: 'center', marginBottom: 40, marginTop: 20 }]}>How do you feel today?</Text>
      
      <View style={{ alignItems: 'center' }}>
        {MOOD_COLORS.map(mc => (
          <EmojiSlider
            key={mc.name}
            label={mc.label}
            emoji={mc.emoji}
            value={detailedEmotions[mc.name] || 0}
            onValueChange={(val) => setDetailedEmotions(prev => ({ ...prev, [mc.name]: val }))}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={{
          backgroundColor: '#5C54D6',
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
          marginTop: 20,
        }}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          {saving ? "Saving..." : "Continue"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{
          backgroundColor: '#fff',
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
          marginTop: 12,
        }}
        onPress={onSkip}
      >
        <Text style={{ color: '#5C54D6', fontSize: 16, fontWeight: '600' }}>Skip</Text>
      </TouchableOpacity>
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

  const [step, setStep] = useState(1);
  const [tapCount, setTapCount] = useState(0);
  const [tapStart, setTapStart] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [groundingStep, setGroundingStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [groundingResponses, setGroundingResponses] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detailedEmotions, setDetailedEmotions] = useState({
    green: 50, yellow: 50, blue: 50, orange: 50, red: 50, purple: 50
  });

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

  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
    setStep(2);
  };

  const handleTap = () => {
    if (!tapStart) setTapStart(Date.now());
    setTapCount((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        const time = Date.now() - (tapStart || Date.now());
        setSelectedEmoji(time < 2000
          ? { value: "energetic", emoji: "🔥" }
          : { value: "tired", emoji: "😴" }
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

  const handleSave = async (isSkip = false) => {
    setSaving(true);

    // Calculate dominant color based on the highest slider value if not skipping
    let dominantColor = MOOD_COLORS[0];
    if (!isSkip) {
      let maxVal = -1;
      for (const mc of MOOD_COLORS) {
        if (detailedEmotions[mc.name] > maxVal) {
          maxVal = detailedEmotions[mc.name];
          dominantColor = mc;
        }
      }
    }
    
    // Set the dominant color so PostSaveScreen displays correctly
    setSelectedColor(dominantColor);

    let totalFilled = 0;
    const totalRequired = 15; // 5 + 4 + 3 + 2 + 1
    
    Object.values(groundingResponses).forEach((arr) => {
      if (Array.isArray(arr)) {
        totalFilled += arr.filter((t) => t && t.trim().length > 0).length;
      }
    });

    const stressScore = Math.round(((totalRequired - totalFilled) / totalRequired) * 100);

    const moodEntry = {
      date: getDateKey(),
      feeling: selectedFeeling?.value,
      emoji: selectedEmoji?.value,
      color: dominantColor.name,
      timestamp: new Date().toISOString(),
      detailedEmotions: isSkip ? null : detailedEmotions,
      groundingExercise: {
        responses: groundingResponses,
        completedBoxes: totalFilled,
        totalBoxes: totalRequired,
        stressScore: stressScore,
      },
    };

    await storage.saveMoodData(moodEntry);

    try {
      await api.request("/moods", { method: "POST", body: JSON.stringify(moodEntry) });
    } catch {
      // Ignore network errors
    }

    await calculateStreak(storage);
    setSaving(false);
    setSaved(true);
  };

  const isStep1 = step === 1 && !saved;

  return (
    <SafeAreaView style={[s.safe, isStep1 && { backgroundColor: "#FFFFFF" }]} edges={["bottom"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, isStep1 && { padding: 0, paddingBottom: 0, flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={!isStep1}
      >
        {!saved && !isStep1 && (
          <View style={s.progressWrap}>
            <MoodProgressBar step={step} total={TOTAL_STEPS} />
            <Text style={s.progressLabel}>Step {step} of {TOTAL_STEPS}</Text>
          </View>
        )}

        {!saved && step === 1 && (
          <Step1 onNext={handleFeelingSelect} />
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
            detailedEmotions={detailedEmotions}
            setDetailedEmotions={setDetailedEmotions}
            onSave={() => handleSave(false)}
            onSkip={() => handleSave(true)}
            saving={saving}
          />
        )}

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
    width: '100%',

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

  // Step 2 — Tap
  tapArea: { alignItems: "center", marginVertical: SPACING.xxl },
  tapBtn: { alignItems: "center" },
  tapCount: { fontSize: 48, fontWeight: WEIGHT.extrabold, color: COLORS.primary },
  tapHint: { fontSize: FONT.sm, color: COLORS.primaryLight, fontWeight: WEIGHT.medium },
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
  groundIntroRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  groundIntroNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryMuted, justifyContent: "center", alignItems: "center" },
  groundIntroNumText: { fontSize: FONT.base, fontWeight: WEIGHT.extrabold, color: COLORS.primary },
  groundIntroSense: { fontSize: FONT.base, color: COLORS.textSecondary, fontWeight: WEIGHT.medium },
  skipBtn: { alignItems: "center", marginTop: SPACING.lg, padding: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontWeight: WEIGHT.medium, fontSize: FONT.sm },
  timerRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  timerCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#fff", ...SHADOWS.sm,
  },
  timerText: { fontSize: 26, fontWeight: WEIGHT.extrabold },
  timerSec: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: WEIGHT.medium },
  groundNum: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: COLORS.primary },
  groundSense: { fontSize: FONT.base, color: COLORS.textSecondary, fontWeight: WEIGHT.medium, marginTop: 2 },
  timerBar: { height: 5, backgroundColor: COLORS.divider, borderRadius: RADIUS.full, overflow: "hidden", marginBottom: SPACING.lg },
  timerBarFill: { height: "100%", borderRadius: RADIUS.full },
  groundInput: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT.base,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },

  // Step 4 — Color
  colorSummary: { alignItems: "center", marginBottom: SPACING.xl },
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
  colorName: { fontSize: FONT.xs, fontWeight: WEIGHT.bold },

  // Post-save
  postSave: { alignItems: "center", paddingVertical: SPACING.xxxl },
  postSaveCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.xl,
  },
  postSaveEmoji: { fontSize: 60 },
  postSaveTitle: { fontSize: FONT.xxl, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  postSaveSub: { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center", lineHeight: 24, marginBottom: SPACING.xxl, paddingHorizontal: SPACING.md },
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
  reflectSub: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: WEIGHT.medium },
  doneBtn: { alignItems: "center", padding: SPACING.md },
  doneBtnText: { color: COLORS.textMuted, fontWeight: WEIGHT.medium, fontSize: FONT.base },
});

// Legacy exports for backwards compat (not needed but safe)
const MOOD_COLORS_EXPORT = MOOD_COLORS;
