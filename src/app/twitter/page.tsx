// "use client";
// import axios from "axios";
// import React, { useState } from "react";
// import { TwitterApi } from "twitter-api-v2";

// const FollowTwitterButton = () => {
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [pointsAdded, setPointsAdded] = useState(false);

//   // Replace with your Twitter API credentials
//   const client = new TwitterApi({
//     appKey: process.env.NEXT_PUBLIC_YOUR_APP_KEY,
//     appSecret: process.env.NEXT_PUBLIC_YOUR_APP_SECRET,
//     // accessToken: process.env.NEXT_PUBLIC_USER_ACCESS_TOKEN,
//     // accessSecret: process.env.NEXT_PUBLIC_USER_ACCESS_SECRET,
//   });

//   // Replace with your Twitter username
//   const YOUR_TWITTER_USERNAME = "hash_case";

//   // Redirect to your Twitter page
//   const redirectToTwitter = () => {
//     window.open(`https://twitter.com/${YOUR_TWITTER_USERNAME}`, "_blank");
//   };

//   // Check if the user is following your Twitter account
//   const checkIfFollowing = async () => {
//     try {
//       // Get the user's ID (you might need to authenticate the user first)
//       const { data: user } = await axios.get("/api/twitter");

//       console.log(user);

//       // // Check if the user is following your account
//       // const { data: following } = await client.v2.following(user.id, {
//       //   max_results: 100,
//       // });

//       // const isFollowingYou = following.some(
//       //   (account) => account.username === YOUR_TWITTER_USERNAME
//       // );

//       // if (isFollowingYou) {
//       //   setIsFollowing(true);
//       //   addLoyaltyPoints();
//       // } else {
//       //   setIsFollowing(false);
//       // }
//     } catch (error) {
//       console.error("Error checking follow status:", error);
//     }
//   };

//   // Add loyalty points to the user's account
//   const addLoyaltyPoints = () => {
//     if (!pointsAdded) {
//       // Call your backend API to add loyalty points
//       console.log("Adding 10 loyalty points to the user.");
//       setPointsAdded(true);
//     }
//   };

//   return (
//     <div className="h-[400px] w-[80%] mx-auto py-20">
//       <button
//         className="px-2 py-1 rounded-sm bg-slate-500 border-slate-700"
//         onClick={redirectToTwitter}
//       >
//         Follow Us on Twitter
//       </button>
//       <button
//         className="px-2 py-1 rounded-sm bg-slate-500 border-slate-700"
//         onClick={checkIfFollowing}
//         style={{ marginLeft: "10px" }}
//       >
//         Check Follow Status
//       </button>

//       {isFollowing && (
//         <p>Thanks for following us! You earned 10 loyalty points.</p>
//       )}
//       {!isFollowing && <p>Follow us on Twitter to earn loyalty points.</p>}
//     </div>
//   );
// };

// export default FollowTwitterButton;
