import Link from "next/link";
import React from "react";
import YT from "../assets/images/yt.svg";
import IG from "../assets/images/insta.svg";
import X from "../assets/images/twitter.svg";
import { Work_Sans } from "next/font/google";
import { Logo } from "@/assets";

const workSans = Work_Sans({ subsets: ["latin"] });

const Footer = () => {
  return (
    <div className="bg-[#1A1D35] rounded-tr-2xl rounded-tl-2xl pt-12 px-[100px]">
      {/* Add the Links */}
      <div className="flex justify-between items-center px-8 py-4">
        <div
          className={`flex gap-x-16 items-center justify-center text-white ${workSans.className}`}
        >
          <Link href="#">About Us</Link>
          <Link href="#">Mint NFTs</Link>
          <Link href="#">Contact</Link>
        </div>
        <div className="flex gap-x-16 items-center justify-center">
          <YT />
          <IG />
          <X />
        </div>
      </div>
      <hr className="mx-[100px] my-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
      <div className="flex justify-between items-center px-8 py-4">
        <p className={`${workSans.className} text-white`}>
          © Copyright 2024 by SUI
        </p>
        <div className="flex gap-x-4 items-center justify-center">
          <Logo />
          <p className="text-3xl font-bold text-white">SUI</p>
        </div>
        <div
          className={`flex gap-x-16 items-center justify-center text-white ${workSans.className}`}
        >
          <Link href="#">Terms of Service</Link>
          <Link href="#">Privacy Policy</Link>
        </div>
      </div>
      <p className={`${workSans.className} text-white text-center mt-6 py-2`}>
        @2024 SUI. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
