import Link from "next/link";
import React from "react";
import YT from "@/assets/images/yt.svg";
import IG from "@/assets/images/insta.svg";
import X from "@/assets/images/twitter.svg";
import { Work_Sans } from "next/font/google";
import Logo from "@/assets/images/hashcase-text.svg";

const workSans = Work_Sans({ subsets: ["latin"] });

const Footer = () => {
  return (
    <>
      <div className="hidden md:block bg-[#1A1D35] rounded-tr-2xl rounded-tl-2xl pt-8 px-[100px]">
        <div className="flex flex-col md:flex-row md:justify-between justify-start items-center px-8 py-4">
          <div
            className={`flex flex-col md:flex-row gap-x-16 items-center md:justify-center justify-start text-white ${workSans.className}`}
          >
            <Link href="#">About Us</Link>
            <Link href="#">Mint NFTs</Link>
            <Link href="#">Contact</Link>
          </div>
          <div className="flex gap-x-16 items-center md:justify-center justify-start">
            <YT />
            <IG />
            <X />
          </div>
        </div>
        <hr className="mx-[100px] my-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex items-center justify-center">
            <Logo />
          </div>
          <div
            className={`flex gap-x-16 items-center justify-center text-white ${workSans.className}`}
          >
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
          </div>
        </div>
        <p className={`${workSans.className} text-white text-center mt-6 py-2`}>
          @2024 HashCase. All rights reserved.
        </p>
      </div>
      {/* Mobile Footer */}
      <div className="md:hidden bg-[#1A1D35] rounded-tr-lg rounded-tl-lg pt-6 px-4 flex flex-col justify-center items-center">
        <div className="flex justify-start w-full px-4">
          <Logo />
        </div>
        <div className="w-full">
          <hr className="mx-8 my-4 bg-white opacity-20" />
        </div>
        <div className="flex flex-col justify-start items-start w-full gap-y-4">
          <div
            className={`flex flex-col gap-y-4 items-start px-4 justify-start text-white w-full ${workSans.className}`}
          >
            <Link href="#">About Us</Link>
            <Link href="#">Mint NFTs</Link>
            <Link href="#">Contact</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
          </div>
          <div className="flex gap-x-6 px-4 items-center md:justify-center justify-start">
            <YT />
            <IG />
            <X />
          </div>
        </div>
        <div className="w-full">
          <hr className="mx-8 my-4 bg-white opacity-20" />
        </div>
        <p className={`${workSans.className} text-white text-center mt-2 mb-4`}>
          @2024 HashCase. All rights reserved.
        </p>
      </div>
    </>
  );
};

export default Footer;
