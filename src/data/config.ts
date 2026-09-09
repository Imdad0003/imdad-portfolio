export const siteConfig = {
  name: "Imdad",
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
    email: "imdad.ecommerce@gmail.com",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    whatsappDisplay: "+91 (WhatsApp Inquiry)",
    whatsappMessage: "Hi Imdad, I came across your website and would like to discuss a project for my business.",
    instagramHandle: "@imdad.builds",
    instagramUrl: "https://www.instagram.com/imdad.builds",
  },
  links: {
    instagram: "https://www.instagram.com/imdad.builds",
    email: "mailto:imdad.ecommerce@gmail.com",
    easyxo: "https://easyxo.in",
    easyxoInstagram: "https://www.instagram.com/easyxo_official",
  },
};

export function getWhatsAppUrl(customMessage?: string) {
  const phone = siteConfig.contact.whatsappNumber;
  const msg = encodeURIComponent(customMessage || siteConfig.contact.whatsappMessage);
  if (phone) {
    return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`;
  }
  return `https://wa.me/?text=${msg}`;
}
