import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet, Text } from "react-native";
import { COLORS, FONT, WEIGHT } from "@/styles/theme";

import LOGO from "@/assets/moodlift.png";

export default function LogoLoader({ size = 90, showText = true, style }) {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View style={[styles.wrap, style]}>
      <Animated.Image
        source={LOGO}
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Animated.Text style={[styles.name, { opacity: fadeAnim }]}>
          MoodLift
        </Animated.Text>
      )}
    </View>
  );
}

// Static logo (no animation) — for headers
export function LogoImage({ size = 36, style }) {
  return (
    <Image
      source={LOGO}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    borderRadius: 18,
  },
  name: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.extrabold,
    color: COLORS.primary,
    marginTop: 14,
    letterSpacing: -0.5,
  },
});
