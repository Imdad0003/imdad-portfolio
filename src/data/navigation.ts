export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  subItems?: { label: string; href: string; description?: string }[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Apps",
    href: "/apps",
    badge: "Lab",
    subItems: [
      { label: "New Apps", href: "/apps#new-apps", description: "Currently launching & in development" },
      { label: "All Apps", href: "/apps#all-apps", description: "Complete digital product catalog" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    subItems: [
      { label: "01 Website Development", href: "/services/website-development", description: "Business sites, landing pages & custom web" },
      { label: "02 App Development", href: "/services/app-development", description: "Cross-platform mobile apps & web applications" },
      { label: "03 E-commerce", href: "/services/ecommerce", description: "Marketplace cataloging & D2C storefronts" },
      { label: "04 Video Editing", href: "/services/video-editing", description: "Reels, Shorts, product demos & UGC ads" },
      { label: "05 Social Media", href: "/services/social-media", description: "Content planning, strategy & post creative" },
      { label: "06 AI Resume Builder", href: "/services/ai-resume-builder", description: "ATS-friendly AI resume creator (Free Beta)" },
    ],
  },
  { label: "Projects", href: "/projects" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const companyNavItems: { label: string; href: string }[] = [
  { label: "About Studio", href: "/about" },
  { label: "Projects & Work", href: "/projects" },
  { label: "Pricing Packages", href: "/pricing" },
  { label: "Client Reviews", href: "/reviews" },
  { label: "Direct Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export const legalNavItems: { label: string; href: string }[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
];
