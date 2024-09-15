"use client";
import { Work_Sans } from "next/font/google";
import CollBg from "../assets/coll_bg.png";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const workSans = Work_Sans({ subsets: ["latin"] });

const Collectable = () => {
  return (
    <div className="bg-[#00041F] md:h-[60vh] h-[40vh] md:px-[100px] px-0 relative">
      <div className="absolute inset-0 z-0">
        <Image
          src={CollBg}
          alt="Collectable Background"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="container relative z-10">
        <div className="flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-[20px] md:px-12 px-0 py-6">
          <div className="my-4">
            <h1
              className={`${workSans.className} text-white md:text-4xl text-xl text-center font-bold my-2`}
            >
              Claim a Free Digital Collectable
            </h1>
            <p
              className={`${workSans.className} text-white text-center text-[16px] my-2`}
            >
              Feel the rush and collect your
            </p>
          </div>
          <Link
            href="/mint"
            className={`my-4 md:px-6 md:py-3 px-4 py-2 ${workSans.className} text-black bg-white border-2 border-t-0 border-b-4 border-[#4DA2FF] text-lg font-semibold rounded-full`}
          >
            Claim Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Collectable;
