const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://imdad-portfolio-three.vercel.app";

export const siteConfig = {
  name: "IMDAD.BUILDS",
  studioName: "Imdad.builds",
  shortName: "Imdad",
  siteUrl: rawSiteUrl.replace(/\/+$/, ""),
  role: "Product Creator & Digital Studio Builder",
  tagline: "Building digital products, apps & experiences.",
  subTagline: "Independent product lab building mobile apps, web applications, e-commerce systems, and high-impact digital experiences.",
  shortTagline: "BUILD • CREATE • SCALE",
  poweredBy: "Powered by imdad.builds",
  brand: "EasyXo",
  easyxo: {
    name: "EasyXo",
    website: "https://easyxo.in",
    instagramHandle: "@easyxo_official",
    instagramUrl: "https://www.instagram.com/easyxo_official",
    description: "An e-commerce brand built and operated by Imdad.",
  },
  contact: {
    email: "imdad.builds@gmail.com",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91 7352608269",
    whatsappDisplay: "+91 7352608269",
    whatsappMessage: "Hi Imdad, I came across imdad.builds and would like to discuss building a project with your studio.",
    instagramHandle: "@imdad.builds",
    instagramUrl: "https://www.instagram.com/imdad.builds",
  },
  links: {
    instagram: "https://www.instagram.com/imdad.builds",
    email: "mailto:imdad.builds@gmail.com",
    whatsapp: "https://wa.me/917352608269",
    easyxo: "https://easyxo.in",
    easyxoInstagram: "https://www.instagram.com/easyxo_official",
  },
};

export function getWhatsAppUrl(customMessage?: string) {
  const phone = (siteConfig.contact.whatsappNumber || "+91 7352608269").replace(/[^0-9]/g, "");
  const message = customMessage !== undefined ? customMessage : siteConfig.contact.whatsappMessage;
  if (message) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${phone}`;
}
