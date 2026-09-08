import React from "react";
import {
  Store,
  Sparkles,
  Video,
  Globe,
  Share2,
  TrendingUp,
  Cpu,
  ShoppingBag,
  Zap,
  Tag,
  Building,
  Rocket,
  MapPin,
  Camera,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Award,
  FolderKanban,
  Palette,
  CheckCircle2,
  Layers,
  ArrowRight,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  LucideProps,
} from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Store,
  Sparkles,
  Video,
  Globe,
  Share2,
  TrendingUp,
  Cpu,
  ShoppingBag,
  Zap,
  Tag,
  Building,
  Rocket,
  MapPin,
  Camera,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Award,
  FolderKanban,
  Palette,
  CheckCircle2,
  Layers,
  ArrowRight,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
};

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = iconMap[name] || Sparkles;
  return <IconComponent {...props} />;
}
