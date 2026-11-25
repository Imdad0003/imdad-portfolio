export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  subItems?: { label: string; href: string; description?: string; badge?: string }[];
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    subItems: [
      {
        label: "Video Editing",
        href: "/services/video-editing",
        description: "Reels, YouTube videos & promo ads",
      },
      {
        label: "Amazon & Product Images",
        href: "/services/amazon-listing",
        description: "Product photos, infographics & A+ pages",
      },
      {
        label: "Websites & Stores",
        href: "/services/website-development",
        description: "Business websites & online stores",
      },
      {
        label: "Apps & Custom Tools",
        href: "/services/app-development",
        description: "Mobile apps & business utilities",
      },
      {
        label: "AI Resume Builder",
        href: "/services/ai-resume-builder",
        description: "Create a clean job resume in minutes",
        badge: "Tool",
      },
    ],
  },
  { label: "Work", href: "/projects" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export const companyNavItems: { label: string; href: string }[] = [
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/projects" },
  { label: "Pricing", href: "/pricing" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export const legalNavItems: { label: string; href: string }[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
];
