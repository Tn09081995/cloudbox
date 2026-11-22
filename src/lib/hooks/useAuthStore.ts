"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (name: string, email: string, avatar?: string) => void;
  updateProfile: (updates: { name?: string; email?: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

const DEFAULT_USER: AuthUser = {
  name: "Nguyễn Minh Anh",
  email: "minhanh.nguyen@cloudbox.vn",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  isInitialized: false,

  initialize: () => {
    if (typeof window === "undefined") return;

    // 1. Check if server callback passed a fresh user session via cookie
    try {
      const match = document.cookie.match(/cloudbox_user_session=([^;]+)/);
      if (match) {
        const decoded = JSON.parse(decodeURIComponent(match[1])) as AuthUser;
        localStorage.setItem("cloudbox_auth_session", JSON.stringify(decoded));
        document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
        set({ user: decoded, isAuthenticated: true, isInitialized: true });
        return;
      }
    } catch {}

    // 2. Check localStorage
    try {
      const stored = localStorage.getItem("cloudbox_auth_session");
      if (stored === "logged_out") {
        set({ user: null, isAuthenticated: false, isInitialized: true });
      } else if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        set({ user: parsed, isAuthenticated: true, isInitialized: true });
      } else {
        // Default on first visit
        localStorage.setItem("cloudbox_auth_session", JSON.stringify(DEFAULT_USER));
        document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
        set({ user: DEFAULT_USER, isAuthenticated: true, isInitialized: true });
      }
    } catch {
      set({ user: DEFAULT_USER, isAuthenticated: true, isInitialized: true });
    }

    // 3. Asynchronously check Supabase session if any
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const realUser: AuthUser = {
            name:
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              u.email?.split("@")[0] ||
              "Người dùng Google",
            email: u.email || "",
            avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || "",
          };
          localStorage.setItem("cloudbox_auth_session", JSON.stringify(realUser));
          document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
          document.cookie = `cloudbox_user_session=${encodeURIComponent(JSON.stringify(realUser))}; path=/; max-age=604800; SameSite=Lax`;
          set({ user: realUser, isAuthenticated: true, isInitialized: true });
        }
      }).catch(() => {});
    } catch {}
  },

  login: (name: string, email: string, avatar?: string) => {
    const user: AuthUser = {
      name: name.trim() || email.split("@")[0] || "Người dùng CloudBox",
      email: email.trim().toLowerCase(),
      avatar,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("cloudbox_auth_session", JSON.stringify(user));
      document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
      document.cookie = `cloudbox_user_session=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
    }

    set({ user, isAuthenticated: true, isInitialized: true });
  },

  updateProfile: async (updates: { name?: string; email?: string; avatar?: string }) => {
    const currentUser = get().user || DEFAULT_USER;
    const updatedUser: AuthUser = {
      ...currentUser,
      name: updates.name !== undefined ? updates.name.trim() || currentUser.name : currentUser.name,
      email: updates.email !== undefined ? updates.email.trim().toLowerCase() || currentUser.email : currentUser.email,
      avatar: updates.avatar !== undefined ? updates.avatar : currentUser.avatar,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("cloudbox_auth_session", JSON.stringify(updatedUser));
      document.cookie = "cloudbox_session=1; path=/; max-age=604800; SameSite=Lax";
      document.cookie = `cloudbox_user_session=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=604800; SameSite=Lax`;
    }

    set({ user: updatedUser });

    // Also update Supabase user metadata if signed in
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          full_name: updatedUser.name,
          name: updatedUser.name,
          avatar_url: updatedUser.avatar,
        },
      });
    } catch {}
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cloudbox_auth_session", "logged_out");
      document.cookie = "cloudbox_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "cloudbox_user_session=; path=/; max-age=0; SameSite=Lax";
      try {
        const supabase = createClient();
        supabase.auth.signOut().catch(() => {});
      } catch {}
    }

    set({ user: null, isAuthenticated: false, isInitialized: true });
  },
}));
