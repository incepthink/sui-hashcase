import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import clsx from "clsx";
import "./globals.css";
import { TanstackProvider } from "@/components/TanstackProvider";
import { Navbar } from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sui Hashcase",
  description: "Mint a unique digital asset on the Sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanstackProvider>
      <html lang="en">
        <body className={clsx(dmSans.className, "antialiased")}>
          <ToastContainer />
          <Navbar />
          {children}
        </body>
      </html>
    </TanstackProvider>
  );
}
