"use client";
import Image from "next/image";
import { Work_Sans } from "next/font/google";
import { HashcaseText } from "../assets";
import suiBg from "../assets/images/sui-bg.png";

const workSans = Work_Sans({ subsets: ["latin"] });
export const Hero = () => {
  return (
    <div className="relative">
      <Image src={suiBg} alt="Sui background" layout="fill" objectFit="cover" />
      <div className="flex flex-col justify-start items-center h-[75vh] pb-16 relative pt-20 mb-12">
        <div className="flex flex-col items-center">
          <p
            className={`text-6xl font-bold tracking-wide text-white text-center my-4 ${workSans.className}`}
          >
            Turn your audience into <br /> Superfans!
          </p>
          <p className="text-xl text-white text-center my-4">
            Engage your audience with better, smarter loyalty and rewards
            campaigns. Integrate the <br /> power of Web 2.5 into your
            application with near-zero effort.
          </p>
        </div>
        <div className="border-[#4DA2FF]/15 border-2 border-b-4 hover:border-4 hover:border-b-2 transition duration-300 rounded-full px-[24px] py-[12px] my-4">
          <HashcaseText />
        </div>
      </div>
      <div className="relative rounded-tr-[100px] rounded-tl-[100px] bg-[#00041F] pt-[6rem] pb-[4rem]">
        <div className="flex justify-center gap-x-[16rem]">
          <p
            className={`text-3xl font-semibold text-white ${workSans.className}`}
          >
            Create memorable browsing & <br /> Checkout Experience
          </p>
          <p className={`text-lg text-white ${workSans.className}`}>
            Gamify your user journey and give your audience something <br />{" "}
            unique that they actually own.
          </p>
        </div>
      </div>
    </div>
  );
};
