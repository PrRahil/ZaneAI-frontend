import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  username: string;
  org_id: string;
  role: string;
  is_connection_setup?: boolean;
  missing_connectors?: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get("token") ?? null,
  user: null,

  setToken: (token) => {
    if (token) Cookies.set("token", token, { expires: 7 });
    else Cookies.remove("token");

    set({ token });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    Cookies.remove("token");
    set({ token: null, user: null });
  },
}));
