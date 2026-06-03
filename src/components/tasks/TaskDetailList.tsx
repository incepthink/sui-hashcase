// components/tasks/TaskDetailList.tsx
"use client";

import { useState } from "react";
import { Trophy, Repeat, CheckCircle2, Clock, ClipboardX } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { useAppSnackbar } from "@/providers/SnackbarProvider";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { RequirementRule, TaskWithCompletion } from "@/hooks/useTasksByCode";
import { ShellTheme } from "@/components/collectionShell/theme";

interface TaskDetailListProps {
  tasks: TaskWithCompletion[];
  questTitle: string;
  isWalletConnected: boolean;
  requiredChainType?: "sui" | "evm";
  highlightTaskCode?: string;
  onTaskComplete?: () => void;
  theme: ShellTheme;
}

export const TaskDetailList: React.FC<TaskDetailListProps> = ({
  tasks,
  questTitle,
  isWalletConnected,
  requiredChainType = "sui",
  highlightTaskCode,
  onTaskComplete,
  theme,
}) => {
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(
    new Set()
  );
  const { showSuccess, showError } = useAppSnackbar();
  const { setOpenModal, user } = useGlobalAppStore();

  const getTaskButton = (task: TaskWithCompletion) => {
    const isCompleting = completingTasks.has(task.id);

    if (!isWalletConnected) {
      return null; // No button when wallet not connected
    }

    // If we're completing this task, always show completing state
    if (isCompleting) {
      return (
        <span className="text-xs sm:text-sm px-3 py-2 rounded border bg-gray-600 text-gray-400 border-gray-600 inline-block text-center">
          Completing...
        </span>
      );
    }

    // If task is completed, show completed state
    if (task.is_completed) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded border text-green-400 bg-green-900/20 border-green-700 text-center">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }

    // If task can be completed, show complete button
    if (task.can_complete) {
      return (
        <button
          onClick={() => handleCompleteTask(task)}
          className="text-xs sm:text-sm px-3 py-2 rounded border bg-white text-black border-white hover:bg-gray-100 font-medium transition-colors"
        >
          Complete Task
        </button>
      );
    }

    // Task is pending but cannot be completed yet
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded border text-center ${theme.pill}`}
      >
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  const handleCompleteTask = async (task: TaskWithCompletion) => {
    if (!isWalletConnected && !user?.id) {
      showError("Please connect wallet or sign in to complete tasks");
      setOpenModal(true);
      return;
    }

    // Set completing state immediately
    setCompletingTasks((prev) => new Set(prev).add(task.id));

    try {
      const payload: any = {
        task_id: task.id,
        owner_id: task.owner_id,
      };

      if (user?.id) {
        payload.user_id = user.id;
      }

      // Find task code - we need this for the API call
      const taskCodeToUse = highlightTaskCode;

      if (!taskCodeToUse) {
        throw new Error("Task code not available");
      }

      await axiosInstance.post(
        `/platform/quests/tasks/${taskCodeToUse}/complete`,
        payload
      );

      showSuccess("Task completed successfully!");

      // Call the callback to refetch task data
      if (onTaskComplete) {
        await onTaskComplete();
      }

      // Ping other tabs about the update
      try {
        localStorage.setItem(
          "task_progress_ping",
          JSON.stringify({
            ts: Date.now(),
            wallet: user?.id,
            taskCode: taskCodeToUse,
          })
        );
        localStorage.removeItem("task_progress_ping");
      } catch (storageError) {
        console.warn("Failed to update localStorage:", storageError);
      }

      // Only remove from completing state after successful completion and data refresh
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    } catch (err: any) {
      console.error("Error completing task:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to complete task";

      if (errorMessage.includes("already completed")) {
        showError("Task has already been completed");
        if (onTaskComplete) {
          try {
            await onTaskComplete();
          } catch (refreshError) {
            console.warn("Failed to refresh task data:", refreshError);
          }
        }
      } else {
        showError(errorMessage);
      }

      // Remove from completing state on error
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  // Filter active tasks
  const activeTasks = tasks.filter((task) => task.is_active);

  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${theme.pill}`}
        >
          <ClipboardX className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          No Active Tasks
        </h3>
        <p className="text-gray-400 text-sm sm:text-base">
          This quest has no active tasks at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {activeTasks.map((task, index) => {
        const isHighlighted = highlightTaskCode && task.can_complete;
        const isCompleting = completingTasks.has(task.id);

        return (
          <div
            key={task.id}
            className={`group bg-gray-900 border rounded-lg p-3 sm:p-4 relative overflow-hidden transition-all duration-200 ${
              isHighlighted ? theme.highlightCard : "border-gray-700"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              {/* Task Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                      Task {index + 1}
                    </span>
                    {isHighlighted && (
                      <span
                        className={`text-xs ml-1 px-2 py-1 rounded-full border ${theme.pill}`}
                      >
                        Current
                      </span>
                    )}
                  </div>
                </div>

                {task.description && (
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 ml-6">
                    {task.description}
                  </p>
                )}

                {/* Task Stats */}
                <div className="flex flex-wrap items-center gap-3 ml-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-gray-400" />
                    {task.reward_loyalty_points} points
                  </span>
                  {task.required_completions > 1 && (
                    <span className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-gray-400" />
                      {task.required_completions} completions required
                    </span>
                  )}
                  {task.completion_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      {task.completion_count}/{task.required_completions}{" "}
                      completed
                    </span>
                  )}
                </div>
              </div>

              {/* Task Actions - Single Button */}
              <div className="flex-shrink-0 sm:ml-4 flex justify-center items-center">
                {getTaskButton(task)}
              </div>
            </div>

            {/* Task completion indicator */}
            {/* {task.is_completed && (
              <div className="absolute top-2 left-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )} */}

            {/* Requirement Rules Display */}
            {task.requirement_rules &&
              Array.isArray(task.requirement_rules) &&
              task.requirement_rules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-2">
                    Requirements:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.requirement_rules.map(
                      (rule: RequirementRule, ruleIndex: number) => (
                        <span
                          key={ruleIndex}
                          className="text-xs bg-gray-800/50 text-gray-400 px-2 py-1 rounded border border-gray-600"
                        >
                          {rule.field}:{" "}
                          {rule.values?.join(", ") ||
                            rule.stringValues?.join(", ") ||
                            "Any"}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Loading Indicator for Current Task */}
            {isCompleting && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Completing...</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
