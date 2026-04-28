import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function RequestChatButton({ onStatusChange }) {
  const [status, setStatus] = useState('idle'); // idle, requested, accepted, rejected

  const handleRequest = () => {
    setStatus('requested');
    onStatusChange?.('requested');
    // Mock async approval in future; for now keep requested
  };

  const labelMap = {
    idle: 'Request Personal Chat',
    requested: 'Request Sent',
    accepted: 'Chat Approved',
    rejected: 'Request Rejected',
  };

  const isDisabled = status !== 'idle';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          status === 'requested' && styles.buttonPending,
          status === 'accepted' && styles.buttonApproved,
          status === 'rejected' && styles.buttonRejected,
        ]}
        onPress={handleRequest}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.text,
            status !== 'idle' && styles.textDim,
          ]}
        >
          {labelMap[status]}
        </Text>
      </TouchableOpacity>
      {status === 'requested' && (
        <Text style={styles.hint}>Waiting for approval...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#8E48BB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPending: {
    backgroundColor: '#818cf8',
  },
  buttonApproved: {
    backgroundColor: '#10b981',
  },
  buttonRejected: {
    backgroundColor: '#ef4444',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
  textDim: {
    opacity: 0.9,
  },
  hint: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

