"use client";
import { useEffect, useState } from "react";

import { LeaderboardPeriod } from "@/utils/enums";
import axiosInstance from "@/utils/axios";

type LeaderboardEntry = {
  user_id: number;
  total_points: number;
  rank: number;
};

const LeaderboardTable = ({ owner_id }: { owner_id: number }) => {
  const [period, setPeriod] = useState<LeaderboardPeriod>(
    LeaderboardPeriod.MONTHLY
  );

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );

  useEffect(() => {
    const getLeaderboardData = async () => {
      //we get the leaderboard, with the help of the owner_id & the time period
      const response = await axiosInstance.get("/platform/leaderboard", {
        params: {
          owner_id: owner_id,
          period: period,
        },
      });
      const leaderboard = response.data.leaderboard;
      // console.log(leaderboard);
      setLeaderboardData(leaderboard);
    };

    getLeaderboardData();
  }, [period]);

  return (
    <div className="flex flex-col justify-start items-center gap-6 w-full h-full  bg-gradient-to-b from-[#00041f] to-[#030828] p-8 shadow-lg">
      <h1 className="text-4xl font-extrabold mb-6 text-blue-300 drop-shadow-md">
        Leaderboard
      </h1>

      {/* Time Period Buttons */}
      <div className="flex justify-start items-center gap-6 w-full max-w-6xl mx-auto">
        <button
          onClick={() => setPeriod(LeaderboardPeriod.MONTHLY)}
          className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriod(LeaderboardPeriod.WEEKLY)}
          className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod(LeaderboardPeriod.DAILY)}
          className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
        >
          Daily
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full flex flex-col justify-start items-start gap-4 max-w-6xl mx-auto ">
        {/* Table Header */}
        <div className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-white/10 backdrop-blur-lg shadow-lg">
          <p className="w-1/3 text-center">Rank</p>
          <p className="w-1/3 text-center">User ID</p>
          <p className="w-1/3 text-center">Loyalty Points</p>
        </div>

        {/* Leaderboard Entries */}
        {leaderboardData.map((nft, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg text-white bg-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
          >
            <p className="w-1/3 text-center">{nft.rank}</p>
            <p className="w-1/3 text-center">{nft.user_id}</p>
            <p className="w-1/3 text-center">{nft.total_points}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTable;
