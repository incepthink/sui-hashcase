"use client";
import axiosInstance from "@/utils/axios";
import React, { useEffect } from "react";

// Define a type for the returned position
type Coordinates = {
  latitude: number;
  longitude: number;
};

const Page = () => {
  // Promisified version of getCurrentPosition
  function useCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: GeolocationPositionError) => {
          reject(error);
        }
      );
    });
  }

  async function getUserLocation() {
    try {
      const { latitude, longitude } = await useCurrentPosition();
      const response = await axiosInstance("/platform/collections/geo-fenced", {
        params: {
          user_lat: latitude,
          user_lon: longitude,
          owner_id: 2,
        },
      });
      console.log(response);
    } catch (error: unknown) {
      console.error("Geolocation Error", error);
    }
  }

  useEffect(() => {
    getUserLocation();
  }, []);

  return <div>page</div>;
};

export default Page;
