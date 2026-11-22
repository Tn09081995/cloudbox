"use client";

import { create } from "zustand";

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  initialize: () => void;
}

const DEFAULT_USER: AuthUser = {
  name: "Nguyễn Minh Anh",
  email: "minhanh.nguyen@cloudbox.vn",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  isInitialized: false,

  initialize: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("cloudbox_auth_session");
      if (stored === "logged_out") {
        set({ user: null, isAuthenticated: false, isInitialized: true });
        return;
      }

      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        set({ user: parsed, isAuthenticated: true, isInitialized: true });
        return;
      }
    } catch {
      // Fallback
    }

    // Default: logged in with demo profile on first visit
    localStorage.setItem("cloudbox_auth_session", JSON.stringify(DEFAULT_USER));
    document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
    set({ user: DEFAULT_USER, isAuthenticated: true, isInitialized: true });
  },

  login: (name: string, email: string) => {
    const user: AuthUser = {
      name: name.trim() || email.split("@")[0] || "Người dùng CloudBox",
      email: email.trim().toLowerCase(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("cloudbox_auth_session", JSON.stringify(user));
      document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
    }

    set({ user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cloudbox_auth_session", "logged_out");
      document.cookie = "cloudbox_session=; path=/; max-age=0; SameSite=Lax";
    }

    set({ user: null, isAuthenticated: false, isInitialized: true });
  },
}));
