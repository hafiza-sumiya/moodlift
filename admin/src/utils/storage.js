import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_NAME: "@moodlift:userName",
  MOOD_DATA: "@moodlift:moodData",
  JOURNAL_ENTRIES: "@moodlift:journalEntries",
  ACHIEVEMENTS: "@moodlift:achievements",
  LAST_MOOD_DATE: "@moodlift:lastMoodDate",
  STREAK_COUNT: "@moodlift:streakCount",
  LIKED_STORIES: "@moodlift:likedStories",
};

export const storage = {
  setToken: async (token) => {
    return AsyncStorage.setItem("@moodlift:token", token);
  },

  getToken: async () => {
    return AsyncStorage.getItem("@moodlift:token");
  },
  removeToken: async () => {
    return AsyncStorage.removeItem("@moodlift:token");
  },

  setUserId: async (id) => {
    return AsyncStorage.setItem("@moodlift:userId", String(id));
  },

  getUserId: async () => {
    return AsyncStorage.getItem("@moodlift:userId");
  },

  // User name
  async getUserName() {
    try {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      return name || null;
    } catch (error) {
      console.error("Error getting user name:", error);
      return null;
    }
  },

  async saveUserName(name) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    } catch (error) {
      console.error("Error saving user name:", error);
    }
  },

  // Mood data
  async getMoodData() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MOOD_DATA);
      if (!data) return [];
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.warn("Corrupted mood data, resetting.", parseError);
        await AsyncStorage.removeItem(STORAGE_KEYS.MOOD_DATA);
        return [];
      }
    } catch (error) {
      console.error("Error getting mood data:", error);
      return [];
    }
  },

  async saveMoodData(moodEntry) {
    try {
      const existingData = await this.getMoodData();
      const updatedData = [...existingData, moodEntry];
      await AsyncStorage.setItem(
        STORAGE_KEYS.MOOD_DATA,
        JSON.stringify(updatedData),
      );
      return updatedData;
    } catch (error) {
      console.error("Error saving mood data:", error);
      return [];
    }
  },

  // Journal entries
  async getJournalEntries() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      if (!data) return [];
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.warn("Corrupted journal data, resetting.", parseError);
        await AsyncStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
        return [];
      }
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  },

  async saveJournalEntry(entry) {
    try {
      const existingEntries = await this.getJournalEntries();
      const updatedEntries = [...existingEntries, entry];
      await AsyncStorage.setItem(
        STORAGE_KEYS.JOURNAL_ENTRIES,
        JSON.stringify(updatedEntries),
      );
      return updatedEntries;
    } catch (error) {
      console.error("Error saving journal entry:", error);
      return [];
    }
  },

  // Achievements
  async getAchievements() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error getting achievements:", error);
      return {};
    }
  },

  async updateAchievements(achievements) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements),
      );
    } catch (error) {
      console.error("Error updating achievements:", error);
    }
  },

  // Streak tracking
  async getStreakCount() {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_COUNT);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error("Error getting streak count:", error);
      return 0;
    }
  },

  async updateStreakCount(count) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_COUNT, count.toString());
    } catch (error) {
      console.error("Error updating streak count:", error);
    }
  },

  async getLastMoodDate() {
    try {
      const date = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MOOD_DATE);
      return date || null;
    } catch (error) {
      console.error("Error getting last mood date:", error);
      return null;
    }
  },

  async updateLastMoodDate(date) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_MOOD_DATE, date);
    } catch (error) {
      console.error("Error updating last mood date:", error);
    }
  },

  // Liked stories
  async getLikedStories() {
    try {
      const liked = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_STORIES);
      if (!liked) return [];
      try {
        return JSON.parse(liked);
      } catch (parseError) {
        console.warn("Corrupted liked stories data, resetting.", parseError);
        await AsyncStorage.removeItem(STORAGE_KEYS.LIKED_STORIES);
        return [];
      }
    } catch (error) {
      console.error("Error getting liked stories:", error);
      return [];
    }
  },

  async addLikedStory(storyId) {
    try {
      const liked = await this.getLikedStories();
      if (!liked.includes(storyId)) {
        liked.push(storyId);
        await AsyncStorage.setItem(
          STORAGE_KEYS.LIKED_STORIES,
          JSON.stringify(liked),
        );
      }
    } catch (error) {
      console.error("Error adding liked story:", error);
    }
  },

  async isStoryLiked(storyId) {
    try {
      const liked = await this.getLikedStories();
      return liked.includes(storyId);
    } catch (error) {
      console.error("Error checking if story liked:", error);
      return false;
    }
  },

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      return false;
    }
  },
};
