"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import QuestsPageContent from "@/components/quests/QuestsPageContent";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { eventTheme } from "@/components/collectionShell/theme";

export default function EventQuestsPage() {
  const params = useParams();
  const collectionId = params.collection_id as string;

  return (
    <Suspense fallback={<ContentSkeleton theme={eventTheme} variant="quests" />}>
      <QuestsPageContent collectionId={collectionId} />
    </Suspense>
  );
}
