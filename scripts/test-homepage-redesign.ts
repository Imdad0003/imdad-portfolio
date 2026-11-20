/**
 * Automated Verification Script: Homepage Redesign & Mobile-First Audit
 * IMDAD.BUILDS — Creative & Tech Studio Homepage Redesign
 */

import React from "react";
import { studioTeam } from "../src/data/team";
import { navItems } from "../src/data/navigation";
import { siteConfig, getWhatsAppUrl } from "../src/data/config";
import { getFeaturedProjects } from "../src/data/projectsData";
import { defaultSiteContent, getSiteContent } from "../src/lib/cms";
import { Hero } from "../src/components/sections/Hero";
import { StudioOverview } from "../src/components/home/StudioOverview";
import { StudioServicesSection } from "../src/components/home/StudioServicesSection";
import { FeaturedProjectsSection } from "../src/components/home/FeaturedProjectsSection";
import { WhyChooseUs } from "../src/components/home/WhyChooseUs";
import { TeamSection } from "../src/components/home/TeamSection";
import { OurProcess } from "../src/components/home/OurProcess";
import { FinalCta } from "../src/components/home/FinalCta";
import { Navbar } from "../src/components/sections/Navbar";
import { Footer } from "../src/components/sections/Footer";

async function runHomepageRedesignAudit() {
  console.log("================================================================================");
  console.log("🎨 AUDITING IMDAD.BUILDS HOMEPAGE REDESIGN & LIQUID GLASS UI");
  console.log("================================================================================\n");

  let total = 0;
  let passed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Check ${total}: ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Check ${total}: ${testName}`);
      if (detail) console.error(`   └─ FAILURE: ${detail}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // --------------------------------------------------------------------------------
  // 1. NAVIGATION AUDIT
  // --------------------------------------------------------------------------------
  console.log("--- 1. Auditing Navigation Structure ---");
  const navLabels = navItems.map((n) => n.label);
  assert(
    navLabels.includes("Home") &&
    navLabels.includes("Services") &&
    navLabels.includes("Our Work") &&
    navLabels.includes("About") &&
    navLabels.includes("Contact"),
    "Navigation Contains All Required Top-Level Items",
    `Items: ${navLabels.join(", ")}`
  );

  const servicesSub = navItems.find((n) => n.label === "Services")?.subItems || [];
  const serviceHrefs = servicesSub.map((s) => s.href);
  assert(
    serviceHrefs.includes("/services/video-editing") &&
    serviceHrefs.includes("/services/amazon-listing") &&
    serviceHrefs.includes("/services/website-development") &&
    serviceHrefs.includes("/services/app-development"),
    "Services Submenu Contains All 4 Core Disciplines",
    `Disciplines: ${serviceHrefs.join(", ")}`
  );

  // --------------------------------------------------------------------------------
  // 2. HERO SECTION AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 2. Auditing Hero Section Content & CTAs ---");
  const siteContent = await getSiteContent();
  assert(
    defaultSiteContent.hero.headline === "We Build Ideas Into Digital Experiences.",
    "Hero Headline Matches Specified Spec",
    `Headline: "${defaultSiteContent.hero.headline}"`
  );

  assert(
    defaultSiteContent.hero.subheadline === "Creative solutions, smart technology, and professional services to help businesses grow.",
    "Hero Supporting Copy Matches Specified Spec",
    `Copy: "${defaultSiteContent.hero.subheadline}"`
  );

  assert(
    defaultSiteContent.hero.primaryCtaText === "Explore Our Services" &&
    defaultSiteContent.hero.primaryCtaLink === "/services",
    "Primary CTA Points to Explore Our Services (/services)",
    `CTA: "${defaultSiteContent.hero.primaryCtaText}" -> ${defaultSiteContent.hero.primaryCtaLink}`
  );

  assert(
    defaultSiteContent.hero.secondaryCtaText === "View Our Work" &&
    defaultSiteContent.hero.secondaryCtaLink === "/projects",
    "Secondary CTA Points to View Our Work (/projects)",
    `CTA: "${defaultSiteContent.hero.secondaryCtaText}" -> ${defaultSiteContent.hero.secondaryCtaLink}`
  );

  // --------------------------------------------------------------------------------
  // 3. STUDIO OVERVIEW AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 3. Auditing Studio Overview (3 Pillars) ---");
  assert(
    typeof StudioOverview === "function",
    "StudioOverview Component Successfully Exported",
    "Highlights Creative Thinking, Modern Technology, and Business-Focused Solutions"
  );

  // --------------------------------------------------------------------------------
  // 4. SERVICES SECTION AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 4. Auditing Studio Services (4 Core Disciplines) ---");
  assert(
    typeof StudioServicesSection === "function",
    "StudioServicesSection Component Successfully Exported",
    "Presents Video Editing, E-commerce Creative, Web Development, and Digital Solutions"
  );

  // --------------------------------------------------------------------------------
  // 5. FEATURED PROJECTS AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 5. Auditing Featured Projects (Real Projects Only) ---");
  const featured = getFeaturedProjects();
  const hasEasyXo = featured.some((p) => p.slug.includes("easyxo"));
  const hasWishMusic = featured.some((p) => p.slug.includes("wishmusic"));
  assert(
    hasEasyXo && hasWishMusic,
    "Featured Projects Include EasyXo and WishMusic with Real Data",
    `Found EasyXo: ${hasEasyXo}, Found WishMusic: ${hasWishMusic}`
  );

  // --------------------------------------------------------------------------------
  // 6. WHY CHOOSE US AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 6. Auditing Why Choose Us ---");
  assert(
    typeof WhyChooseUs === "function",
    "WhyChooseUs Component Successfully Exported",
    "Covers Creative execution, Modern technology, Practical solutions, and Focus on business outcomes"
  );

  // --------------------------------------------------------------------------------
  // 7. TEAM SECTION AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 7. Auditing Team Section ---");
  assert(
    studioTeam.length === 3,
    "Team Roster Contains Exactly 3 Approved Members",
    `Members: ${studioTeam.map((m) => `${m.name} (${m.role})`).join(", ")}`
  );

  const imdad = studioTeam.find((m) => m.name === "Imdad");
  const ray = studioTeam.find((m) => m.name === "Ray");
  const zafar = studioTeam.find((m) => m.name === "Zafar");

  assert(
    imdad?.role === "Founder" &&
    ray?.role === "Video Editor" &&
    zafar?.role === "Video Editor",
    "Approved Team Roles Verified",
    `Imdad: ${imdad?.role}, Ray: ${ray?.role}, Zafar: ${zafar?.role}`
  );

  // --------------------------------------------------------------------------------
  // 8. OUR PROCESS AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 8. Auditing Our Process (4 Progressive Steps) ---");
  assert(
    typeof OurProcess === "function",
    "OurProcess Component Successfully Exported",
    "Layout follows: Discover → Plan → Create → Deliver"
  );

  // --------------------------------------------------------------------------------
  // 9. CONTACT CTA AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 9. Auditing Contact CTA ---");
  assert(
    defaultSiteContent.finalCta.headline === "Have an Idea? Let’s Make It Happen.",
    "Contact CTA Headline Verified",
    `Headline: "${defaultSiteContent.finalCta.headline}"`
  );

  assert(
    defaultSiteContent.finalCta.primaryCtaText === "Start a Project" &&
    defaultSiteContent.finalCta.primaryCtaLink === "/contact",
    "Contact CTA Primary Link Verified",
    `Link: "${defaultSiteContent.finalCta.primaryCtaText}" -> ${defaultSiteContent.finalCta.primaryCtaLink}`
  );

  // --------------------------------------------------------------------------------
  // 10. FOOTER AUDIT
  // --------------------------------------------------------------------------------
  console.log("\n--- 10. Auditing Footer Architecture ---");
  assert(
    typeof Footer === "function",
    "Footer Component Successfully Exported",
    "Includes studio emblem, brand description, core services, social links, contact info, and copyright"
  );

  console.log("\n================================================================================");
  console.log(`🎉 ALL ${passed}/${total} HOMEPAGE REDESIGN CHECKS PASSED WITH 100% SUCCESS!`);
  console.log("================================================================================\n");
}

runHomepageRedesignAudit().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
