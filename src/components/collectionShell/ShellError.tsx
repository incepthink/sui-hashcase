"use client";

import { ShellTheme } from "./theme";

interface ShellErrorProps {
  theme: ShellTheme;
  title: string;
  message: string;
}

/** Themed, stable-height "not found" state for the shell. */
export default function ShellError({ theme, title, message }: ShellErrorProps) {
  return (
    <div
      className={`w-full min-h-[70vh] flex flex-col items-center justify-center ${theme.pageBg} px-4 text-center`}
    >
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
        {title}
      </h1>
      <p className="text-lg sm:text-xl text-white/80 max-w-2xl">{message}</p>
    </div>
  );
}
