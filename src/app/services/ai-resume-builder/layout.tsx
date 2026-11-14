import { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "AI Resume Builder | Free ATS-Optimized Resumes | IMDAD.BUILDS",
  description:
    "Generate professional, ATS-friendly resumes engineered with Google Gemini 4 Hydrogen. Designed for students, freshers, and experienced professionals. 100% Free in Beta with selectable vector PDF export.",
  keywords: [
    "AI Resume Builder",
    "ATS Resume Generator",
    "Gemini AI Resume",
    "Free Resume Builder",
    "Fresher Resume Maker",
    "Student CV Builder",
    "ATS Friendly Templates",
    "IMDAD.BUILDS Resume",
  ],
  alternates: {
    canonical: `${siteConfig.siteUrl}/services/ai-resume-builder`,
  },
  openGraph: {
    title: "AI Resume Builder | Free ATS-Optimized Resumes | IMDAD.BUILDS",
    description:
      "Generate professional, ATS-friendly resumes engineered with Google Gemini 4 Hydrogen. High-impact action bullet points, zero hallucinations, instant PDF export.",
    url: `${siteConfig.siteUrl}/services/ai-resume-builder`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
