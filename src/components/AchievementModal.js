import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AchievementModal({
  visible,
  onClose,
  achievement,
  streak,
}) {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const getSurpriseMessage = (streak) => {
    const messages = {
      1: "🎉 You're on fire! Keep it up for one more day!",
      3: "🚀 Amazing! 3 days in a row, you're unstoppable!",
      7: "👑 A whole week! You're a champion!",
      14: "💪 Two weeks! Your dedication is inspiring!",
      30: "🏆 One month! You've built an incredible habit!",
      180: "🌟 SIX MONTHS! You are a MoodLift Legend!",
      365: "👨‍🚀 ONE YEAR! Welcome to the Elite Club!",
    };

    return messages[streak] || `You've reached a ${streak} day streak! 🎊`;
  };

  const surpriseAnimations = () => {
    // Generate confetti-like effects
    const surprises = [];
    for (let i = 0; i < 8; i++) {
      surprises.push(
        <Animated.Text
          key={i}
          style={[
            styles.confetti,
            {
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 50}px`,
              opacity: opacityAnim,
            },
          ]}
        >
          ✨
        </Animated.Text>
      );
    }
    return surprises;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {surpriseAnimations()}

          <View style={styles.headerContent}>
            <MaterialCommunityIcons
              name="trophy"
              size={60}
              color="#fbbf24"
              style={styles.icon}
            />
            <Text style={styles.title}>Achievement Unlocked!</Text>
          </View>

          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>
              {streak === 1 ? 'Day' : 'Days'} Streak
            </Text>
            <Text style={styles.streakEmoji}>🔥</Text>
          </View>

          <Text style={styles.message}>{getSurpriseMessage(streak)}</Text>

          <View style={styles.celebrationEmojis}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.emoji}>🎊</Text>
            <Text style={styles.emoji}>🌟</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  streakBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  streakLabel: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: '600',
    marginTop: 4,
  },
  streakEmoji: {
    fontSize: 32,
    marginTop: 8,
  },
  message: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  celebrationEmojis: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 32,
  },
  closeButton: {
    backgroundColor: '#8E48BB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
