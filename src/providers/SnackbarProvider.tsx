"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
  key: number;
}

interface AppSnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const AppSnackbarContext = createContext<AppSnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackbarMessage | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (snackPack.length && !current) {
      setCurrent({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && current && open) {
      setOpen(false);
    }
  }, [snackPack, current, open]);

  const enqueue = useCallback((message: string, severity: AlertColor) => {
    setSnackPack((prev) => [...prev, { message, severity, key: Date.now() }]);
  }, []);

  const showSuccess = useCallback(
    (m: string) => enqueue(m, "success"),
    [enqueue]
  );
  const showError = useCallback((m: string) => enqueue(m, "error"), [enqueue]);
  const showInfo = useCallback((m: string) => enqueue(m, "info"), [enqueue]);

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => setCurrent(undefined);

  return (
    <AppSnackbarContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionProps={{ onExited: handleExited }}
      >
        <Alert
          onClose={handleClose}
          severity={current?.severity ?? "info"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {current?.message ?? ""}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

export function useAppSnackbar(): AppSnackbarContextValue {
  const ctx = useContext(AppSnackbarContext);
  if (!ctx)
    throw new Error("useAppSnackbar must be used within a SnackbarProvider");
  return ctx;
}
