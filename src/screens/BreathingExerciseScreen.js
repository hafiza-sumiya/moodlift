import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.6;

export default function BreathingExerciseScreen() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("inhale"); // inhale, hold, exhale
  const [cycle, setCycle] = useState(0);
  const [duration, setDuration] = useState(4); // seconds for each phase
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);

  // Setup Audio mode on component mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log("Audio setup error:", error);
      }
    };

    setupAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playPhaseSound = async (currentPhase) => {
    try {
      // Stop and unload previous sound
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      let soundFile;

      // Map phases to available sound files
      if (currentPhase === "inhale") {
        soundFile = require("../assets/sounds/inhale.mp3");
      } else if (currentPhase === "hold" || currentPhase === "exhale") {
        soundFile = require("../assets/sounds/hold.mp3");
      } else {
        return; // No sound for unknown phases
      }

      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: true,
        volume: 1.0,
      });

      soundRef.current = sound;

      // Set up completion callback to unload when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (error) {
      console.log("Sound playback error:", error);
    }
  };

  const startBreathingCycle = () => {
    if (phase === "inhale") {
      // Play inhale sound immediately
      playPhaseSound("inhale");

      // Inhale: expand
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPhase("hold");
      });
    } else if (phase === "hold") {
      // Play hold sound immediately
      playPhaseSound("hold");

      // Hold: maintain
      setTimeout(() => {
        setPhase("exhale");
      }, duration * 1000);
    } else if (phase === "exhale") {
      // Play exhale sound immediately
      playPhaseSound("exhale");

      // Exhale: contract
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCycle(cycle + 1);
        setPhase("inhale");
      });
    }
  };

  const stopBreathingCycle = () => {
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
    setPhase("inhale");
  };

  const handleStart = () => {
    setIsActive(true);
    setCycle(0);
    setPhase("inhale");
  };

  const handleStop = () => {
    setIsActive(false);
    setCycle(0);
  };

  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
      playPhaseSound();
    }
  }, [phase, isActive]);

  const getInstructionText = () => {
    if (!isActive) return "Tap Start to begin";
    if (phase === "inhale") return "Breathe In...";
    if (phase === "hold") return "Hold...";
    if (phase === "exhale") return "Breathe Out...";
    return "";
  };

  const getSteps = () => [
    "Find a comfortable position",
    "Close your eyes or focus on the circle",
    "Follow the breathing rhythm",
    "Breathe deeply and naturally",
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Breathing Exercise</Text>
      </View> */}

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <View style={styles.stepsContainer}>
          {getSteps().map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.instructionText}>{getInstructionText()}</Text>
            {isActive && (
              <Text style={styles.cycleText}>Cycle {cycle + 1}</Text>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        )}

        {/* Duration Selector */}
        <View style={styles.durationSelector}>
          <Text style={styles.durationLabel}>Duration (seconds):</Text>
          <View style={styles.durationButtons}>
            {[3, 4, 5, 6].map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.durationButton,
                  duration === dur && styles.durationButtonActive,
                ]}
                onPress={() => {
                  setDuration(dur);
                  if (isActive) {
                    handleStop();
                    setTimeout(handleStart, 100);
                  }
                }}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    duration === dur && styles.durationButtonTextActive,
                  ]}
                >
                  {dur}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#8E48BB",
    paddingVertical: 36,
    paddingHorizontal: 20,
    marginBottom: 36,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  instructionsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 18,
    fontWeight: "500",
    lineHeight: 24,
  },
  stepsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    fontSize: 17,
    fontWeight: "700",
    color: "#8E48BB",
    marginRight: 12,
    minWidth: 28,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "500",
  },
  circleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  breathingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#8E48BB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  innerCircle: {
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: "#818cf8",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  cycleText: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
  },
  controls: {
    alignItems: "center",
    marginTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  startButton: {
    backgroundColor: "#8E48BB",
    paddingHorizontal: 52,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  stopButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 52,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  durationSelector: {
    width: "100%",
    alignItems: "center",
  },
  durationLabel: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 14,
    fontWeight: "600",
  },
  durationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  durationButtonActive: {
    backgroundColor: "#8E48BB",
    borderColor: "#8E48BB",
  },
  durationButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b7280",
  },
  durationButtonTextActive: {
    color: "#fff",
  },
});
