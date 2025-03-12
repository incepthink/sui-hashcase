// import { TwitterApi } from "twitter-api-v2";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const client = new TwitterApi({
//     appKey: process.env.NEXT_PUBLIC_YOUR_APP_KEY,
//     appSecret: process.env.NEXT_PUBLIC_YOUR_APP_SECRET,
//     // accessToken: process.env.NEXT_PUBLIC_USER_ACCESS_TOKEN,
//     // accessSecret: process.env.NEXT_PUBLIC_USER_ACCESS_SECRET,
//   });

//   try {
//     // Example: Get the authenticated user's details
//     // const { data: user } = await client.v2.me();
//     // return NextResponse.json({ user }, { status: 200 });

//     const appOnlyClientFromConsumer = await client.appLogin();

//     console.log(appOnlyClientFromConsumer);
//     return NextResponse.json({ appOnlyClientFromConsumer });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch user data" },
//       { status: 500 }
//     );
//   }
// }
