import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import clsx from "clsx";
import "../globals.css";
import { TanstackProvider } from "@/components/TanstackProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SnackbarProvider } from "@/providers/SnackbarProvider";
import WalletConnectionModal from "@/components/WalletConnectionModal";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quests - Sui Hashcase",
  description: "Complete quests to earn loyalty points",
};

export default function QuestsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={clsx(dmSans.className, "antialiased")}>
      <TanstackProvider>
        <SnackbarProvider>
          {children}
          <WalletConnectionModal />
          <ToastContainer />
        </SnackbarProvider>
      </TanstackProvider>
    </div>
  );
}
