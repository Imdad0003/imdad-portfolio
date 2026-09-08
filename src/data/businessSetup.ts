import { BusinessSetupItem } from "@/types";

export const businessSetupItems: BusinessSetupItem[] = [
  {
    id: "marketplace-onboarding",
    title: "Marketplace Seller Onboarding Assistance",
    description:
      "Step-by-step guidance through Amazon Seller Central, Flipkart Seller Hub, and Meesho Supplier Panel registration, document uploads, bank verification, and initial warehouse configurations.",
    scope: [
      "Seller account registration navigation",
      "Bank account & pickup address verification support",
      "Shipping setting & warehouse profile setup",
      "First catalog upload readiness check",
    ],
    iconName: "ShoppingBag",
  },
  {
    id: "gst-assistance",
    title: "GST Registration Assistance",
    description:
      "Hands-on documentation organization and portal application support for entrepreneurs preparing their Goods & Services Tax (GST) application for e-commerce selling.",
    scope: [
      "Required document checklist preparation (identity, address, bank)",
      "Portal profile drafting & form entry assistance",
      "Application status tracking support",
      "Post-approval marketplace profile linking",
    ],
    iconName: "FileCheck",
    disclaimer:
      "Operational filing guidance only. Not legal or chartered accountant tax advisory.",
  },
  {
    id: "udyam-assistance",
    title: "Udyam Registration Assistance",
    description:
      "Support with MSME / Udyam portal registration for small enterprises and sole proprietors to access government MSME benefits, priority lending, and trade support.",
    scope: [
      "Eligibility checklist & Aadhaar linkage verification",
      "NIC classification & activity code selection guidance",
      "Online portal submission walkthrough",
      "Certificate download and record keeping",
    ],
    iconName: "ShieldCheck",
    disclaimer: "Administrative filing assistance only.",
  },
  {
    id: "trademark-support",
    title: "Trademark Search & Application Assistance",
    description:
      "Preliminary trademark availability research on the IP India public database and assistance with trademark class mapping and filing preparation for brand registry.",
    scope: [
      "IP India public portal phonetics and wordmark search",
      "Nice classification (Class 3, 5, 25, 35, etc.) mapping",
      "Application documentation & logo spec organization",
      "Amazon Brand Registry prerequisite alignment",
    ],
    iconName: "Award",
    disclaimer:
      "Preliminary search & operational guidance only. Not formal legal opinion or attorney representation.",
  },
  {
    id: "documentation-guidance",
    title: "Documentation & Business Setup Guidance",
    description:
      "Structured organization of founding business files, brand invoice formats, packaging declarations, and digital records required to sell smoothly online.",
    scope: [
      "Business bank account checklist preparation",
      "Product labeling & packaging mandatory declaration guidelines",
      "Brand invoice template formatting",
      "Digital records & seller compliance checklist",
    ],
    iconName: "FolderKanban",
  },
];
