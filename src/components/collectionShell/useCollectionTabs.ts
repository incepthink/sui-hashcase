"use client";

import { useParams, usePathname } from "next/navigation";

export type ShellBasePath = "/collections" | "/event";

export interface ShellTab {
  id: string;
  label: string;
  href: string;
}

/**
 * Builds the Points / Quests / NFTs / Badges tab list for a given base path
 * and exposes the shared active-tab detection logic.
 */
export function useCollectionTabs(basePath: ShellBasePath) {
  const params = useParams();
  const pathname = usePathname();

  const base = `${basePath}/${params.collection_name}/${params.collection_id}`;

  const tabs: ShellTab[] = [
    { id: "points", label: "Points", href: base },
    { id: "quests", label: "Quests", href: `${base}/quests` },
    { id: "nfts", label: "NFTs", href: `${base}/nfts` },
    { id: "badges", label: "Badges", href: `${base}/badges` },
  ];

  const isActive = (tab: ShellTab): boolean => {
    // Points is the index route — active only on exact match.
    if (tab.id === "points") return pathname === tab.href;
    // Other tabs are active on their segment (incl. nested routes).
    return (
      pathname.includes(`/${tab.id}/`) || pathname.endsWith(`/${tab.id}`)
    );
  };

  return { tabs, isActive };
}
