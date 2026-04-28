import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storyService, commentService } from '../utils/storyService';
import { storage } from '../utils/storage';
import CommentsList from '../components/CommentsList';
import RequestChatButton from '../components/RequestChatButton';
import typography from '../styles/typography';

export default function StoryDetailsScreen({ route }) {
  const { story: initialStory } = route.params;
  const [story, setStory] = useState(initialStory);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(true);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadStoryDetails();
  }, []);

  const loadStoryDetails = async () => {
    try {
      setLoading(true);
      // Fetch full story details (includes view count increment)
      const response = await storyService.getStoryDetail(initialStory._id);
      if (response.success) {
        setStory(response.data);
      }
      
      // Fetch comments
      const commentsResponse = await commentService.getComments(initialStory._id);
      if (commentsResponse.success) {
        setComments(commentsResponse.data.comments || []);
      }
    } catch (error) {
      console.error('Error loading story details:', error);
      Alert.alert('Error', 'Failed to load story details');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setPosting(true);
    try {
      const response = await commentService.createComment(story._id, {
        author: isAnonymousComment ? 'Anonymous User' : commentAuthor,
        text: commentText.trim(),
        anonymous: isAnonymousComment,
      });

      if (response.success) {
        setComments([response.data, ...comments]);
        setCommentText('');
        setCommentAuthor('');
        Alert.alert('Success', 'Comment posted!');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', error.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const checkLiked = async () => {
      const isLiked = await storage.isStoryLiked(story._id);
      setLiked(isLiked);
    };
    checkLiked();
  }, [story._id]);

  const handleLike = async () => {
    if (liked || liking) return;

    setLiking(true);
    try {
      const response = await storyService.likeStory(story._id);
      if (response.success) {
        setStory(response.data);
        setLiked(true);
        await storage.addLikedStory(story._id);
      }
    } catch (error) {
      console.error('Error liking story:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8E48BB" />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={typography.pageHeaderText}>{story.condition}</Text>
              <Text style={styles.byText}>
                {story.anonymous ? 'Anonymous' : story.author}
              </Text>
            </View>

            <View style={styles.storyCard}>
              <Text style={styles.title}>{story.title}</Text>
              <Text style={styles.fullStory}>{story.story}</Text>
              
              <View style={styles.metaRow}>
                <TouchableOpacity style={styles.metaButton} onPress={handleLike}>
                  <Text style={styles.metaText}>❤️ {story.likes} Likes</Text>
                </TouchableOpacity>
                <Text style={styles.metaText}>👁️ {story.views} Views</Text>
              </View>

              <RequestChatButton />
            </View>

            <View style={styles.commentsContainer}>
              <Text style={typography.heading}>Comments ({comments.length})</Text>
              
              <View style={styles.commentInput}>
                {!isAnonymousComment && (
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#9ca3af"
                    value={commentAuthor}
                    onChangeText={setCommentAuthor}
                    editable={!posting}
                  />
                )}
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#9ca3af"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  editable={!posting}
                  textAlignVertical="top"
                />
                
                <View style={styles.anonymousToggle}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isAnonymousComment && styles.toggleButtonActive,
                    ]}
                    onPress={() => setIsAnonymousComment(true)}
                    disabled={posting}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isAnonymousComment && styles.toggleTextActive,
                      ]}
                    >
                      Anonymous
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !isAnonymousComment && styles.toggleButtonActive,
                    ]}
                    onPress={() => setIsAnonymousComment(false)}
                    disabled={posting}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        !isAnonymousComment && styles.toggleTextActive,
                      ]}
                    >
                      Show Name
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.postBtn, posting && styles.postBtnDisabled]}
                  onPress={addComment}
                  disabled={posting}
                >
                  {posting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.postBtnText}>Post Comment</Text>
                  )}
                </TouchableOpacity>
              </View>

              {comments.length > 0 ? (
                <CommentsList comments={comments} />
              ) : (
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8E48BB',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#8E48BB',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  byText: {
    color: '#e5e7eb',
    marginTop: 4,
  },
  storyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  fullStory: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 16,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#e5e7eb',
    borderBottomColor: '#e5e7eb',
    marginBottom: 12,
  },
  metaButton: {
    flex: 1,
    paddingVertical: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  commentsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  commentInput: {
    marginTop: 16,
    gap: 10,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  anonymousToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: '#8E48BB',
    backgroundColor: '#eef2ff',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#8E48BB',
  },
  postBtn: {
    backgroundColor: '#8E48BB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyComments: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
});

