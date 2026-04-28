import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

export default function FocusTimerScreen() {
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5); // minutes
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = (minutes) => {
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(true);
    setIsPaused(false);
  };

  const handleCustomStart = () => {
    const minutes = parseInt(customMinutes, 10);
    if (isNaN(minutes) || minutes <= 0 || minutes > 120) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 120 minutes.');
      return;
    }
    setShowCustomInput(false);
    handleStart(minutes);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(0);
    clearInterval(intervalRef.current);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    setIsPaused(false);
    Alert.alert(
      'Focus Session Complete! 🎉',
      'Great job staying focused!',
      [{ text: 'OK', onPress: () => setTimeLeft(0) }]
    );
  };

  const presetDurations = [5, 10, 15, 25, 30];

  return (
    <View style={styles.container}>
      {!isActive ? (
        // Setup View
        <View style={styles.setupContainer}>
          <Text style={styles.subtitle}>
            Choose a duration for your focus session
          </Text>

          <View style={styles.presetContainer}>
            {presetDurations.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.presetButton,
                  selectedDuration === minutes && styles.presetButtonActive,
                ]}
                onPress={() => handleStart(minutes)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    selectedDuration === minutes && styles.presetButtonTextActive,
                  ]}
                >
                  {minutes} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setShowCustomInput(true)}
          >
            <Text style={styles.customButtonText}>Custom Duration</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Timer View (Minimal Screen)
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Focus Time</Text>
          <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
          
          <View style={styles.timerControls}>
            {isPaused ? (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleResume}
              >
                <Text style={styles.controlButtonText}>▶ Resume</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePause}
              >
                <Text style={styles.controlButtonText}>⏸ Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Text style={[styles.controlButtonText, styles.stopButtonText]}>
                ⏹ Stop
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.focusMessage}>
            {isPaused ? 'Paused' : 'Stay focused! You\'ve got this 💪'}
          </Text>
        </View>
      )}

      {/* Custom Duration Modal */}
      <Modal
        visible={showCustomInput}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Duration</Text>
            <Text style={styles.modalSubtitle}>
              Enter duration in minutes (1-120)
            </Text>
            <TextInput
              style={styles.customInput}
              placeholder="Enter minutes"
              keyboardType="numeric"
              value={customMinutes}
              onChangeText={setCustomMinutes}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomMinutes('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCustomStart}
              >
                <Text style={styles.modalButtonConfirmText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#8E48BB',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  presetButton: {
    width: '30%',
    padding: 20,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetButtonActive: {
    backgroundColor: '#8E48BB',
    borderColor: '#8E48BB',
  },
  presetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
  customButton: {
    backgroundColor: '#8E48BB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerLabel: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 16,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#8E48BB',
    marginBottom: 40,
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#8E48BB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    borderColor: '#ef4444',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E48BB',
  },
  stopButtonText: {
    color: '#ef4444',
  },
  focusMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  customInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonConfirm: {
    backgroundColor: '#8E48BB',
  },
  modalButtonCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

