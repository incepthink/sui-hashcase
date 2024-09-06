"use client";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ProductShowcase } from "@/components/ProductShowcase";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricingdemo";
import ExploreSection from "@/components/ExploreSection";
import "@mysten/dapp-kit/dist/index.css";

export default function Home() {
  return (
    <>
      <div className="overflow-x-hidden">
        <Navbar />
        <Hero />
        <Features />
        <ProductShowcase />
        <ExploreSection />
        <Pricing />
        <CallToAction />
      </div>
      <Footer />
    </>
  );
}
