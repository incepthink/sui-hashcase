"use client";
import Image from "next/image";
import { Work_Sans } from "next/font/google";
import ArrowB from "../assets/images/arrowB.svg";
import suiBg from "../assets/images/sui-bg.png";
import Link from "next/link";

const workSans = Work_Sans({ subsets: ["latin"] });
export const Hero = () => {
  return (
    <div className="relative min-h-screen flex py-40">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className={`text-4xl md:text-6xl font-bold text-white leading-tight ${workSans.className}`}>
                Turn your audience into{" "}
                <span className="text-[#4DA2FF]">Superfans!</span>
              </h1>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Engage your audience with better, smarter loyalty and rewards campaigns
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Integrate the power of Web 2.5 into your application with near-zero effort
                </p>
              </div>
            </div>

            <div>
              <Link 
                href="/mint" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Claim Free NFT Now
                <ArrowB className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right side - Visual element */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
              
              {/* Main container */}
              <div className="relative w-full h-full  rounded-full border border-white/20 flex items-center justify-center">
                <div className="text-center space-y-6">
                  {/* NFT Card */}
                  <div className="relative w-24 h-32 md:w-28 md:h-36 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-lg border border-white/30 mx-auto transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-lg"></div>
                    <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-2 right-2 text-xs text-white font-medium">NFT</div>
                  </div>
                  
                  {/* Location indicator */}
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    <span className="text-white text-sm font-medium">Location-based</span>
                  </div>
                  
                  {/* Web3 indicator */}
                  <div className="text-center">
                    <div className="text-white font-bold text-lg md:text-xl">Web 2.5</div>
                    <div className="text-gray-300 text-xs md:text-sm">Hashcase</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white/5 backdrop-blur-sm border-t border-white/10">
         
        </div>
      </div>
    </div>
  );
};
