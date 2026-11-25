import type React from "react";
import {
  Video,
  ShoppingBag,
  Globe,
  Smartphone,
  Sparkles,
  Palette,
  Layers,
  Zap,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Compass,
  Target,
  Users,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

const ICON_REGISTRY: Record<string, React.ComponentType<{ className?: string }>> = {
  Video,
  ShoppingBag,
  Globe,
  Smartphone,
  Sparkles,
  Palette,
  Layers,
  Zap,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Compass,
  Target,
  Users,
  CheckCircle2,
  Briefcase,
};

export function resolveStudioIcon(
  name?: string,
  fallback: React.ComponentType<{ className?: string }> = Sparkles
): React.ComponentType<{ className?: string }> {
  if (!name) return fallback;
  return ICON_REGISTRY[name] || fallback;
}
