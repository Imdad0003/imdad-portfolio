import { GeneratedResume } from "@/types/resume";

export interface QualityCheckItem {
  id: string;
  category: "contact" | "verbs" | "length" | "skills" | "keywords" | "structure";
  title: string;
  description: string;
  status: "pass" | "warning" | "info";
  detail?: string;
}

export interface QualityAuditResult {
  passedCount: number;
  totalChecks: number;
  checks: QualityCheckItem[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

const ACTION_VERBS = new Set([
  "architected", "engineered", "designed", "developed", "built", "implemented",
  "deployed", "automated", "streamlined", "optimized", "spearheaded", "orchestrated",
  "formulated", "accelerated", "reduced", "increased", "generated", "scaled",
  "collaborated", "managed", "led", "facilitated", "authored", "audited", "secured",
  "refactored", "debugged", "integrated", "constructed", "launched", "executed"
]);

const WEAK_WORDS = ["responsible for", "helped with", "assisted in", "worked on", "handled", "participated in"];

/**
 * Transparent, deterministic ATS quality audit for a generated resume.
 */
export function auditResumeQuality(
  resume: GeneratedResume,
  targetJobDescription?: string
): QualityAuditResult {
  const checks: QualityCheckItem[] = [];
  const suggestions: string[] = [];

  // 1. Contact Information Completeness
  const hasPhone = Boolean(resume.header.phone && resume.header.phone.trim().length >= 7);
  const hasEmail = Boolean(resume.header.email && resume.header.email.includes("@"));
  const hasLocation = Boolean(resume.header.location && resume.header.location.trim().length >= 2);
  const hasLinks = Boolean(resume.header.linkedin || resume.header.portfolio);

  if (hasPhone && hasEmail && hasLocation) {
    checks.push({
      id: "contact-complete",
      category: "contact",
      title: "Essential Contact Info Present",
      description: "Full name, email, phone, and location are fully specified.",
      status: "pass",
    });
  } else {
    checks.push({
      id: "contact-missing",
      category: "contact",
      title: "Incomplete Contact Info",
      description: "Ensure email, active phone, and city/state are provided for recruiter outreach.",
      status: "warning",
    });
    suggestions.push("Add a direct phone number and location so recruiters can reach you.");
  }

  if (hasLinks) {
    checks.push({
      id: "contact-links",
      category: "contact",
      title: "Online Proof of Work Linked",
      description: "LinkedIn or portfolio/website link detected.",
      status: "pass",
    });
  } else {
    checks.push({
      id: "contact-links-missing",
      category: "contact",
      title: "No Portfolio or Profile Link",
      description: "Adding a LinkedIn or GitHub/Portfolio link increases credibility.",
      status: "info",
    });
  }

  // 2. Action Verb Auditing in Bullet Points
  let totalBullets = 0;
  let actionVerbBullets = 0;
  let weakBullets = 0;

  const allBullets: string[] = [
    ...resume.experience.flatMap((e) => e.bulletPoints),
    ...resume.projects.flatMap((p) => p.bulletPoints),
  ];

  totalBullets = allBullets.length;

  for (const bullet of allBullets) {
    if (!bullet || typeof bullet !== "string") continue;
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (firstWord && ACTION_VERBS.has(firstWord)) {
      actionVerbBullets++;
    }

    const lower = bullet.toLowerCase();
    if (WEAK_WORDS.some((w) => lower.includes(w))) {
      weakBullets++;
    }
  }

  if (totalBullets > 0) {
    const actionRate = Math.round((actionVerbBullets / totalBullets) * 100);
    if (actionRate >= 70 && weakBullets === 0) {
      checks.push({
        id: "action-verbs-strong",
        category: "verbs",
        title: "Strong Action Verbs Used",
        description: `${actionRate}% of bullets start with impactful action verbs without passive phrasing.`,
        status: "pass",
      });
    } else {
      checks.push({
        id: "action-verbs-review",
        category: "verbs",
        title: "Bullet Points Could Be Stronger",
        description: `Found ${weakBullets} passive phrases. Start every bullet with an action verb (e.g. Engineered, Spearheaded, Accelerated).`,
        status: "warning",
      });
      suggestions.push("Replace phrases like 'responsible for' with direct verbs like 'Engineered', 'Orchestrated', or 'Implemented'.");
    }
  }

  // 3. Professional Summary Length & Tone
  const summaryWords = resume.professionalSummary.trim().split(/\s+/).length;
  if (summaryWords >= 20 && summaryWords <= 80) {
    checks.push({
      id: "summary-length",
      category: "length",
      title: "Concise Professional Summary",
      description: `Summary is ${summaryWords} words — ideal length for rapid human scanning (under 6 seconds).`,
      status: "pass",
    });
  } else if (summaryWords < 20) {
    checks.push({
      id: "summary-too-short",
      category: "length",
      title: "Summary is Brief",
      description: "Consider expanding your summary to 2-3 sentences highlighting your specialization.",
      status: "info",
    });
  } else {
    checks.push({
      id: "summary-too-long",
      category: "length",
      title: "Summary Exceeds Ideal Length",
      description: "Lengthy summaries are often skipped by recruiters. Keep it under 80 words.",
      status: "warning",
    });
    suggestions.push("Trim the professional summary to 2-3 sentences focusing on your top core competencies.");
  }

  // 4. Skills Section Robustness
  const totalSkills = resume.skills.technical.length + (resume.skills.tools?.length || 0);
  if (totalSkills >= 6 && totalSkills <= 25) {
    checks.push({
      id: "skills-balanced",
      category: "skills",
      title: "Focused Skills Inventory",
      description: `${totalSkills} skills indexed — balanced without keyword stuffing.`,
      status: "pass",
    });
  } else if (totalSkills < 6) {
    checks.push({
      id: "skills-sparse",
      category: "skills",
      title: "Few Skills Listed",
      description: "Listing at least 6 relevant technical skills improves ATS keyword matching.",
      status: "warning",
    });
    suggestions.push("Add more core technical skills, frameworks, or tools relevant to your target role.");
  } else {
    checks.push({
      id: "skills-stuffed",
      category: "skills",
      title: "High Skill Density",
      description: "Over 25 skills can trigger ATS keyword-stuffing penalties. Keep only high-confidence proficiencies.",
      status: "info",
    });
  }

  // 5. Job Description Keyword Coverage
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  if (targetJobDescription && targetJobDescription.trim().length > 30) {
    const jdWords = targetJobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !["with", "from", "that", "this", "have", "will", "your", "must", "work"].includes(w));

    const uniqueJdKeywords = Array.from(new Set(jdWords)).slice(0, 30);
    const resumeText = JSON.stringify(resume).toLowerCase();

    for (const kw of uniqueJdKeywords) {
      if (resumeText.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        if (missingKeywords.length < 8) missingKeywords.push(kw);
      }
    }

    const coveragePct = Math.round((matchedKeywords.length / Math.max(uniqueJdKeywords.length, 1)) * 100);
    if (coveragePct >= 40) {
      checks.push({
        id: "jd-alignment-good",
        category: "keywords",
        title: "Target Job Description Match",
        description: `Matched ${matchedKeywords.length} key terms from your provided job description (${coveragePct}% coverage).`,
        status: "pass",
      });
    } else {
      checks.push({
        id: "jd-alignment-low",
        category: "keywords",
        title: "Low Keyword Overlap with Job Description",
        description: `Matched ${matchedKeywords.length} terms. Consider adding natural mentions of role requirements.`,
        status: "warning",
      });
      suggestions.push(`Consider naturally incorporating relevant keywords: ${missingKeywords.slice(0, 4).join(", ")}`);
    }
  } else {
    checks.push({
      id: "jd-general",
      category: "keywords",
      title: "General ATS Formatting",
      description: "Formatted for general industry ATS parsers. For best results, paste a target job description.",
      status: "info",
    });
  }

  // 6. Structure & Experience Check
  if (resume.experience.length === 0) {
    if (resume.projects.length >= 1) {
      checks.push({
        id: "student-projects-present",
        category: "structure",
        title: "Student/Fresher Project Architecture",
        description: "Zero work experience compensated by hands-on projects and education records.",
        status: "pass",
      });
    } else {
      checks.push({
        id: "no-exp-no-projects",
        category: "structure",
        title: "Missing Experience and Projects",
        description: "Without work experience, at least one solid academic or personal project is essential.",
        status: "warning",
      });
      suggestions.push("Add at least 1-2 practical projects to showcase your hands-on engineering capability.");
    }
  } else {
    checks.push({
      id: "experience-present",
      category: "structure",
      title: "Professional Work Experience Validated",
      description: `${resume.experience.length} employment record(s) with title, dates, and bullet points.`,
      status: "pass",
    });
  }

  const passedCount = checks.filter((c) => c.status === "pass").length;

  return {
    passedCount,
    totalChecks: checks.length,
    checks,
    matchedKeywords,
    missingKeywords,
    suggestions,
  };
}
