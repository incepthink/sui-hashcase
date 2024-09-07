"use client";
import { Work_Sans } from "next/font/google";
import React from "react";

const workSans = Work_Sans({ subsets: ["latin"] });

const Collectable = () => {
  return (
    <div className="bg-[#00041F] h-[60vh] px-[100px]">
      <div className="container">
        <div className="flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-[20px] px-12 py-6">
          <div className="my-4">
            <h1
              className={`${workSans.className} text-white text-4xl font-bold my-2`}
            >
              Claim a Free Digital Collectable
            </h1>
            <p className={`${workSans.className} text-white text-[16px] my-2`}>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi
            </p>
          </div>
          <button
            className={`my-4 px-6 py-3 ${workSans.className} text-black bg-white border-2 border-t-0 border-b-4 border-[#4DA2FF] text-lg font-semibold rounded-full`}
          >
            Claim Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Collectable;
