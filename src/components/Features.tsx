import React from "react";
import { Work_Sans } from "next/font/google";
import Hand from "../assets/images/hand.svg";
import Puzzle from "../assets/images/puzzle.svg";
import Phone from "../assets/phone.gif";
import Phone2 from "../assets/phone-2.gif";
import Image from "next/image";

const workSans = Work_Sans({ subsets: ["latin"] });

const Features = () => {
  return (
    <div className="bg-[#00041F] md:px-[100px] px-4 py-8 flex flex-col md:flex-row gap-x-8 justify-center items-center gap-4">
      <div className="flex flex-col items-center justify-center md:gap-y-8 gap-y-4 w-full max-w-[541px]">
        <div className="bg-[#E9EAED] rounded-xl p-4 md:px-8 px-4 md:mx-2 mx-0 w-full">
          <p
            className={`${workSans.className} my-2 text-black md:text-2xl text-[16px] font-semibold`}
          >
            Design the perfect Campaign
          </p>
          <div className="backdrop-blur-sm w-full md:h-[300px] h-[173.55px] rounded-lg my-2 overflow-hidden">
            <Image
              src={Phone}
              alt="Phone GIF"
              className="w-full md:h-[300px] h-[173.55px] object-cover"
            />
          </div>
          <p
            className={`${workSans.className} my-2 text-black md:text-[16px] text-[14px]`}
          >
            Our Team of experts help design the product campaign choose from a
            suite of features ( Points, Badge, Etc)
          </p>
        </div>
        <div className="bg-[#1A1D35] rounded-xl md:p-8 p-4 w-full">
          <div className="my-4">
            <Hand />
            <p
              className={`${workSans.className} my-2 text-white md:text-2xl text-[16px] font-semibold`}
            >
              Hyper-Personalisation with Web3 AI
            </p>
          </div>
          <div className="my-4">
            <p
              className={`${workSans.className} my-2 md:text-[16px] text-[14px] text-white`}
            >
              AI enabled campaigns ensure a unique experience for each user
              journey.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center md:gap-y-8 gap-y-4 w-full max-w-[541px]">
        <div className="bg-[#1A1D35] rounded-xl p-4 md:px-8 px-4 md:mx-2 mx-0 w-full">
          <p
            className={`${workSans.className} my-2 text-white md:text-2xl text-[16px] font-semibold`}
          >
            In Depth Analytics
          </p>
          <div className="backdrop-blur-sm w-full md:h-[300px] h-[173.55px] rounded-lg my-2 overflow-hidden">
            <Image
              src={Phone2}
              alt="Phone GIF"
              className="w-full md:h-[300px] h-[173.55px] object-cover"
            />
          </div>
          <p
            className={`${workSans.className} my-2 text-white md:text-[16px] text-[14px]`}
          >
            Our AI tool generate unique assists and messaging loream ipsum your
            users gets personalized experience.
          </p>
        </div>
        <div className="bg-white rounded-xl md:p-8 p-4 w-full">
          <div className="my-4">
            <Puzzle />
            <p
              className={`${workSans.className} my-2 text-black md:text-2xl text-[16px] font-semibold`}
            >
              Gamified User Journeys
            </p>
          </div>
          <div className="my-4">
            <p
              className={`${workSans.className} my-2 text-black md:text-[16px] text-[14px]`}
            >
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
