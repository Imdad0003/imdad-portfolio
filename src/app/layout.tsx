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
        url: "/imdad-logo.png",
        width: 1024,
        height: 1024,
        alt: "Imdad Digital Studio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imdad — E-commerce Entrepreneur & Digital Business Specialist",
    description:
      "I build and grow e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing.",
    images: ["/imdad-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/imdad-logo.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://imdad.dev/#organization",
      "name": "Imdad Digital Studio",
      "url": "https://imdad.dev",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://imdad.dev/#logo",
        "url": "https://imdad.dev/imdad-logo.png",
        "contentUrl": "https://imdad.dev/imdad-logo.png",
        "caption": "Imdad Digital Studio Logo",
        "width": 1024,
        "height": 1024,
      },
      "image": "https://imdad.dev/imdad-logo.png",
      "sameAs": [
        "https://www.instagram.com/imdad.builds",
        "https://easyxo.in",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "imdad.builds@gmail.com",
        "telephone": "+91 7352608269",
        "contactType": "customer support",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://imdad.dev/#website",
      "url": "https://imdad.dev",
      "name": "Imdad Digital Studio",
      "description":
        "Imdad builds and grows e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing.",
      "publisher": {
        "@id": "https://imdad.dev/#organization",
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#F8F4E9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
