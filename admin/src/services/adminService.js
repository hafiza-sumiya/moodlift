import { storage } from "@/utils/storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

class AdminService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin`;
    this.onUnauthorized = null;
  }

  // Generic request method with authorization
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await storage.getToken();

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
      console.log(`📤 [Admin API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📥 [Admin API] Response:`, { status: response.status, success: data.success });

      if (!response.ok) {
        if (
          response.status === 401 ||
          data.message === "Not authorized" ||
          data.message === "Invalid token"
        ) {
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
        }
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`❌ [Admin API] Error at ${url}:`, error.message);
      throw error;
    }
  }

  // ===== AUTH =====
  async login(email, password) {
    const url = `${API_BASE_URL}/auth/admin-login`;
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };

    try {
      console.log(`🔐 [Admin Login] Attempting login for: ${email}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ [Admin Login] Failed:`, data.message);
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log(`✅ [Admin Login] Success:`, data.admin?.email);
      return data;
    } catch (error) {
      console.error("❌ [Admin Login] Error:", error.message);
      throw error;
    }
  }

  // ===== DASHBOARD =====
  async getDashboardStats() {
    return this.request("/dashboard/stats", { method: "GET" });
  }

  // ===== USER MANAGEMENT =====
  async getAllUsers(page = 1, limit = 20, search = "", status = "") {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (status) query += `&status=${status}`;

    return this.request(`/users${query}`, { method: "GET" });
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`, { method: "GET" });
  }

  async toggleBlockUser(userId) {
    return this.request(`/users/${userId}/block`, { method: "PATCH" });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, { method: "DELETE" });
  }

  async makeUserAdmin(userId) {
    return this.request(`/users/${userId}/make-admin`, { method: "PATCH" });
  }

  async removeUserAdmin(userId) {
    return this.request(`/users/${userId}/remove-admin`, { method: "PATCH" });
  }

  // ===== STORY MANAGEMENT =====
  async getAllStories(page = 1, limit = 20, search = "", condition = "", status = "") {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (condition) query += `&condition=${encodeURIComponent(condition)}`;
    if (status) query += `&status=${status}`;

    return this.request(`/stories${query}`, { method: "GET" });
  }

  async getStoryById(storyId) {
    return this.request(`/stories/${storyId}`, { method: "GET" });
  }

  async toggleBlockStory(storyId) {
    return this.request(`/stories/${storyId}/block`, { method: "PATCH" });
  }

  async deleteStory(storyId) {
    return this.request(`/stories/${storyId}`, { method: "DELETE" });
  }

  async updateStoryStatus(storyId, status) {
    return this.request(`/stories/${storyId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ===== COMMENT MANAGEMENT =====
  async getAllComments(page = 1, limit = 20, search = "", status = "") {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (status) query += `&status=${status}`;

    return this.request(`/comments${query}`, { method: "GET" });
  }

  async getCommentById(commentId) {
    return this.request(`/comments/${commentId}`, { method: "GET" });
  }

  async toggleBlockComment(commentId) {
    return this.request(`/comments/${commentId}/block`, { method: "PATCH" });
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, { method: "DELETE" });
  }

  async toggleApproveComment(commentId) {
    return this.request(`/comments/${commentId}/approve`, { method: "PATCH" });
  }
}

export const adminService = new AdminService();
