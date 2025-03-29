"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Flag, Star, Key, Swords, Coins, CircleDot, Flame } from "lucide-react";

type Objective = {
  objective: string;
  value: number;
  loyalty_code: string;
};

type Quest = {
  id: number;
  owner_id: number;
  title: string;
  objectives: Objective[];
  createdAt: string;
  updatedAt: string;
};

interface User {
  id: number;
  walletAddress: string;
  email: string | null;
  badges: string;
}

const QuestsTable = ({ owner_id }: { owner_id: number }) => {
  // State to store the fetched quests
  const [quests, setQuests] = useState<Quest[]>([]);
  const [offChainPointsState, setOffChainPointsState] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  // Fetch quests and points
  const getQuests = async () => {
    try {
      console.log("we are trying to call the get quests by owner endpoint");

      const questsResponse = await axiosInstance.get(
        "/platform/quest/by-owner",
        {
          params: {
            owner_id: owner_id,
          },
        }
      );

      console.log("WE ARE LOGGING INSIDE THE GET QUESTS");
      console.log(questsResponse);

      setQuests(questsResponse.data.ownerQuests);
    } catch (error) {
      console.error("Error fetching quests and points:", error);
    }
  };

  useEffect(() => {
    getQuests();
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] p-6 shadow-2xl">
      {/* Container-Wrapper */}
      <div className="xl:max-w-[80%] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            QUEST BOARD
          </h1>
          <div className="flex items-center space-x-4 text-white">
            <div className="bg-[#3f54b4]/50 px-4 py-2 rounded-full">
              <span className="text-base font-medium">
                Active: {quests.length}
              </span>
            </div>
            <div className="bg-[#3f54b4]/50 px-4 py-2 rounded-full flex items-center">
              <Flame className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-base font-medium">
                Streak: {currentStreak}d
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-white/80 text-sm">
                <th className="px-4 py-3 font-medium">QUEST</th>
                <th className="px-4 py-3 font-medium text-right">POINTS</th>
                <th className="px-4 py-3 font-medium text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {quests.map((quest) => (
                <tr
                  key={quest.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 rounded-l-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-400/20 p-2 rounded-lg">
                        <Swords className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {quest.title}
                        </h3>
                        {quest.objectives.length > 0 && (
                          <p className="text-sm text-white/60">
                            {quest.objectives[0].objective}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {quest.objectives.length > 0 && (
                      <div className="flex justify-end items-center space-x-1 text-white">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span>{quest.objectives[0].value}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 rounded-r-lg text-right ">
                    <div className="flex justify-end">
                      <div className="bg-green-400/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <CircleDot className="w-3 h-3 mr-1" />
                        ACTIVE
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-white">
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">TOTAL QUESTS</p>
            <p className="text-xl font-bold">{quests.length}</p>
          </div>
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">TOTAL XP</p>
            <p className="text-xl font-bold">
              {quests.reduce(
                (sum, q) => sum + Math.floor(q.objectives[0]?.value || 0),
                0
              )}
            </p>
          </div>
          <div className="bg-[#3f54b4]/20 p-3 rounded-lg">
            <p className="text-xs text-white/60">COMPLETION</p>
            <p className="text-xl font-bold">12%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default QuestsTable;
