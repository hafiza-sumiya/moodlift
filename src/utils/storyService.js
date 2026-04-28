import api from "./api";

/**
 * Story Service - handles all story-related API calls
 */

export const storyService = {
  // Fetch all stories with filters
  async getStories(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...(filters.condition && { condition: filters.condition }),
        sort: filters.sort || "-createdAt",
        ...(filters.search && { search: filters.search }),
      };
      // console.log("[storyService] Fetching stories with params:", params);
      const response = await api.getStories(params);
      // console.log("[storyService] Raw API Response:", response);
      return response;
    } catch (error) {
      console.error("[storyService] Error in getStories:", error);
      throw error;
    }
  },

  // Fetch single story
  async getStoryDetail(storyId) {
    try {
      const response = await api.getStory(storyId);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new story
  async createStory(storyData) {
    try {
      const response = await api.createStory({
        title: storyData.title,
        condition: storyData.condition,
        story: storyData.story,
        author: storyData.author || "Anonymous",
        email: storyData.email,
        anonymous: storyData.anonymous !== false,
        tags: storyData.tags || [],
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update story
  async updateStory(storyId, updates) {
    try {
      const response = await api.updateStory(storyId, updates);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete story
  async deleteStory(storyId) {
    try {
      const response = await api.deleteStory(storyId);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Like story
  async likeStory(storyId) {
    try {
      const response = await api.likeStory(storyId);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search stories
  async searchStories(query, filters = {}) {
    try {
      const response = await api.getStories({
        search: query,
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...filters,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get stories by condition
  async getStoriesByCondition(condition, filters = {}) {
    try {
      const response = await api.getStories({
        condition,
        page: filters.page || 1,
        limit: filters.limit || 10,
        sort: filters.sort || "-createdAt",
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Comment Service - handles all comment-related API calls
 */

export const commentService = {
  // Fetch comments for a story
  async getComments(storyId, filters = {}) {
    try {
      const response = await api.getComments(storyId, {
        page: filters.page || 1,
        limit: filters.limit || 20,
        sort: filters.sort || "-createdAt",
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create comment
  async createComment(storyId, commentData) {
    try {
      const response = await api.createComment(storyId, {
        author: commentData.author || "Anonymous User",
        text: commentData.text,
        email: commentData.email,
        anonymous: commentData.anonymous !== false,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Like comment
  async likeComment(storyId, commentId) {
    try {
      const response = await api.likeComment(storyId, commentId);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete comment
  async deleteComment(storyId, commentId) {
    try {
      const response = await api.deleteComment(storyId, commentId);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
