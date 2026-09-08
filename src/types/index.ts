export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceCategory {
  id: string;
  categoryNumber: string;
  title: string;
  tagline: string;
  description: string;
  services: string[];
  deliverables?: string[];
  iconName: string;
}

export interface BusinessSetupItem {
  id: string;
  title: string;
  description: string;
  scope: string[];
  disclaimer?: string;
  iconName: string;
}

export interface SkillGroup {
  category: string;
  description: string;
  iconName: string;
  skills: string[];
}

export type PortfolioCategory =
  | "All"
  | "E-commerce"
  | "Product Creatives"
  | "Websites"
  | "Ads"
  | "Videos"
  | "Branding";

export interface PortfolioProject {
  id: string;
  title: string;
  category: PortfolioCategory;
  tagline: string;
  description: string;
  scope: string[];
  tools: string[];
  imagePlaceholderText: string;
  imageAspect?: string;
  linkText?: string;
  highlight?: string;
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  status: "active" | "placeholder";
  note?: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  summary: string;
  details: string[];
}

export interface WhyMePoint {
  number: string;
  title: string;
  description: string;
  highlight: string;
}

export interface ClientType {
  title: string;
  description: string;
  keyNeeds: string[];
  iconName: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}
