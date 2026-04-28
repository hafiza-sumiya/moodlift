import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CommentsList({ comments }) {
  if (!comments || comments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No comments yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {comments.map((comment, idx) => (
        <View key={`${comment.id || idx}`} style={styles.comment}>
          <Text style={styles.author}>{comment.author || 'User'}</Text>
          <Text style={styles.text}>{comment.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  comment: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8E48BB',
  },
  author: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  text: {
    color: '#374151',
    lineHeight: 20,
  },
  empty: {
    padding: 12,
  },
  emptyText: {
    color: '#9ca3af',
  },
});

