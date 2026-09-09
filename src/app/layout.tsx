import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/data/config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Imdad Digital Studio | E-commerce, Websites & Digital Solutions",
    template: "%s | Imdad Digital Studio",
  },
  description:
    "Imdad Digital Studio helps businesses build and grow online with e-commerce solutions, marketplace listings, product creatives, websites, social media, AI services and more.",
  keywords: [
    "Imdad Digital Studio",
    "Imdad",
    "EasyXo",
    "E-commerce Specialist India",
    "Amazon Listing Optimization",
    "Flipkart Product Listing",
    "Meesho Cataloging",
    "Product Creative Design",
    "Shopify Store Development",
    "Next.js E-commerce",
    "Meta Ads Creatives",
    "UGC Reel Ads",
  ],
  authors: [{ name: "Imdad Digital Studio", url: siteConfig.siteUrl }],
  creator: "Imdad",
  publisher: "Imdad Digital Studio",
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.siteUrl,
    siteName: "Imdad Digital Studio",
    title: "Imdad Digital Studio | E-commerce, Websites & Digital Solutions",
    description:
      "Imdad Digital Studio helps businesses build and grow online with e-commerce solutions, marketplace listings, product creatives, websites, social media, AI services and more.",
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
    title: "Imdad Digital Studio | E-commerce, Websites & Digital Solutions",
    description:
      "Imdad Digital Studio helps businesses build and grow online with e-commerce solutions, marketplace listings, product creatives, websites, social media, AI services and more.",
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
    google: "e1fmxKRzHnpgDmx5fh3Oylk7izJZUSPwzdcCkES3w10",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.siteUrl}/#organization`,
      "name": "Imdad Digital Studio",
      "url": siteConfig.siteUrl,
      "logo": {
        "@type": "ImageObject",
        "@id": `${siteConfig.siteUrl}/#logo`,
        "url": `${siteConfig.siteUrl}/imdad-logo.png`,
        "contentUrl": `${siteConfig.siteUrl}/imdad-logo.png`,
        "caption": "Imdad Digital Studio Logo",
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
      "name": "Imdad Digital Studio",
      "description":
        "Imdad Digital Studio helps businesses build and grow online with e-commerce solutions, marketplace listings, product creatives, websites, social media, AI services and more.",
      "publisher": {
        "@id": `${siteConfig.siteUrl}/#organization`,
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteConfig.siteUrl}/#service`,
      "name": "Imdad Digital Studio",
      "url": siteConfig.siteUrl,
      "image": `${siteConfig.siteUrl}/imdad-logo.png`,
      "email": "imdad.builds@gmail.com",
      "telephone": "+91 7352608269",
      "priceRange": "$$",
      "description":
        "Digital studio specializing in e-commerce listings, product creatives, high-converting websites, and growth marketing.",
      "founder": {
        "@type": "Person",
        "name": "Imdad",
        "jobTitle": "Founder & Digital Specialist",
        "sameAs": "https://www.instagram.com/imdad.builds",
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
