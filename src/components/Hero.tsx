"use client";
import CursorImage from "../assets/images/cursor.png";
import MessageImage from "../assets/images/message.png";
import Image from "next/image";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <div className="bg-black text-white bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A46EDB_82%)] py-[72px] sm:py-24 relative overflow-clip">
      <div className="absolute h-[375px] w-[800px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] llg:h-[800px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] bg-[radial-gradient(closest-side,#000_82%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]"></div>
      <div className="container relative">
        <div className="flex justify-center mt-8 ">
          <div className="flex">
            <motion.div className="hidden sm:inline" drag dragSnapToOrigin>
              <Image
                src={CursorImage}
                alt="cursor"
                height={120}
                width={120}
                className="max-w-none"
                draggable="false"
              />
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tightner text-center">
              Turn Your Audience
              <br /> into Superfans
            </h1>
            <motion.div className="hidden sm:inline" drag dragSnapToOrigin>
              <Image
                src={MessageImage}
                alt="cursor"
                height={120}
                width={120}
                className="max-w-none"
                draggable="false"
              />
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center">
          <p className="text-xl text-center mt-8 max-w-md">
            Engage your audience with Better , Smarter Loyalty & Rewards
            Campaigns. Integrate the power of Web2.5 into your application with
            near-zero effect.
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <button className="bg-white text-black py-3 px-5 rounded-lg font-medium">
            Get for free
          </button>
        </div>
      </div>
    </div>
  );
};
