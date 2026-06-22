import { storage } from "./storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const token = await storage.getToken(); // 🔥 important

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
      
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // ===== STORY ENDPOINTS =====

  // Get all stories with filters and pagination
  async getStories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/stories?${queryString}`;
    console.log("[APIClient] getStories URL:", `${this.baseURL}${endpoint}`);
    const response = await this.request(endpoint, { method: "GET" });
    console.log("[APIClient] getStories response:", response);
    return response;
  }

  // Get single story by ID
  async getStory(storyId) {
    return this.request(`/stories/${storyId}`, { method: "GET" });
  }

  // Create new story
  async createStory(storyData) {
    return this.request("/stories", {
      method: "POST",
      body: JSON.stringify(storyData),
    });
  }

  // Update story
  async updateStory(storyId, updateData) {
    return this.request(`/stories/${storyId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  // Delete story
  async deleteStory(storyId) {
    return this.request(`/stories/${storyId}`, { method: "DELETE" });
  }

  // Like a story
  async likeStory(storyId) {
    return this.request(`/stories/${storyId}/like`, { method: "PATCH" });
  }

  // ===== COMMENT ENDPOINTS =====

  // Get all comments for a story
  async getComments(storyId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/stories/${storyId}/comments?${queryString}`, {
      method: "GET",
    });
  }

  // save mood entry
  async saveMood(data) {
  return this.request("/moods", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

  // Create comment on a story
  async createComment(storyId, commentData) {
    return this.request(`/stories/${storyId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  // Like a comment
  async likeComment(storyId, commentId) {
    return this.request(`/stories/${storyId}/comments/${commentId}/like`, {
      method: "PATCH",
    });
  }

  // Delete comment
  async deleteComment(storyId, commentId) {
    return this.request(`/stories/${storyId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  // ===== AUTH ENDPOINTS =====

  // Get current user info
  async getCurrentUser() {
    return this.request("/auth/me", { method: "GET" });
  }
}

export default new APIClient();
