import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  // Define the shape of your user object
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  isUserVerified: boolean;
  openModal: boolean;
  setUser: (user: User, jwt: string) => void;
  unsetUser: () => void;
  inferUser: () => void;
  setOpenModal: (open: boolean) => void;
}

export const useGlobalAppStore = create<AppState>((set) => ({
  user: null,
  isUserVerified: false,
  openModal: true,

  // Action to set the user and JWT in cookies and state
  setUser: (user, jwt) => {
    Cookies.set("user", JSON.stringify(user), {
      expires: new Date(new Date().getTime() + 30 * 60 * 1000), // 30 minutes
    });
    Cookies.set("jwt", jwt, {
      expires: new Date(new Date().getTime() + 30 * 60 * 1000), // 30 minutes
    });
    set({ user: user, isUserVerified: true });
  },

  // Action to unset the user and remove cookies
  unsetUser: () => {
    Cookies.remove("user");
    Cookies.remove("jwt");
    set({ user: null, isUserVerified: false });
  },

  // Action to infer the user from cookies
  inferUser: () => {
    const user = Cookies.get("user");
    const jwt = Cookies.get("jwt");
    if (user && jwt) {
      set({ user: JSON.parse(user), isUserVerified: true });
    } else {
      set({ isUserVerified: false });
    }
  },

  // Action to set the modal state
  setOpenModal: (open) => set({ openModal: open }),
}));
