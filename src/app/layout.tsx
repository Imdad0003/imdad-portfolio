import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  metadataBase: new URL("https://imdad.dev"),
  title: "Imdad — E-commerce Entrepreneur & Digital Business Specialist",
  description:
    "Imdad builds and grows e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing. Founder of EasyXo.",
  keywords: [
    "Imdad",
    "EasyXo",
    "E-commerce Entrepreneur",
    "Amazon Seller Specialist",
    "Flipkart Listing Expert",
    "Meesho Listing",
    "Product Creative Designer",
    "Digital Marketing",
    "UGC Ads",
    "E-commerce Consultant India",
  ],
  authors: [{ name: "Imdad" }],
  creator: "Imdad",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://imdad.dev",
    siteName: "Imdad Portfolio",
    title: "Imdad — E-commerce Entrepreneur & Digital Business Specialist",
    description:
      "I build and grow e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing.",
    images: [
      {
        url: "/images/og/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Imdad — E-commerce Entrepreneur & Digital Business Specialist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imdad — E-commerce Entrepreneur & Digital Business Specialist",
    description:
      "I build and grow e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing.",
    images: ["/images/og/og-cover.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F4E9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8F4E9] text-[#180D1D] selection:bg-[#935073]/20 selection:text-[#502D55]">
        <ScrollProgress />
        <LiquidBackground />
        <CursorGlow />
        <Navbar />
        <div className="flex-1 flex flex-col relative z-10 pt-16 sm:pt-20">
          {children}
        </div>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
