/**
 * EmotionalComponents.js
 * Reusable calming, premium components for MoodLift.
 * Import what you need: import { CalmButton, EmotionalCard, ... } from '../components/EmotionalComponents';
 */
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT } from "../styles/theme";

// ─── Fade + Slide-Up Wrapper ─────────────────────────────────────────────────
export function FadeSlideIn({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(ty,      { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: ty }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Scale-In (for celebration / completion) ─────────────────────────────────
export function ScaleIn({ children, delay = 0, style }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, tension: 70, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Breathing Glow Circle ────────────────────────────────────────────────────
export function BreathingCircle({ size = 120, color = COLORS.primary, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.12, duration: 2000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,    duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 2000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        breathingStyles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + "22",
          borderColor: color + "66",
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <View style={[breathingStyles.inner, { width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36, backgroundColor: color + "33" }]}>
        {children}
      </View>
    </Animated.View>
  );
}
const breathingStyles = StyleSheet.create({
  circle: { justifyContent: "center", alignItems: "center", borderWidth: 2 },
  inner:  { justifyContent: "center", alignItems: "center" },
});

// ─── Calming Soft Button ─────────────────────────────────────────────────────
export function CalmButton({ label, onPress, variant = "primary", icon, style }) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      style={[
        calmBtnStyles.base,
        isPrimary ? calmBtnStyles.primary : calmBtnStyles.ghost,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={isPrimary ? "#fff" : COLORS.primary}
          style={{ marginRight: SPACING.sm }}
        />
      )}
      <Text style={[calmBtnStyles.text, !isPrimary && calmBtnStyles.ghostText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
const calmBtnStyles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: "#fff",
  },
  ghostText: {
    color: COLORS.primary,
  },
});

// ─── Emotional Card ───────────────────────────────────────────────────────────
export function EmotionalCard({ children, style, accent }) {
  return (
    <View style={[ecStyles.card, accent && { borderLeftWidth: 4, borderLeftColor: accent }, style]}>
      {children}
    </View>
  );
}
const ecStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },
});

// ─── Mood Option Chip ─────────────────────────────────────────────────────────
export function MoodOptionChip({ label, emoji, selected, onPress, color }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }),
    ]).start();
    onPress?.();
  };
  const chipColor = color || COLORS.primary;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          chipStyles.chip,
          selected && { backgroundColor: chipColor + "22", borderColor: chipColor },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {emoji && <Text style={chipStyles.emoji}>{emoji}</Text>}
        <Text style={[chipStyles.label, selected && { color: chipColor, fontWeight: WEIGHT.bold }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  emoji: { fontSize: 16 },
  label: { fontSize: FONT.sm, fontWeight: WEIGHT.medium, color: COLORS.textSecondary },
});

// ─── Reflection Question Card ──────────────────────────────────────────────────
export function ReflectionCard({ question, subtitle, children, step, total }) {
  return (
    <FadeSlideIn>
      <View style={reflStyles.card}>
        {step != null && total != null && (
          <Text style={reflStyles.stepIndicator}>{step} of {total}</Text>
        )}
        <Text style={reflStyles.question}>{question}</Text>
        {subtitle && <Text style={reflStyles.subtitle}>{subtitle}</Text>}
        <View style={reflStyles.options}>{children}</View>
      </View>
    </FadeSlideIn>
  );
}
const reflStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    ...SHADOWS.card,
  },
  stepIndicator: {
    fontSize: FONT.xs,
    color: COLORS.primary,
    fontWeight: WEIGHT.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  question: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.extrabold,
    color: COLORS.textPrimary,
    lineHeight: 30,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});

// ─── Mood Progress Bar ────────────────────────────────────────────────────────
export function MoodProgressBar({ step, total, color = COLORS.primary }) {
  const pct = (step / total) * 100;
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, { toValue: pct, duration: 400, useNativeDriver: false }).start();
  }, [step]);
  return (
    <View style={progressStyles.track}>
      <Animated.View
        style={[
          progressStyles.fill,
          {
            width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}
const progressStyles = StyleSheet.create({
  track: {
    height: 5,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: RADIUS.full,
  },
});

// ─── Empty State Card ─────────────────────────────────────────────────────────
export function EmptyStateCard({ emoji = "🌱", title, subtitle, action, onAction }) {
  return (
    <ScaleIn>
      <View style={emptyStyles.wrap}>
        <Text style={emptyStyles.emoji}>{emoji}</Text>
        <Text style={emptyStyles.title}>{title}</Text>
        {subtitle && <Text style={emptyStyles.sub}>{subtitle}</Text>}
        {action && onAction && (
          <CalmButton label={action} onPress={onAction} style={{ marginTop: SPACING.lg }} />
        )}
      </View>
    </ScaleIn>
  );
}
const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emoji: { fontSize: 56, marginBottom: SPACING.lg },
  title: { fontSize: FONT.xl, fontWeight: WEIGHT.bold, color: COLORS.textPrimary, textAlign: "center", marginBottom: SPACING.sm },
  sub:   { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center", lineHeight: 24 },
});

// ─── Next Step Suggestion Banner ──────────────────────────────────────────────
export function NextStepBanner({ icon, title, subtitle, onPress, color = COLORS.primary }) {
  return (
    <FadeSlideIn delay={300}>
      <TouchableOpacity
        style={[nsBannerStyles.card, { borderColor: color + "44" }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={[nsBannerStyles.iconWrap, { backgroundColor: color + "18" }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={nsBannerStyles.title}>{title}</Text>
          <Text style={nsBannerStyles.sub}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={color} />
      </TouchableOpacity>
    </FadeSlideIn>
  );
}
const nsBannerStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1.5,
    ...SHADOWS.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: FONT.sm, fontWeight: WEIGHT.bold, color: COLORS.textPrimary, marginBottom: 2 },
  sub:   { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: WEIGHT.medium },
});
