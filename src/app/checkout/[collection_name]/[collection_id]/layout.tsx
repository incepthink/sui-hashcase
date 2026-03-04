"use client";

import { CartProvider } from "@/context/CartContext";

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
