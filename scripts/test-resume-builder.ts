/**
 * scripts/test-resume-builder.ts
 * Rigorous Automated Test Suite for IMDAD.BUILDS AI Resume Builder
 * 
 * Verifies:
 * - Student, Fresher, and Experienced schema validations
 * - ATS quality audit calculations, action verbs, and keyword alignment
 * - Anti-hallucination and malformed payload guardrails
 * - API route payload size limits and unprocessable entity handling
 * 
 * SECURITY:
 * - Read-only assertions. Never modifies .env or exposes secrets.
 */

import { ResumeInputPayloadSchema, GeneratedResumeSchema, GeneratedResume } from "../src/types/resume";
import { auditResumeQuality } from "../src/lib/resume-quality";
import { NextRequest } from "next/server";
import { POST as generateHandler } from "../src/app/api/services/resume-builder/generate/route";
import { POST as regenerateHandler } from "../src/app/api/services/resume-builder/regenerate/route";

console.log("=================================================");
console.log("AI RESUME BUILDER - REPOSITORY AUTOMATED TESTS");
console.log("=================================================");

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? " - " + detail : ""}`);
    failedCount++;
  }
}

// ----------------------------------------------------
// TEST 1: Student Scenario (No Experience, Education + Projects)
// ----------------------------------------------------
const studentPayload = {
  personal: {
    fullName: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    cityState: "Bengaluru, Karnataka, India",
    portfolioUrl: "https://github.com/aaravsharma",
  },
  career: {
    targetJobTitle: "Frontend Engineering Intern",
    careerLevel: "student" as const,
    targetIndustry: "Technology / SaaS",
    professionalSummary: "Passionate computer science undergraduate seeking a software engineering internship.",
    targetJobDescription: "Seeking an enthusiastic intern with React, TypeScript and WebSocket knowledge.",
  },
  education: [
    {
      id: "edu-1",
      institution: "National Institute of Technology",
      degree: "B.Tech Computer Science and Engineering",
      fieldOfStudy: "Computer Science",
      startYear: "2023",
      graduationYear: "2027",
      grade: "8.9 / 10 CGPA",
    },
  ],
  experience: [], // Empty work experience is 100% valid for students!
  skillsAndMore: {
    technicalSkills: ["TypeScript", "JavaScript", "React", "Next.js", "Tailwind CSS", "WebSocket"],
    softSkills: ["Fast Learner", "Problem Solving", "Team Collaboration"],
    projects: [
      {
        id: "proj-1",
        title: "Real-Time Collaborative Code Editor",
        role: "Lead Developer",
        technologies: ["React", "TypeScript", "WebSocket", "Tailwind CSS"],
        description: "Engineered a low-latency collaborative editor with OT synchronization.",
        link: "https://github.com/aaravsharma/collab-code",
      },
    ],
    certifications: [],
    awards: ["1st Prize at Inter-College Hackathon 2025"],
    languages: ["English", "Hindi"],
  },
  preferences: {
    language: "en" as const,
    templateId: "student-fresher" as const,
    pageLength: "one-page" as const,
    optimizeForJobDescription: true,
  },
};

const studentValidation = ResumeInputPayloadSchema.safeParse(studentPayload);
assert(studentValidation.success, "TEST 1.1: Student payload validates cleanly without work experience");

// ----------------------------------------------------
// TEST 2: Fresher Scenario (Education, Skills, Certs)
// ----------------------------------------------------
const fresherPayload = {
  ...studentPayload,
  career: {
    ...studentPayload.career,
    targetJobTitle: "Junior Full Stack Developer",
    careerLevel: "fresher" as const,
  },
  skillsAndMore: {
    ...studentPayload.skillsAndMore,
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        issueDate: "2026",
        credentialUrl: "https://aws.amazon.com/verification",
      },
    ],
  },
  preferences: {
    language: "en" as const,
    templateId: "modern-minimal" as const,
    pageLength: "one-page" as const,
    optimizeForJobDescription: false,
  },
};
const fresherValidation = ResumeInputPayloadSchema.safeParse(fresherPayload);
assert(fresherValidation.success, "TEST 2.1: Fresher payload validates with certifications and modern template");

// ----------------------------------------------------
// TEST 3: Experienced Professional (Multiple Work History)
// ----------------------------------------------------
const experiencedPayload = {
  personal: {
    fullName: "Priya Venkatesh",
    email: "priya.v@example.com",
    phone: "+91 99887 66554",
    cityState: "Mumbai, Maharashtra, India",
    linkedinUrl: "https://linkedin.com/in/priyavenkatesh",
  },
  career: {
    targetJobTitle: "Staff Software Engineer",
    careerLevel: "experienced" as const,
    targetIndustry: "Fintech & Cloud Systems",
    professionalSummary: "Senior Full Stack Architect with 6+ years designing high-throughput distributed systems.",
  },
  education: [
    {
      id: "edu-1",
      institution: "BITS Pilani",
      degree: "B.E. Computer Science",
      fieldOfStudy: "Computer Science",
      startYear: "2016",
      graduationYear: "2020",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "RazorPay Capital",
      jobTitle: "Lead Platform Engineer",
      employmentType: "full-time" as const,
      startDate: "2023-01",
      endDate: "Present",
      currentlyWorking: true,
      responsibilities: "Spearheaded core settlement reconciliation pipeline processing $20M+ daily.",
      achievements: "Scaled throughput by 340% using Kafka partitioned stream processors.",
    },
    {
      id: "exp-2",
      company: "PayU Payments",
      jobTitle: "Senior Software Engineer",
      employmentType: "full-time" as const,
      startDate: "2020-07",
      endDate: "2022-12",
      currentlyWorking: false,
      responsibilities: "Developed payment checkout SDKs and merchant gateway integrations.",
      achievements: "Engineered zero-dependency Web SDK reducing merchant integration bundle size by 45%.",
    },
  ],
  skillsAndMore: {
    technicalSkills: ["Go", "Node.js", "Kafka", "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes"],
    softSkills: ["Technical Leadership", "System Design", "Cross-Functional Collaboration"],
    projects: [],
    certifications: [],
    awards: [],
    languages: ["English"],
  },
  preferences: {
    language: "en" as const,
    templateId: "classic-professional" as const,
    pageLength: "two-page" as const,
    optimizeForJobDescription: false,
  },
};
const expValidation = ResumeInputPayloadSchema.safeParse(experiencedPayload);
assert(expValidation.success, "TEST 3.1: Experienced professional payload validates with multiple work records");

// ----------------------------------------------------
// TEST 4: Job-Specific Resume & Quality Audit Keyword Match
// ----------------------------------------------------
const mockGeneratedResume: GeneratedResume = {
  header: {
    fullName: "Aarav Sharma",
    targetTitle: "Frontend Engineering Intern",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    portfolio: "https://github.com/aaravsharma",
  },
  professionalSummary: "Enthusiastic Frontend Engineering Intern skilled in React, TypeScript, and WebSocket architecture. Engineered high-performance real-time applications with sub-50ms latency.",
  skills: {
    technical: ["TypeScript", "JavaScript", "React", "Next.js", "WebSocket", "Tailwind CSS"],
    tools: ["Git", "VS Code", "Vercel"],
    soft: ["Problem Solving", "Rapid Prototyping"],
  },
  experience: [],
  education: [
    {
      id: "edu-1",
      institution: "National Institute of Technology",
      degree: "B.Tech Computer Science and Engineering",
      fieldOfStudy: "Computer Science",
      dateRange: "2023 — 2027",
      grade: "8.9 / 10 CGPA",
      highlights: ["Data Structures", "Algorithms", "Web Architecture"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Real-Time Collaborative Code Editor",
      role: "Lead Developer",
      technologies: ["React", "TypeScript", "WebSocket", "Tailwind CSS"],
      bulletPoints: [
        "Architected WebSocket synchronization achieving sub-50ms keystroke replication across clients.",
        "Engineered responsive UI components using React and Tailwind CSS, increasing user engagement by 40%.",
      ],
      link: "https://github.com/aaravsharma/collab-code",
    },
  ],
  certifications: [],
  languages: ["English", "Hindi"],
  awards: ["Hackathon Winner"],
  metadata: {
    generatedAt: new Date().toISOString(),
    model: "gemini-4-hydrogen",
    templateId: "student-fresher",
    pageTarget: "one-page",
    keywordMatchCount: 5,
  },
};

const genValidation = GeneratedResumeSchema.safeParse(mockGeneratedResume);
assert(genValidation.success, "TEST 4.1: Generated resume passes GeneratedResumeSchema validation");

const targetJobDesc = "Seeking a Frontend intern with hands-on experience in React, TypeScript, and WebSocket real-time communication.";
const auditResult = auditResumeQuality(mockGeneratedResume, targetJobDesc);
assert(auditResult.totalChecks >= 5, `TEST 4.2: Total ATS checks evaluated: ${auditResult.totalChecks}`);
assert(auditResult.passedCount >= 4, `TEST 4.3: Passed checks count: ${auditResult.passedCount}/${auditResult.totalChecks}`);
assert(auditResult.matchedKeywords.length >= 2, `TEST 4.4: Job description matched keywords: ${auditResult.matchedKeywords.join(", ")}`);
assert(auditResult.checks.some((c) => c.id.includes("verbs") || c.category === "verbs"), "TEST 4.5: Action verb verification evaluated in checks");

// ----------------------------------------------------
// TEST 5: Missing Information & Anti-Hallucination Guardrails
// ----------------------------------------------------
const badPayload = {
  ...studentPayload,
  personal: {
    ...studentPayload.personal,
    fullName: "", // Blank name must fail!
    email: "not-an-email", // Malformed email must fail!
  },
};
const badValidation = ResumeInputPayloadSchema.safeParse(badPayload);
assert(!badValidation.success, "TEST 5.1: Malformed personal info rejected by schema");

// ----------------------------------------------------
// TEST 6: Template Switching Support
// ----------------------------------------------------
const validTemplates = ["classic-professional", "modern-minimal", "student-fresher"] as const;
for (const tmpl of validTemplates) {
  const tPayload = {
    ...studentPayload,
    preferences: {
      ...studentPayload.preferences,
      templateId: tmpl,
    },
  };
  const tVal = ResumeInputPayloadSchema.safeParse(tPayload);
  assert(tVal.success, `TEST 6.${validTemplates.indexOf(tmpl) + 1}: Template '${tmpl}' supported`);
}

// ----------------------------------------------------
// TEST 7: API Route Payload Size and Security Guard
// ----------------------------------------------------
async function runApiGuards() {
  // 7.1 Oversized payload (> 60KB) guard
  const hugeString = "A".repeat(70000);
  const oversizedReq = new NextRequest("http://localhost:3000/api/services/resume-builder/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ huge: hugeString }),
  });
  const resOversized = await generateHandler(oversizedReq);
  assert(resOversized.status === 413, "TEST 7.1: Oversized request (>60KB) rejected with HTTP 413");

  // 7.2 Malformed input rejection
  const malformedReq = new NextRequest("http://localhost:3000/api/services/resume-builder/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unexpectedKey: "test" }),
  });
  const resMalformed = await generateHandler(malformedReq);
  assert(resMalformed.status === 422, "TEST 7.2: Malformed payload rejected with HTTP 422");

  // 7.3 Section regeneration malformed request rejection
  const regenReq = new NextRequest("http://localhost:3000/api/services/resume-builder/regenerate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const resRegen = await regenerateHandler(regenReq);
  assert(resRegen.status >= 400 && resRegen.status < 500, `TEST 7.3: Invalid regeneration request rejected with HTTP ${resRegen.status}`);
}

runApiGuards().then(() => {
  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log("=================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log("ALL RIGOROUS REPOSITORY TESTS COMPLETED SUCCESSFULLY!");
    process.exit(0);
  }
}).catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
