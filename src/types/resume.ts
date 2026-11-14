import { z } from "zod";

// ===============================================================
// 1. INPUT SCHEMAS (Validated from User Form)
// ===============================================================

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid professional email"),
  phone: z.string().min(7, "Please provide a valid phone number").max(25),
  cityState: z.string().min(2, "Please provide your City, State / Country").max(100),
  linkedinUrl: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
});

export const CareerInfoSchema = z.object({
  targetJobTitle: z.string().min(2, "Target job title is required").max(100),
  careerLevel: z.enum(["student", "fresher", "intern", "experienced", "freelancer"]),
  targetIndustry: z.string().max(100).optional().or(z.literal("")),
  professionalSummary: z.string().max(1500).optional().or(z.literal("")),
  targetJobDescription: z.string().max(5000).optional().or(z.literal("")),
});

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(2, "Institution name is required").max(150),
  degree: z.string().min(2, "Degree or certification is required").max(150),
  fieldOfStudy: z.string().min(2, "Field of study is required").max(150),
  startYear: z.string().min(4, "Start year is required").max(20),
  graduationYear: z.string().min(4, "Graduation year is required").max(20),
  grade: z.string().max(50).optional().or(z.literal("")),
});

export const WorkExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required").max(150),
  jobTitle: z.string().min(1, "Job title is required").max(150),
  employmentType: z.enum(["full-time", "part-time", "internship", "contract", "freelance"]),
  startDate: z.string().min(2, "Start date is required").max(30),
  endDate: z.string().max(30).optional().or(z.literal("")),
  currentlyWorking: z.boolean().default(false),
  responsibilities: z.string().max(3000).optional().or(z.literal("")),
  achievements: z.string().max(3000).optional().or(z.literal("")),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Project title is required").max(150),
  role: z.string().max(100).optional().or(z.literal("")),
  description: z.string().min(5, "Project description is required").max(1500),
  technologies: z.array(z.string()).default([]),
  link: z.string().url().optional().or(z.literal("")),
});

export const CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Certification name is required").max(150),
  issuer: z.string().min(2, "Issuing organization is required").max(150),
  issueDate: z.string().max(30).optional().or(z.literal("")),
  credentialUrl: z.string().url().optional().or(z.literal("")),
});

export const SkillsAndAchievementsSchema = z.object({
  technicalSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  awards: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  volunteerExperience: z.string().max(1500).optional().or(z.literal("")),
});

export const ResumePreferencesSchema = z.object({
  language: z.enum(["en", "hi"]).default("en"),
  templateId: z.enum(["classic-professional", "modern-minimal", "student-fresher"]).default("classic-professional"),
  pageLength: z.enum(["one-page", "two-page", "auto"]).default("auto"),
  optimizeForJobDescription: z.boolean().default(true),
});

export const ResumeInputPayloadSchema = z.object({
  personal: PersonalInfoSchema,
  career: CareerInfoSchema,
  education: z.array(EducationItemSchema).min(1, "At least one education record is required"),
  experience: z.array(WorkExperienceItemSchema).default([]), // Optional for students & freshers!
  skillsAndMore: SkillsAndAchievementsSchema,
  preferences: ResumePreferencesSchema,
});

export type ResumeInputPayload = z.infer<typeof ResumeInputPayloadSchema>;

// ===============================================================
// 2. OUTPUT SCHEMAS (Validated from AI Generation)
// ===============================================================

export const GeneratedWorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  jobTitle: z.string(),
  employmentType: z.string(),
  dateRange: z.string(),
  bulletPoints: z.array(z.string()),
});

export const GeneratedEducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  dateRange: z.string(),
  grade: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const GeneratedProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string().optional(),
  technologies: z.array(z.string()),
  bulletPoints: z.array(z.string()),
  link: z.string().optional(),
});

export const GeneratedResumeSchema = z.object({
  header: z.object({
    fullName: z.string(),
    targetTitle: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
  }),
  professionalSummary: z.string(),
  skills: z.object({
    technical: z.array(z.string()),
    tools: z.array(z.string()).optional(),
    soft: z.array(z.string()).optional(),
  }),
  experience: z.array(GeneratedWorkExperienceSchema).default([]),
  education: z.array(GeneratedEducationSchema),
  projects: z.array(GeneratedProjectSchema).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.string().optional(),
  })).default([]),
  languages: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  metadata: z.object({
    generatedAt: z.string(),
    model: z.string(),
    templateId: z.enum(["classic-professional", "modern-minimal", "student-fresher"]),
    pageTarget: z.enum(["one-page", "two-page", "auto"]),
    keywordMatchCount: z.number().optional(),
  }),
});

export type GeneratedResume = z.infer<typeof GeneratedResumeSchema>;

// ===============================================================
// 3. ADMIN CONFIGURATION SCHEMA
// ===============================================================

export interface ResumeBuilderConfig {
  enabled: boolean;
  maintenanceMode: boolean;
  isFreeBeta: boolean;
  priceInr: number;
  aiModel: string;
  dailyIpLimit: number;
  noticeBanner?: string;
  allowedTemplates: Array<"classic-professional" | "modern-minimal" | "student-fresher">;
}

export const defaultResumeBuilderConfig: ResumeBuilderConfig = {
  enabled: true,
  maintenanceMode: false,
  isFreeBeta: true,
  priceInr: 0,
  aiModel: "gemini-4-hydrogen",
  dailyIpLimit: 15,
  noticeBanner: "FREE BETA LAUNCH — Generate ATS-optimized resumes in seconds.",
  allowedTemplates: ["classic-professional", "modern-minimal", "student-fresher"],
};
