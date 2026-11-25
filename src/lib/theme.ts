import type React from "react";
import type { SettingsDocument, SiteThemeSettings } from "@/types/cms";

export interface ThemePresetDefinition {
  id: NonNullable<SiteThemeSettings["presetId"]>;
  name: string;
  description: string;
  backgroundColor: string;
  surfaceColor: string;
  sandColor: string;
  peachColor: string;
  accentColor: string;
  accentHoverColor: string;
  headingColor: string;
  bodyColor: string;
  borderColor: string;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: "warm-cream",
    name: "Warm Cream (Default)",
    description: "Soft cream paper, ivory cards & warm terracotta coral.",
    backgroundColor: "#FAF7F2",
    surfaceColor: "#FFFFFF",
    sandColor: "#F3ECE4",
    peachColor: "#FAECE4",
    accentColor: "#C96A50",
    accentHoverColor: "#B4583F",
    headingColor: "#332924",
    bodyColor: "#5F534D",
    borderColor: "#E8DFD5",
  },
  {
    id: "soft-sand",
    name: "Soft Sand & Amber",
    description: "Clean oat backdrop with warm honey-amber highlights.",
    backgroundColor: "#FAF6EF",
    surfaceColor: "#FFFFFF",
    sandColor: "#F2EADF",
    peachColor: "#F9EDDF",
    accentColor: "#B86B35",
    accentHoverColor: "#9E5828",
    headingColor: "#2F2620",
    bodyColor: "#5E524A",
    borderColor: "#E7DDD0",
  },
  {
    id: "rose-linen",
    name: "Rose Linen",
    description: "Warm porcelain cream with soft muted mauve-rose accents.",
    backgroundColor: "#FBF7F8",
    surfaceColor: "#FFFFFF",
    sandColor: "#F4ECEF",
    peachColor: "#F7E7EC",
    accentColor: "#9A5B6B",
    accentHoverColor: "#824958",
    headingColor: "#312328",
    bodyColor: "#5D4F54",
    borderColor: "#EBDCE2",
  },
  {
    id: "apricot-light",
    name: "Light Apricot",
    description: "Airy sunlit white-cream with warm apricot warmth.",
    backgroundColor: "#FDF9F5",
    surfaceColor: "#FFFFFF",
    sandColor: "#F6EDE5",
    peachColor: "#FCECE0",
    accentColor: "#D16D4A",
    accentHoverColor: "#B85838",
    headingColor: "#362922",
    bodyColor: "#63534A",
    borderColor: "#EDE0D5",
  },
];

export const FONT_PAIRING_OPTIONS: Array<{
  id: NonNullable<SiteThemeSettings["headingFont"]>;
  label: string;
  description: string;
}> = [
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans + DM Sans",
    description: "Clean modern studio typography (Recommended)",
  },
  {
    id: "dm-sans",
    label: "DM Sans Unified",
    description: "Friendly geometric look across headings and text",
  },
  {
    id: "system",
    label: "Native Crisp System Sans",
    description: "Instant zero-latency platform typography",
  },
];

export function buildThemeCssVariables(
  theme?: SiteThemeSettings,
  settings?: SettingsDocument
): React.CSSProperties {
  const preset =
    THEME_PRESETS.find((p) => p.id === theme?.presetId) || THEME_PRESETS[0];

  const bg = theme?.backgroundColor || preset.backgroundColor;
  const surface = theme?.surfaceColor || settings?.brandColors?.surface || preset.surfaceColor;
  const sand = theme?.sandColor || preset.sandColor;
  const peach = theme?.peachColor || preset.peachColor;
  const accent = theme?.accentColor || settings?.brandColors?.accent || preset.accentColor;
  const accentHover = theme?.accentHoverColor || preset.accentHoverColor;
  const heading = theme?.headingColor || settings?.brandColors?.primary || preset.headingColor;
  const body = theme?.bodyColor || preset.bodyColor;
  const border = theme?.borderColor || preset.borderColor;

  const headingFontChoice = theme?.headingFont || "plus-jakarta";
  const bodyFontChoice = theme?.bodyFont || "dm-sans";

  const displayFontCss =
    headingFontChoice === "dm-sans"
      ? "var(--font-dm-sans), -apple-system, sans-serif"
      : headingFontChoice === "system"
      ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      : "var(--font-jakarta), var(--font-dm-sans), -apple-system, sans-serif";

  const bodyFontCss =
    bodyFontChoice === "plus-jakarta"
      ? "var(--font-jakarta), -apple-system, sans-serif"
      : bodyFontChoice === "system"
      ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      : "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return {
    "--background": bg,
    "--surface-pure": surface,
    "--surface-sand": sand,
    "--surface-peach": peach,
    "--foreground": heading,
    "--ink-primary": heading,
    "--ink-body": body,
    "--accent-coral": accent,
    "--accent-coral-hover": accentHover,
    "--border-warm": border,
    "--font-display": displayFontCss,
    "--font-sans": bodyFontCss,
  } as React.CSSProperties;
}
