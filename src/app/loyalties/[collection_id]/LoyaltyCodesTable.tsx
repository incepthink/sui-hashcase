"use client";
import { useEffect, useState } from "react";

import axiosInstance from "@/utils/axios";

import { Flame } from "lucide-react";
import toast from "react-hot-toast";

type Loyalty = {
  id: number;
  owner_id: number;
  code: string;
  value: number;
  type: string;
};

interface User {
  // Define the shape of the user object
  id: number;
  walletAddress: string;
  email: string | null;
  badges: string;
}

const LoyaltyCodesTable = ({
  owner_id,
  user,
}: {
  owner_id: number;
  user: User;
}) => {
  // to store the fetched loyalty codes, points data & active streak
  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);
  const [offChainPointsState, setOffChainPointsState] = useState();
  const [currentStreak, setCurrentStreak] = useState(0);

  const getLoyaltyCodesAndPoints = async () => {
    const loyaltyResponse = await axiosInstance.get("/platform/get-loyalties", {
      params: {
        owner_id: owner_id,
      },
    });

    setLoyaltyCodes(loyaltyResponse.data.loyalties);

    const offChainPointsResponse = await axiosInstance.get(
      "/platform/getLoyaltyPoints",
      {
        params: {
          owner_id: owner_id,
          user_id: user?.id,
        },
      }
    );

    // console.log(offChainPointsResponse);
    setOffChainPointsState(offChainPointsResponse.data.points);
  };

  //   let config = {
  //     method: "post",
  //     maxBodyLength: Infinity,
  //     url: `http://localhost:8000/platform/daily-check-in?user_id=${user.id}&owner_id=${owner_id}`,
  //     headers: {},
  //   };

  const handleAddLoyalty = async (code: string) => {
    try {
      const loyaltyResponse = await axiosInstance.post(
        "/platform/addLoyaltyCode",
        { code },
        {
          params: {
            user_id: user.id,
            owner_id: owner_id,
          },
        }
      );

      toast.success(
        `${loyaltyResponse.data.message} : Total Points - ${loyaltyResponse.data.totalPoints}`
      );

      setOffChainPointsState(loyaltyResponse.data.totalPoints);

      console.log(loyaltyResponse);
    } catch (error) {
      toast.error("Loyalty Code has already been used");
      console.log(error);
    }
  };

  const performDailyCheckIn = async () => {
    try {
      const checkInResponse = await axiosInstance.post(
        "/platform/daily-check-in",
        null,
        {
          params: {
            user_id: user.id,
            owner_id: owner_id,
          },
        }
      );

      console.log(checkInResponse);
    } catch (error) {
      console.log(error);
    }
  };

  const getStreakCount = async () => {
    try {
      const streakResponse = await axiosInstance.get("/platform/get-streak", {
        params: {
          user_id: user.id,
          owner_id: owner_id,
        },
      });

      console.log("WE ARE GETTING THE STREAK COUNT RESPONSE");
      console.log(streakResponse);

      setCurrentStreak(streakResponse.data.streakCount);
    } catch (error) {
      console.log("error while fetching streak");
      console.error(error);
    }
  };

  useEffect(() => {
    getLoyaltyCodesAndPoints();
    performDailyCheckIn();
    getStreakCount();

    // if (user.id) handleDailyCheckIn();
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-start p-8 text-white">
      {/* Off-Chain Points */}
      <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
        {`Off-Chain Points: ${offChainPointsState}`}
      </h1>

      {/* Streak Display */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-md shadow-md mb-6">
        <Flame className="text-red-600 w-8 h-8" />
        <span className="text-xl font-semibold">{`Streak: ${currentStreak} days`}</span>
      </div>

      {/* Loyalty Codes */}
      <h1 className="text-4xl font-extrabold mb-6 text-blue-300 drop-shadow-md">
        Loyalty Codes
      </h1>

      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-lg">
          <thead>
            <tr className="text-left bg-[#3f54b4] text-white">
              <th className="p-4">Code</th>
              <th className="p-4">Value</th>
              <th className="p-4">Type</th>
            </tr>
          </thead>
          <tbody>
            {loyaltyCodes?.map((loyalty) => (
              <tr
                key={loyalty.id}
                className="border-b border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <td className="p-4 font-semibold">
                  <button
                    onClick={() => handleAddLoyalty(loyalty.code)}
                    className="bg-[#3f54b4] px-2 py-1 rounded-md"
                  >
                    {loyalty.code}
                  </button>
                </td>
                <td className="p-4">{loyalty.value}</td>
                <td className="p-4">{loyalty.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoyaltyCodesTable;
