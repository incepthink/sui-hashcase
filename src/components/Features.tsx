import React from "react";
import { Work_Sans } from "next/font/google";
import Hand from "../assets/images/hand.svg";
import Puzzle from "../assets/images/puzzle.svg";

const workSans = Work_Sans({ subsets: ["latin"] });

const Features = () => {
  return (
    <div className="bg-[#00041F] px-[100px] py-8 flex flex-col gap-y-8 justify-center items-center">
      <div className="flex justify-center gap-x-8">
        <div className="bg-[#E9EAED] rounded-xl p-4 px-8 mx-2 w-[605px]">
          <p
            className={`${workSans.className} my-2 text-black text-2xl font-semibold`}
          >
            Design the perfect Campaign
          </p>
          <div className="bg-white backdrop-blur-sm w-[541px] h-[300px] rounded-lg my-2"></div>
          <p className={`${workSans.className} my-2 text-black`}>
            Our Team of experts help design the product campaign choose from a
            suite of features ( Points, Badge, Etc)
          </p>
        </div>
        <div className="bg-[#1A1D35] rounded-xl p-4 px-8 mx-2 w-[605px]">
          <p
            className={`${workSans.className} my-2 text-white text-2xl font-semibold`}
          >
            In Depth Analytics
          </p>
          <div className="bg-[#00041F]/30 backdrop-blur-sm w-[541px] h-[300px] rounded-lg my-2"></div>
          <p className={`${workSans.className} my-2 text-white text-[14px]`}>
            Our AI tool generate unique assists and messaging loream ipsum your
            users gets personalized experience.
          </p>
        </div>
      </div>
      <div className="flex justify-center items-center gap-x-8">
        <div className="bg-[#1A1D35] rounded-xl p-8 w-[605px]">
          <div className="my-4">
            <Hand />
            <p
              className={`${workSans.className} my-2 text-white text-2xl font-semibold`}
            >
              Hyper-Personalisation with Web3 AI
            </p>
          </div>
          <div className="my-4">
            <p className={`${workSans.className} my-2 text-white`}>
              AI enabled campaigns ensure a unique experience for each user
              journey.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-8 w-[605px]">
          <div className="my-4">
            <Puzzle />
            <p
              className={`${workSans.className} my-2 text-black text-2xl font-semibold`}
            >
              Gamified User Journeys
            </p>
          </div>
          <div className="my-4">
            <p className={`${workSans.className} my-2 text-black`}>
              We help you track and analyse every session giving you a better
              understanding of your consumer&apos;s behaviour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
