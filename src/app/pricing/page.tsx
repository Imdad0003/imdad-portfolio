import { Pricing } from "@/components/sections/Pricing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Packages — Imdad",
  description:
    "Transparent starting rates and deliverables for marketplace listings, product creatives, websites, and growth marketing. Build a custom package online.",
};

export default function PricingPage() {
  return (
    <div className="py-4 sm:py-8">
      <Pricing />
    </div>
  );
}
