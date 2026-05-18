import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT, MOOD, POSITIVE_MOODS,
} from "../styles/theme";
import {
  FadeSlideIn, ScaleIn, MoodProgressBar, NextStepBanner,
} from "../components/EmotionalComponents";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Question Definitions ─────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "trigger",
    question: "What exactly triggered this feeling?",
    subtitle: "Try to pinpoint the source — even if it's unclear.",
    options: [
      { label: "Something someone said", emoji: "💬" },
      { label: "My own thoughts", emoji: "🧠" },
      { label: "Stress", emoji: "😤" },
      { label: "Overthinking", emoji: "🌀" },
      { label: "Tiredness", emoji: "😴" },
      { label: "Nothing specific", emoji: "🤷" },
      { label: "I don't know", emoji: "❓" },
    ],
  },
  {
    id: "severity",
    question: "Was the situation actually serious?",
    subtitle: "Be honest with yourself — no judgment here.",
    options: [
      { label: "Just overthinking", emoji: "🌀" },
      { label: "Somewhat", emoji: "🤔" },
      { label: "It was real stress", emoji: "⚡" },
      { label: "Very serious", emoji: "🔥" },
    ],
  },
  {
    id: "amplified",
    question: "Did something small affect you more than usual?",
    subtitle: "Sometimes we're more sensitive on certain days.",
    options: [
      { label: "Yes, definitely", emoji: "😟" },
      { label: "Maybe", emoji: "🤷" },
      { label: "No", emoji: "✅" },
    ],
  },
  {
    id: "need",
    question: "What did you need most in that moment?",
    subtitle: "Understanding your needs helps you meet them.",
    options: [
      { label: "Rest", emoji: "🛌" },
      { label: "Silence", emoji: "🤫" },
      { label: "Comfort", emoji: "🤗" },
      { label: "Motivation", emoji: "⚡" },
      { label: "Escape", emoji: "🚶" },
      { label: "Sleep", emoji: "💤" },
      { label: "Connection", emoji: "🫂" },
    ],
  },
  {
    id: "location",
    question: "Where did you feel this emotion?",
    subtitle: "Emotions often live in the body as much as the mind.",
    options: [
      { label: "Mind", emoji: "🧠" },
      { label: "Body", emoji: "🫀" },
      { label: "Both", emoji: "✨" },
      { label: "Everywhere", emoji: "🌊" },
    ],
  },
  {
    id: "behavior",
    question: "Did this feeling change your behavior?",
    subtitle: "Notice how emotions show up in your actions.",
    options: [
      { label: "Avoided people", emoji: "🚪" },
      { label: "Lost focus", emoji: "💭" },
      { label: "Became quiet", emoji: "🤐" },
      { label: "Became angry", emoji: "😡" },
      { label: "Overthought more", emoji: "🌀" },
      { label: "Emotionally drained", emoji: "🪫" },
      { label: "None of these", emoji: "✅" },
    ],
  },
];

const TOTAL_Q = QUESTIONS.length;

// ─── AI-style Emotional Summary Generator ────────────────────────────────────
function generateSummary(mood, answers) {
  const moodName = mood?.color?.label?.toLowerCase() || "overwhelmed";
  const moodColor = mood?.color?.name || "purple";
  const trigger = answers?.trigger || "";
  const severity = answers?.severity || "";
  const amplified = answers?.amplified || "";
  const need = answers?.need || "";
  const location = answers?.location || "";
  const behavior = answers?.behavior || "";

  const summaries = [];

  if (moodColor === "red" || moodColor === "purple") {
    if (trigger === "My own thoughts" || trigger === "Overthinking") {
      summaries.push(`You seem mentally exhausted more than truly ${moodName}. Your mind is working hard — maybe too hard right now.`);
    } else if (trigger === "Stress") {
      summaries.push(`What you're experiencing feels like genuine stress. Acknowledging it honestly is the first step to easing it.`);
    } else {
      summaries.push(`Feeling ${moodName} is real and valid. It doesn't need a clear cause to deserve your attention.`);
    }
  } else if (POSITIVE_MOODS.includes(moodColor)) {
    summaries.push(`You're in a relatively positive space today. That's worth noticing and protecting.`);
  } else {
    summaries.push(`Your emotional state feels mixed right now — which is actually very human and normal.`);
  }

  if (amplified === "Yes, definitely") {
    summaries.push(`It sounds like you're more sensitive than usual today. That often means your emotional reserves are lower — rest matters more than you think.`);
  }

  if (behavior === "Avoided people" || behavior === "Became quiet") {
    summaries.push(`Withdrawing can feel protective, but sometimes connection — even brief — can ease the heaviness more than isolation.`);
  } else if (behavior === "Overthought more" || behavior === "Lost focus") {
    summaries.push(`Your mind tends to spiral when under pressure. A short breathing or grounding exercise can act like a reset button.`);
  } else if (behavior === "Emotionally drained") {
    summaries.push(`Emotional drain often signals that you've been carrying more than you realize. Gentle rest — not productivity — is what heals this.`);
  }

  if (need === "Rest" || need === "Sleep") {
    summaries.push(`Your body and mind are both asking for recovery time. Even 20 minutes of real rest can shift your emotional state meaningfully.`);
  } else if (need === "Connection") {
    summaries.push(`You need to feel seen right now. Even reaching out with a small message to someone you trust can help more than staying in your head.`);
  } else if (need === "Comfort") {
    summaries.push(`You're craving safety right now — and that's completely okay. Self-compassion is not weakness; it's recovery.`);
  }

  if (location === "Body" || location === "Both" || location === "Everywhere") {
    summaries.push(`You're feeling this in your body, not just your mind. Physical movement — even a slow walk — can help your nervous system release stored tension.`);
  }

  return summaries.slice(0, 3);
}

