"use client";
import Image from "next/image";
import { Work_Sans } from "next/font/google";
import ArrowB from "../assets/images/arrowB.svg";
import suiBg from "../assets/images/sui-bg.png";
import Link from "next/link";

const workSans = Work_Sans({ subsets: ["latin"] });
export const Hero = () => {
  return (
    <div className="relative">
      <Image
        src={suiBg}
        alt="Sui background"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="flex flex-col justify-start items-center md:h-[75vh] h-[50vh] pb-16 relative pt-20 mb-12">
        <div className="flex flex-col items-center">
          <p
            className={`md:text-6xl text-[28px] md:leading-[60px] leading-8 font-[1000] tracking-wide text-white text-center my-4 ${workSans.className}`}
          >
            Turn your audience into <br />{" "}
            <span className="text-[#4DA2FF]"> Superfans! </span>
          </p>
          <p className="md:text-xl text-sm text-white text-center my-4">
            Engage your audience with better, smarter loyalty and rewards
            campaigns. Integrate the <br className="hidden md:block" /> power of
            Web 2.5 into your application with near-zero effort.
          </p>
        </div>
        <div className="flex items-center justify-center my-4 w-full">
          <Link
            href="/mint"
            className="px-6 py-3 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
          >
            Claim Free NFT Now
            <ArrowB />
          </Link>
        </div>
      </div>
      <div className="relative md:rounded-tr-[80px] rounded-tr-xl md:rounded-tl-[80px] rounded-tl-xl bg-[#00041F] md:pt-[6rem] pt-[1.5rem] md:pb-[4rem] pb-[2rem]">
        <div className="flex flex-col md:flex-row justify-center md:gap-x-[16rem] gap-x-4">
          <p
            className={`md:text-3xl text-2xl md:mt-0 md:mb-0 mb-4 mt-4 px-3 font-semibold text-white ${workSans.className}`}
          >
            Create memorable browsing & <br className="hidden md:block" />{" "}
            Checkout Experience
          </p>
          <p
            className={`md:text-lg text-sm text-white px-3 ${workSans.className}`}
          >
            Gamify your user journey and give your audience something{" "}
            <br className="hidden md:block" /> unique that they actually own.
          </p>
        </div>
      </div>
    </div>
  );
};
