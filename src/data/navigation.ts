export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  subItems?: { label: string; href: string; description?: string }[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    subItems: [
      { label: "Video Editing", href: "/services/video-editing", description: "Reels, Shorts, YouTube videos & commercial ads" },
      { label: "E-commerce Creative", href: "/services/amazon-listing", description: "Amazon listing images, product creatives & A+ content" },
      { label: "Web Development", href: "/services/website-development", description: "Business websites, web applications & digital platforms" },
      { label: "Digital Solutions", href: "/services/app-development", description: "Custom digital tools & technology solutions" },
    ],
  },
  { label: "Our Work", href: "/projects" },
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
