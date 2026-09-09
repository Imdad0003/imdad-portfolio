export const siteConfig = {
  name: "Imdad Digital Studio",
  shortName: "Imdad",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://imdad-portfolio-imdad0003.vercel.app"),
  role: "E-commerce Entrepreneur & Digital Business Specialist",
  tagline: "I build and grow e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing.",
  shortTagline: "BUILD • CREATE • SCALE",
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
    whatsappMessage: "Hi Imdad, I came across your website and would like to discuss a project for my business.",
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
