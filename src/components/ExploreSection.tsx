import { Work_Sans } from "next/font/google";
import Fire from "../assets/images/fire.svg";
import Quest from "../assets/images/quest.svg";
import Membership from "../assets/images/membership.svg";
import Collectibles from "../assets/images/collectibles.svg";
import Lock from "../assets/images/lock.svg";
import Phygital from "../assets/images/phigtal.svg";
import React from "react";

const workSans = Work_Sans({ subsets: ["latin"] });

const ExploreSection = () => {
  return (
    <div className="bg-[#00041F] py-4">
      <div className="container">
        <div className="flex flex-col gap-y-8 items-center justify-center my-4">
          <div className="flex items-center justify-center gap-x-[40px]">
            <div className="w-[560px] h-[420px] bg-[#1A1D35] backdrop-blur-md rounded-md"></div>
            <div className="flex flex-col justify-center">
              <div className="my-4 px-6">
                <p
                  className={`${workSans.className} text-white text-2xl font-semibold my-2`}
                >
                  Up your game with Web3 Magic
                </p>
                <p className={`${workSans.className} text-white text-md my-2`}>
                  Ut enim ad minim veniam, quis nostrud exercitation <br />{" "}
                  ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <div className="my-4 px-4 flex items-center gap-x-8">
                <div className="flex flex-col items-start justify-center gap-y-8">
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Fire />
                    </div>
                    <p
                      className={`${workSans.className} text-white text-lg font-semibold`}
                    >
                      Loyalty Points
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Membership />
                    </div>
                    <p
                      className={`${workSans.className} text-white text-lg font-semibold`}
                    >
                      Membership
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center gap-y-8">
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Quest />
                    </div>
                    <p
                      className={`${workSans.className} text-white text-lg font-semibold`}
                    >
                      Quests
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Collectibles />
                    </div>
                    <p
                      className={`${workSans.className} text-white text-lg font-semibold`}
                    >
                      Collectibles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-x-[40px]">
            <div className="flex flex-col justify-center">
              <div className="my-4">
                <p
                  className={`${workSans.className} text-white text-2xl font-semibold my-2`}
                >
                  Text Up your game with Magic
                </p>
                <p className={`${workSans.className} text-white text-md my-2`}>
                  Ut enim ad minim veniam, quis nostrud exercitation <br />{" "}
                  ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <div className="my-4 flex justify-center items-center gap-x-6 ">
                <div className="bg-[#1A1D35] backdrop-blur-md rounded-md px-6 py-6 w-[286px] h-[182px]">
                  <div className="w-[46px] h-[46px] bg-[#00041F] backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                    <Lock />
                  </div>
                  <p
                    className={`${workSans.className} text-white text-[20px] font-semibold my-2`}
                  >
                    Authenticate
                  </p>
                  <p
                    className={`${workSans.className} text-white text-[14px] my-2`}
                  >
                    Upidatat non proident sunt in culpa qui official
                  </p>
                </div>
                <div className="bg-[#1A1D35] backdrop-blur-md rounded-md px-6 py-6 w-[286px] h-[182px]">
                  <div className="w-[46px] h-[46px] bg-[#00041F] backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                    <Phygital />
                  </div>
                  <p
                    className={`${workSans.className} text-white text-[20px] font-semibold my-2`}
                  >
                    Phygital Experience
                  </p>
                  <p
                    className={`${workSans.className} text-white text-[14px] my-2`}
                  >
                    Excepteur sint occaecat <br /> cupidatat non proident,
                  </p>
                </div>
                <div className="bg-[#1A1D35] backdrop-blur-md rounded-md"></div>
              </div>
            </div>
            <div className="w-[560px] h-[420px] bg-[#1A1D35] backdrop-blur-md rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;
