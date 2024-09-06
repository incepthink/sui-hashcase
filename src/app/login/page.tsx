"use client";
import { useAuthCallback } from "@mysten/enoki/react";
import { useEffect } from "react";

export default function AuthPage() {
  const { handled } = useAuthCallback();

  useEffect(() => {
    if (handled) {
      window.location.href = "/";
    }
  }, [handled]);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}
