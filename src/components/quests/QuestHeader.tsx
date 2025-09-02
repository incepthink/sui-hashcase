// components/QuestHeader.tsx
import { ProgressBar } from "./ProgressBar";

interface QuestHeaderProps {
  completedQuests: number;
  totalQuests: number;
  completionPercentage: number;
  showProgress: boolean;
}

export const QuestHeader: React.FC<QuestHeaderProps> = ({
  completedQuests,
  totalQuests,
  completionPercentage,
  showProgress,
}) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
        Available Quests
      </h1>

      <ProgressBar
        completedQuests={completedQuests}
        totalQuests={totalQuests}
        completionPercentage={completionPercentage}
        isVisible={showProgress}
      />
    </div>
  );
};