// ─── Option Pill ─────────────────────────────────────────────────────────────
function OptionPill({ label, emoji, selected, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: "100%", marginBottom: 12 }}>
      <TouchableOpacity
        style={[
          pillStyles.container,
          selected && pillStyles.selectedContainer
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[pillStyles.leftCircle, selected && pillStyles.selectedLeftCircle]}>
          {emoji && <Text style={pillStyles.emoji}>{emoji}</Text>}
        </View>
        <Text style={[pillStyles.label, selected && pillStyles.selectedLabel]}>{label}</Text>
        <MaterialCommunityIcons
          name={selected ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={selected ? "#B8C5DD" : "#A0AAB8"}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4ECEC",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  selectedContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#B8C5DD",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  leftCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBE0E0",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLeftCircle: {
    backgroundColor: "#D9E2F2",
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: "#303A4B",
    fontWeight: "600",
  },
  selectedLabel: {
    color: "#202A3B",
  }
});

// ─── Question Area ────────────────────────────────────────────────────────────
function QuestionArea({ q, index, selected, onSelect, onNext }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    opacity.setValue(0);
    ty.setValue(28);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(ty, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }),
    ]).start();
  }, [index, opacity, ty]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: ty }], flex: 1 }}>
      <View style={styles.questionTextWrap}>
        <Text style={qStyles.counter}>{index + 1} of {TOTAL_Q}</Text>
        <Text style={qStyles.question}>{q.question}</Text>
        {q.subtitle && <Text style={qStyles.subtitle}>{q.subtitle}</Text>}
      </View>

      <View style={qStyles.optionsContainer}>
        {q.options.map((opt) => {
          const isSelected = selected === opt.label;
          return (
            <OptionPill
              key={opt.label}
              label={opt.label}
              emoji={opt.emoji}
              selected={isSelected}
              onPress={() => onSelect(opt.label)}
            />
          );
        })}

        {selected && (
          <FadeSlideIn delay={100}>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={onNext}
            >
              <Text style={styles.nextBtnText}>
                {index < TOTAL_Q - 1 ? "Confirm" : "See my emotional read"}
              </Text>
            </TouchableOpacity>
          </FadeSlideIn>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryView({ mood, answers, onContinue, navigation }) {
  const summaryLines = generateSummary(mood, answers);
  const moodInfo = mood?.color ? MOOD[mood.color.name] : null;

  return (
    <ScrollView contentContainerStyle={sumStyles.wrap} showsVerticalScrollIndicator={false}>
      <ScaleIn>
        <View style={sumStyles.topBadge}>
          <Text style={sumStyles.topEmoji}>{moodInfo?.emoji || "💜"}</Text>
        </View>
      </ScaleIn>
      <FadeSlideIn delay={200}>
        <Text style={sumStyles.title}>Your emotional read</Text>
        <Text style={sumStyles.disclaimer}>
          This is a gentle reflection — not a diagnosis. Just a mirror.
        </Text>
        {summaryLines.map((line, i) => (
          <View key={i} style={sumStyles.lineCard}>
            <MaterialCommunityIcons name="leaf" size={16} color={"#B8C5DD"} style={{ marginTop: 2 }} />
            <Text style={sumStyles.lineText}>{line}</Text>
          </View>
        ))}
        <Text style={sumStyles.reminder}>
          Remember: every emotion passes. You noticed, you reflected — that matters. 💙
        </Text>
      </FadeSlideIn>

      <FadeSlideIn delay={500}>
        <View style={sumStyles.nextSteps}>
          <Text style={sumStyles.nextTitle}>What to do next</Text>
          <NextStepBanner
            icon="notebook-outline"
            title="Write in your Journal"
            subtitle="Put this reflection into words"
            onPress={() => navigation.replace("Journal")}
            color={"#303A4B"}
          />
          <View style={{ height: SPACING.sm }} />
          <NextStepBanner
            icon="meditation"
            title="Breathing Exercise"
            subtitle="2 minutes to calm your nervous system"
            onPress={() => navigation.replace("BreathingExercise")}
            color="#303A4B"
          />
        </View>
        <TouchableOpacity style={sumStyles.doneBtn} onPress={onContinue}>
          <Text style={sumStyles.doneBtnText}>I'm done for now</Text>
        </TouchableOpacity>
      </FadeSlideIn>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DeepReflectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const mood = route.params?.mood || {};

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const handleSelect = (value) => {
    const qId = QUESTIONS[currentQ].id;
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < TOTAL_Q - 1) {
        setCurrentQ((prev) => prev + 1);
      } else {
        setDone(true);
      }
    }, 450);
  };

  const handleNext = () => {
    if (currentQ < TOTAL_Q - 1) setCurrentQ((p) => p + 1);
    else setDone(true);
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
    else navigation.goBack();
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <SummaryView
          mood={mood}
          answers={answers}
          onContinue={() => navigation.goBack()}
          navigation={navigation}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <View style={styles.progressRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={22} color={"#303A4B"} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <MoodProgressBar step={currentQ + 1} total={TOTAL_Q} color="#B8C5DD" />
            </View>
            <Text style={styles.progressText}>{currentQ + 1}/{TOTAL_Q}</Text>
          </View>
        </View>

        <QuestionArea
          key={currentQ}
          q={QUESTIONS[currentQ]}
          index={currentQ}
          selected={answers[QUESTIONS[currentQ].id]}
          onSelect={handleSelect}
          onNext={handleNext}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8EFEF" },
  content: { flexGrow: 1, paddingBottom: 0 },
  topSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    ...SHADOWS.sm,
  },
  progressText: { fontSize: FONT.xs, color: "#677d99ff", fontWeight: WEIGHT.medium, minWidth: 28, textAlign: "right" },
  introWrap: { marginBottom: SPACING.xl },
  introTitle: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: "#303A4B", marginBottom: SPACING.sm },
  introSub: { fontSize: FONT.base, color: "#6B7A8E", lineHeight: 22 },
  questionTextWrap: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  nextBtn: {
    marginTop: SPACING.xl,
    backgroundColor: "#F4ECEC",
    borderRadius: RADIUS.full,
    padding: 18,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  nextBtnText: { color: "#6B7A8E", fontWeight: WEIGHT.bold, fontSize: 16 },
});

