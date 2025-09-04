"use client";
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HashcaseText } from "../assets";
import ConnectButton from "./ConnectButton";
import { useGlobalAppStore } from "@/store/globalAppStore";

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  // Global store
  const { connectedWallets, getWalletForChain } = useGlobalAppStore();

  // Individual wallet hooks
  const currentAccount = useCurrentAccount(); // Sui wallet
  const { address: zkAddress } = useZkLogin(); // Sui zkLogin
  const { address: evmAddress } = useAccount(); // EVM wallet

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  // Determine which address to use for profile navigation
  const getProfileAddress = (): string | null => {
    // Priority: Sui wallet -> zkLogin -> EVM wallet
    return currentAccount?.address || zkAddress || evmAddress || null;
  };

  // Update display address when wallets change
  useEffect(() => {
    const profileAddress = getProfileAddress();

    if (profileAddress) {
      setDisplayAddress(
        profileAddress.slice(0, 6) + "..." + profileAddress.slice(-4)
      );
    } else {
      setDisplayAddress(null);
    }
  }, [currentAccount?.address, zkAddress, evmAddress]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    const profileAddress = getProfileAddress();

    if (profileAddress) {
      router.push(`/profile/${profileAddress}`);
      handleClose();
    } else {
      toast.error("Please connect your wallet to view your profile");
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleClose();
  };

  const navigationItems = [
    { label: "Home", path: "/" },
    { label: "Collections", path: "/collections" },
    { label: "Profile", onClick: handleProfileClick },
  ];

  return (
    <AppBar
      position="sticky"
      className="!bg-[#111827] backdrop-blur-md border-b border-white/10 shadow-lg"
    >
      <Container maxWidth="lg" className="px-4 sm:px-6 md:px-8 md:py-1">
        <Toolbar className="flex justify-between items-center min-h-14 sm:min-h-16 !px-0">
          {/* Logo */}
          <Box className="flex items-center">
            <Link href="/" className="flex items-center no-underline">
              <HashcaseText />
            </Link>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-lg">
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={item.onClick || (() => handleNavigation(item.path!))}
                  className="!text-white !font-medium !px-4 !py-1 !rounded-full !normal-case !transition-all !duration-300 hover:!bg-white/10 hover:backdrop-blur-md focus-visible:!outline-2 focus-visible:!outline-white/30"
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side controls */}
          <Box className="flex items-center gap-3">
            {/* Desktop Connect Button */}
            {!isMobile && <ConnectButton />}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                aria-controls="mobile-menu"
                aria-haspopup="true"
                onClick={handleMenu}
                className="!text-white hover:!bg-white/10"
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Menu */}
      <Menu
        id="mobile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          className:
            "!bg-slate-900/98 !backdrop-blur-xl !border-0 !rounded-none !shadow-2xl !shadow-black/50 !mt-0 !w-screen !max-w-none",
          style: {
            left: "0 !important",
            right: "0 !important",
            width: "100vw",
            maxWidth: "none",
            backgroundColor: "#00041F",
          },
        }}
        MenuListProps={{
          className: "!p-0",
        }}
      >
        <div className="px-4 sm:px-6 py-4 space-y-1">
          {navigationItems.map((item, index) => (
            <MenuItem
              key={item.label}
              onClick={item.onClick || (() => handleNavigation(item.path!))}
              className="!text-white !font-medium !py-3 !px-4 !rounded-lg !mx-0 !my-1 !transition-all !duration-200 hover:!bg-white/15 focus-visible:!outline-2 focus-visible:!outline-white/30"
            >
              {item.label}
            </MenuItem>
          ))}

          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4" />

          <div className="px-4 py-2">
            <ConnectButton />
          </div>
        </div>
      </Menu>
    </AppBar>
  );
};
