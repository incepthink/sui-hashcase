import React from "react";
import Image from "next/image";
import { MdEdit } from "react-icons/md";
import ConnectButton from "@/components/ConnectButton";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

interface ProfileLayoutProps {
  userData: {
    profile_image: string;
    banner_image: string;
    username: string;
    description: string;
  };
  isOwnProfile: boolean;
  onEditProfile: () => void;
  onShareProfile: () => void;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  userData,
  isOwnProfile,
  onEditProfile,
  onShareProfile,
}) => {
  return (
    <>
      {/* Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            userData.banner_image || backgroundImageHeroSection.src
          })`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>
      </div>

      {isOwnProfile ? (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white z-20">
            <Image
              src={
                userData.profile_image ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={onEditProfile}
              className="flex items-center text-white text-sm font-medium hover:underline"
            >
              Edit Profile
              <MdEdit className="ml-1 text-blue-400 text-lg" />
            </button>
            <button
              onClick={onShareProfile}
              className="flex items-center text-white text-sm font-medium hover:underline"
            >
              Share Profile
              <svg
                className="ml-1 w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342A3 3 0 109 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white z-20">
            <Image
              src={
                userData.profile_image ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
            <p className="text-white/60 text-sm mt-2">Public Profile</p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <ConnectButton />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileLayout;