const qStyles = StyleSheet.create({
  counter: {
    fontSize: FONT.sm,
    color: "#7B8A9E",
    fontWeight: WEIGHT.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
    textAlign: "center"
  },
  question: {
    fontSize: 18,
    fontWeight: WEIGHT.semibold,
    color: "#303A4B",
    lineHeight: 34,
    marginVertical: SPACING.xxxl,
    textAlign: "center"
  },
  optionsContainer: {
    backgroundColor: "#b6bdc9ff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 30,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 60,
    flexGrow: 1,
  },
});

const sumStyles = StyleSheet.create({
  wrap: { padding: SPACING.xl, paddingBottom: 60 },
  topBadge: { alignItems: "center", marginBottom: SPACING.xl },
  topEmoji: { fontSize: 72 },
  title: { fontSize: 26, fontWeight: WEIGHT.extrabold, color: "#303A4B", marginBottom: SPACING.sm, textAlign: "center" },
  disclaimer: { fontSize: FONT.sm, color: "#6B7A8E", marginBottom: SPACING.xl, lineHeight: 20, textAlign: "center" },
  lineCard: {
    flexDirection: "row",
    gap: SPACING.md,
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: "#B8C5DD",
    ...SHADOWS.sm,
  },
  lineText: { flex: 1, fontSize: FONT.base, color: "#303A4B", lineHeight: 24, fontWeight: WEIGHT.medium },
  reminder: { fontSize: FONT.sm, color: "#7B8A9E", textAlign: "center", marginTop: SPACING.md, lineHeight: 22, fontStyle: "italic", marginBottom: SPACING.xl },
  nextSteps: { marginTop: SPACING.md },
  nextTitle: { fontSize: FONT.sm, fontWeight: WEIGHT.bold, color: "#6B7A8E", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: SPACING.md },
  doneBtn: { alignItems: "center", padding: SPACING.lg, marginTop: SPACING.xl, backgroundColor: "#3c5e9cff", borderRadius: RADIUS.full },
  doneBtnText: { color: "#fff", fontWeight: WEIGHT.bold, fontSize: FONT.base },
});
