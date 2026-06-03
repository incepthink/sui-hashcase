"use client";

import Link from "next/link";
import { ShellTheme } from "./theme";
import { ShellBasePath, useCollectionTabs } from "./useCollectionTabs";

interface CollectionTabsProps {
  theme: ShellTheme;
  basePath: ShellBasePath;
}

/**
 * Sticky, themed tab bar shared by the collection and event layouts.
 * Sticks just below the (sticky) navbar and uses `scroll={false}` so switching
 * tabs swaps content in place without jumping the scroll position.
 */
export default function CollectionTabs({ theme, basePath }: CollectionTabsProps) {
  const { tabs, isActive } = useCollectionTabs(basePath);

  return (
    <div
      className={`sticky top-14 sm:top-16 z-30 ${theme.tabBarBg} border-b ${theme.tabBarBorder}`}
    >
      <div className="mx-auto max-w-7xl sm:px-4 px-2">
        <div className="flex gap-8 sm:gap-12 pl-1">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                scroll={false}
                className={`relative py-4 font-medium text-sm sm:text-md transition-colors ${
                  active ? theme.tabActive : `${theme.tabInactive} ${theme.tabHover}`
                }`}
              >
                {tab.label}
                {active && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[3px] ${theme.tabUnderline} rounded-t`}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
