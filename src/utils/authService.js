import api from "./api";
import { storage } from "./storage";

export const authService = {
  signup: async (data) => {
    const res = await api.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.token) await storage.setToken(res.token);
    if (res.user?.id) await storage.setUserId(res.user.id);
    if (data.name) await storage.saveUserName(data.name);

    return res;
  },

  login: async (data) => {
    const res = await api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.token) await storage.setToken(res.token);
    // Save user id and name so profile and comment ownership work correctly
    if (res.user?.id) await storage.setUserId(res.user.id);
    if (res.user?.name) await storage.saveUserName(res.user.name);

    return res;
  },

  logout: async () => {
    await storage.removeToken();
    await storage.setUserId("");
  },
};
