"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCollectionById } from "@/hooks/useCollections";
import BadgesTable from "@/components/collection/BadgesTable";

export default function EventBadgesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();

  const { collection, isLoading } = useCollectionById(
    params.collection_id as string
  );
  const ownerId = collection?.owner_id;

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#0d0d0d] to-[#1a1a2e] min-h-[70vh] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!ownerId) {
    return (
      <div className="bg-gradient-to-b from-[#0d0d0d] to-[#1a1a2e] min-h-[70vh] flex items-center justify-center">
        <div className="text-white">Unable to load badges</div>
      </div>
    );
  }

  return <BadgesTable owner_id={ownerId} bgClassName="bg-[#0d0d0d]" />;
}
