import { Orbitron } from "next/font/google";
import React, { ReactNode } from "react";

const orbitron = Orbitron({ subsets: ["latin"], weight: "700" });

interface NeonHeaderProps {
  children: ReactNode;
  className?: string;
}

const NeonHeader: React.FC<NeonHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative mb-9 mt-6 ${className}`}>
      <h1
        className={`${orbitron.className} text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-[0_0_12px_#60a5fa] hover:drop-shadow-[0_0_20px_#a78bfa] transition-all duration-500`}
      >
        {children}
      </h1>

      {/* Gradient horizontal rule */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/85 via-blue-400/85 to-purple-500/50"></div>
    </div>
  );
};

export default NeonHeader;
