"use client";

import { Suspense } from "react";
import TaskDetailPageContent from "@/components/tasks/TaskDetailPageContent";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { collectionTheme } from "@/components/collectionShell/theme";

const TaskDetailPage = () => {
  return (
    <Suspense
      fallback={<ContentSkeleton theme={collectionTheme} variant="detail" />}
    >
      <TaskDetailPageContent />
    </Suspense>
  );
};

export default TaskDetailPage;
