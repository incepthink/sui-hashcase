"use client";

import { useState } from "react";
import { Metadata } from "@/utils/modelTypes";

interface NFTImageDisplayProps {
  images: Metadata[] | string[];
  singleMode?: boolean;
  animationUrl?: string;
  title?: string;
}

export default function NFTImageDisplay({
  images,
  singleMode = false,
  animationUrl,
  title = "NFT Image",
}: NFTImageDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle both Metadata[] and string[] inputs
  const imageUrls = images.map((item) =>
    typeof item === "string" ? item : item.image_url
  );

  if (imageUrls.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const currentImage = imageUrls[currentIndex];
  const showNavigation = imageUrls.length > 1 && !singleMode;

  return (
    <div className="relative w-full">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
        {/* Animation URL with fallback to static image */}
        {animationUrl ? (
          <video
            src={animationUrl}
            className="w-full h-full object-contain p-4"
            autoPlay
            loop
            muted
          />
        ) : (
          <img
            src={currentImage}
            alt={title}
            className="w-full h-full object-contain p-4"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Navigation Arrows */}
        {showNavigation && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm border border-white/10"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm border border-white/10"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        {showNavigation && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showNavigation && (
        <div className="flex gap-3 mt-5 justify-center pb-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                index === currentIndex
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#00041F] scale-110"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <img
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
