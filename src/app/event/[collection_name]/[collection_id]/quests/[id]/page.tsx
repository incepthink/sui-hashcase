// quests/[id]/page.tsx
"use client";

import { Suspense } from "react";
import QuestDetailPageContent from "@/components/questsDetails/QuestDetailPageContent";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { eventTheme } from "@/components/collectionShell/theme";

const QuestDetailPage = () => {
  return (
    <Suspense fallback={<ContentSkeleton theme={eventTheme} variant="detail" />}>
      <QuestDetailPageContent />
    </Suspense>
  );
};

export default QuestDetailPage;
