import { useState } from "react";
import axios from "axios";
import axiosInstance from "@/utils/axios";

interface UserData {
  username: string;
  description: string;
  profile_image: string;
  banner_image: string;
}

interface ProfileModalProps {
  userData: UserData;
  onClose: () => void;
  onUpdate: () => void;
}

const UpdateProfileModal = ({
  userData,
  onClose,
  onUpdate,
}: ProfileModalProps) => {
  const [formData, setFormData] = useState<UserData>({
    username: userData.username || "",
    description: userData.description || "",
    profile_image: userData.profile_image || "",
    banner_image: userData.banner_image || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/user", formData);
      onUpdate();
      onClose();
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] rounded-lg shadow-xl w-full max-w-md p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-500 text-white rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Image URL
              </label>
              <input
                type="url"
                name="profile_image"
                value={formData.profile_image}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                name="banner_image"
                value={formData.banner_image}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
