import axiosInstance from "./axios";

const getUploadUrl = async (): Promise<string> => {
  try {
    const response = await axiosInstance.get("/platform/sui/profile/upload");
    const url = response.data.uploadURL; // Make sure this is the correct key
    if (!url) {
      throw new Error("uploadURL not found in response");
    }
    console.log("Received pre-signed URL:", url);
    return url;
  } catch (error) {
    console.error("Error getting upload URL:", error);
    alert("Failed to get upload URL");
    throw error;
  }
};

export { getUploadUrl };
