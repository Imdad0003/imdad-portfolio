import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/data/config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "IMDAD.BUILDS | Independent Digital Product Studio",
    template: "%s | IMDAD.BUILDS",
  },
  description:
    "Independent digital product studio building mobile apps, web applications, e-commerce engines, and high-retention media. Powered by imdad.builds.",
  keywords: [
    "IMDAD.BUILDS",
    "Imdad",
    "Product Studio",
    "Product Creator",
    "WishMusic",
    "WishTracking",
    "EasyXo",
    "Mobile App Development",
    "Next.js E-commerce",
    "Marketplace Listing Optimization",
    "Product Creative Design",
    "Video Editing",
    "Social Media Strategy",
  ],
  authors: [{ name: "IMDAD.BUILDS", url: siteConfig.siteUrl }],
  creator: "Imdad",
  publisher: "IMDAD.BUILDS",
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.siteUrl,
    siteName: "IMDAD.BUILDS",
    title: "IMDAD.BUILDS | Independent Digital Product Studio",
    description:
      "Independent digital product studio building mobile apps, web applications, e-commerce engines, and high-retention media. Powered by imdad.builds.",
    images: [
      {
        url: "/imdad-logo.png",
        width: 1024,
        height: 1024,
        alt: "IMDAD.BUILDS Studio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMDAD.BUILDS | Independent Digital Product Studio",
    description:
      "Independent digital product studio building mobile apps, web applications, e-commerce engines, and high-retention media.",
    images: ["/imdad-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "e1fmxKRzHnpgDmx5fh3Oylk7izJZUSPwzdcCkES3w10",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.siteUrl}/#organization`,
      "name": "IMDAD.BUILDS",
      "url": siteConfig.siteUrl,
      "logo": {
        "@type": "ImageObject",
        "@id": `${siteConfig.siteUrl}/#logo`,
        "url": `${siteConfig.siteUrl}/imdad-logo.png`,
        "contentUrl": `${siteConfig.siteUrl}/imdad-logo.png`,
        "caption": "IMDAD.BUILDS Studio Logo",
        "width": 1024,
        "height": 1024,
      },
      "image": `${siteConfig.siteUrl}/imdad-logo.png`,
      "sameAs": [
        "https://www.instagram.com/imdad.builds",
        "https://easyxo.in",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "imdad.builds@gmail.com",
        "telephone": "+91 7352608269",
        "contactType": "customer service",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.siteUrl}/#website`,
      "url": siteConfig.siteUrl,
      "name": "IMDAD.BUILDS",
      "description":
        "Independent digital product studio building mobile apps, web applications, e-commerce engines, and high-retention media. Powered by imdad.builds.",
      "publisher": {
        "@id": `${siteConfig.siteUrl}/#organization`,
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteConfig.siteUrl}/#service`,
      "name": "IMDAD.BUILDS",
      "url": siteConfig.siteUrl,
      "image": `${siteConfig.siteUrl}/imdad-logo.png`,
      "email": "imdad.builds@gmail.com",
      "telephone": "+91 7352608269",
      "priceRange": "$$",
      "description":
        "Independent digital product studio specializing in mobile apps, web applications, marketplace cataloging, product creatives, and digital storefronts.",
      "founder": {
        "@type": "Person",
        "name": "Imdad",
        "jobTitle": "Product Creator & Studio Founder",
        "sameAs": "https://www.instagram.com/imdad.builds",
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#F8FAFC",
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
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0A192F] selection:bg-[#0284C7]/20 selection:text-[#0284C7]">
        <ScrollProgress />
        <LiquidBackground />
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
