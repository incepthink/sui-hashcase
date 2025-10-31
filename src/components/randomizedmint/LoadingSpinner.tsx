// src/components/randomizedmint/LoadingSpinner.tsx

"use client";

interface LoadingSpinnerProps {
  message: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-xl">{message}</p>
      </div>
    </div>
  );
}
