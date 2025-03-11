import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  // Define the shape of your user object
  id: number;
  walletAddress: string;
  email: string | null;
  badges: string;
}

interface AppState {
  user: User | null;
  isUserVerified: boolean;
  openModal: boolean;
  userWalletAddress: string | null;
  setUser: (user: User, jwt: string) => void;
  unsetUser: () => void;
  inferUser: () => void;
  setOpenModal: (open: boolean) => void;
  setUserWalletAddress: (address: string) => void;
}

export const useGlobalAppStore = create<AppState>((set) => ({
  user: null,
  isUserVerified: false,
  openModal: true,
  userWalletAddress: null,

  // Action to set the user and JWT in cookies and state
  setUser: (user, jwt) => {
    Cookies.set("user", JSON.stringify(user), {
      expires: new Date(new Date().getTime() + 60 * 60 * 1000), // 60 minutes
    });
    Cookies.set("jwt", jwt, {
      expires: new Date(new Date().getTime() + 60 * 60 * 1000), // 60 minutes
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

  // Action to set the userWalletAddress
  setUserWalletAddress: (address) => set({ userWalletAddress: address }),
}));

//this line is meant to allow us to infer the user if a refresh happens
useGlobalAppStore.getState().inferUser();
