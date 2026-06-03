"use client";

import { ShellTheme } from "./theme";

interface ShellSkeletonProps {
  theme: ShellTheme;
}

/**
 * Placeholder that mirrors the shell's shape (banner + title row + tab row)
 * while the collection loads, so the header/tabs don't vanish and reappear.
 */
export default function ShellSkeleton({ theme }: ShellSkeletonProps) {
  return (
    <div className={`min-h-screen ${theme.pageBg} animate-pulse`}>
      {/* Banner */}
      <div className={`w-full sm:h-[45vh] h-[35vh] ${theme.skeletonBlock}`} />

      {/* Title row */}
      <div className="mx-auto max-w-7xl sm:px-4 px-2 -mt-8">
        <div className="flex items-center gap-6">
          <div className={`h-24 w-24 rounded-lg ${theme.skeletonBlock}`} />
          <div className={`h-9 w-64 rounded-md ${theme.skeletonBlock}`} />
        </div>
      </div>

      {/* Tab row */}
      <div
        className={`mx-auto max-w-7xl mt-12 border-b ${theme.tabBarBorder} sm:px-4 px-2`}
      >
        <div className="flex gap-12 pl-1 pb-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-5 w-16 rounded ${theme.skeletonBlock}`}
            />
          ))}
        </div>
      </div>

      {/* Content stub */}
      <div className="mx-auto max-w-7xl sm:px-4 px-2 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-64 rounded-xl ${theme.skeletonBlock}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
