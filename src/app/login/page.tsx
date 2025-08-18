"use client";
import { useAuthCallback } from "@mysten/enoki/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { handled } = useAuthCallback();

  useEffect(() => {
    if (handled) {
      window.location.href = "/";
    }
  }, [handled]);

  return (
    <div className="flex justify-center items-center h-screen bg-[#00041F]">
      <Loader2 className="animate-spin h-16 w-16 text-white" />
    </div>
  );
}
