import { storage } from "./storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method with authorization
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const token = await storage.getToken(); // Get auth token

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
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}

const api = new APIClient();
export default api;
