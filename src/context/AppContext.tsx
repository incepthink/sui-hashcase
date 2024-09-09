"use client";
import { createContext, useState } from "react";

export const AppContext = createContext<any>(null);

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        openModal,
        setOpenModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
