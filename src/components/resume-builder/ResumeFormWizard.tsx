"use client";

import React, { useState, useEffect } from "react";
import {
  ResumeInputPayload,
  EducationItemSchema,
  WorkExperienceItemSchema,
  ProjectItemSchema,
  CertificationItemSchema,
} from "@/types/resume";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings,
  Layers,
} from "lucide-react";

interface ResumeFormWizardProps {
  initialData?: Partial<ResumeInputPayload>;
  onSubmit: (payload: ResumeInputPayload) => void;
  isGenerating: boolean;
  errorMessage?: string | null;
}

const STORAGE_KEY = "imdad_resume_builder_draft_v1";

export function ResumeFormWizard({
  initialData,
  onSubmit,
  isGenerating,
  errorMessage,
}: ResumeFormWizardProps) {
  // Current step (0 to 5)
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [personal, setPersonal] = useState({
    fullName: initialData?.personal?.fullName || "",
    email: initialData?.personal?.email || "",
    phone: initialData?.personal?.phone || "",
    cityState: initialData?.personal?.cityState || "",
    linkedinUrl: initialData?.personal?.linkedinUrl || "",
    portfolioUrl: initialData?.personal?.portfolioUrl || "",
  });

  const [career, setCareer] = useState({
    targetJobTitle: initialData?.career?.targetJobTitle || "",
    careerLevel: initialData?.career?.careerLevel || "fresher",
    targetIndustry: initialData?.career?.targetIndustry || "",
    professionalSummary: initialData?.career?.professionalSummary || "",
    targetJobDescription: initialData?.career?.targetJobDescription || "",
  });

  const [education, setEducation] = useState(
    initialData?.education && initialData.education.length > 0
      ? initialData.education
      : [
          {
            id: "edu-1",
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startYear: "",
            graduationYear: "",
            grade: "",
          },
        ]
  );

  const [experience, setExperience] = useState(
    initialData?.experience || []
  );

  const [skillsAndMore, setSkillsAndMore] = useState({
    technicalSkills: initialData?.skillsAndMore?.technicalSkills || ["JavaScript", "TypeScript", "React"],
    softSkills: initialData?.skillsAndMore?.softSkills || ["Problem Solving", "Team Leadership"],
    projects: initialData?.skillsAndMore?.projects || [
      {
        id: "proj-1",
        title: "",
        role: "",
        description: "",
        technologies: [],
        link: "",
      },
    ],
    certifications: initialData?.skillsAndMore?.certifications || [],
    awards: initialData?.skillsAndMore?.awards || [],
    languages: initialData?.skillsAndMore?.languages || ["English"],
    volunteerExperience: initialData?.skillsAndMore?.volunteerExperience || "",
  });

  const [preferences, setPreferences] = useState({
    language: initialData?.preferences?.language || ("en" as const),
    templateId: initialData?.preferences?.templateId || ("classic-professional" as const),
    pageLength: initialData?.preferences?.pageLength || ("auto" as const),
    optimizeForJobDescription: initialData?.preferences?.optimizeForJobDescription ?? true,
  });

  // Local validation notice
  const [stepError, setStepError] = useState<string | null>(null);

  // Skill input buffers
  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [langInput, setLangInput] = useState("");

  // Auto-load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.personal) setPersonal(parsed.personal);
        if (parsed.career) setCareer(parsed.career);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.skillsAndMore) setSkillsAndMore(parsed.skillsAndMore);
        if (parsed.preferences) setPreferences(parsed.preferences);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Auto-save draft on state change
  useEffect(() => {
    try {
      const draft = { personal, career, education, experience, skillsAndMore, preferences };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore
    }
  }, [personal, career, education, experience, skillsAndMore, preferences]);

  const STEPS = [
    { title: "Personal Details", icon: User },
    { title: "Target Career", icon: Briefcase },
    { title: "Education", icon: GraduationCap },
    { title: "Work Experience", icon: Layers, optional: true },
    { title: "Skills & Projects", icon: Award },
    { title: "Preferences", icon: Settings },
  ];

  // Validate current step before advancing
  const handleNextStep = () => {
    setStepError(null);

    if (currentStep === 0) {
      if (!personal.fullName.trim()) return setStepError("Full Name is required.");
      if (!personal.email.trim() || !personal.email.includes("@"))
        return setStepError("A valid professional email is required.");
      if (!personal.phone.trim()) return setStepError("A contact phone number is required.");
      if (!personal.cityState.trim()) return setStepError("City, State / Country is required.");
    }

    if (currentStep === 1) {
      if (!career.targetJobTitle.trim()) return setStepError("Target Job Title is required.");
    }

    if (currentStep === 2) {
      if (education.length === 0) return setStepError("At least one education record is required.");
      const first = education[0];
      if (!first.institution.trim() || !first.degree.trim()) {
        return setStepError("Please provide institution name and degree for your education.");
      }
    }

    if (currentStep === 3) {
      // Experience is explicitly optional for freshers/students!
      if (career.careerLevel === "experienced" && experience.length === 0) {
        setStepError("Experienced professionals should include at least one work experience record.");
      }
    }

    if (currentStep === 4) {
      if (skillsAndMore.technicalSkills.length === 0) {
        return setStepError("Please add at least 2-3 technical skills.");
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setStepError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = () => {
    setStepError(null);
    const payload: ResumeInputPayload = {
      personal,
      career,
      education,
      experience,
      skillsAndMore,
      preferences,
    };
    onSubmit(payload);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Wizard Progress Bar */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (idx <= currentStep) setCurrentStep(idx);
                }}
                disabled={idx > currentStep}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : isCompleted
                    ? "bg-sky-50 text-[#0284C7] hover:bg-sky-100"
                    : "text-slate-400 bg-slate-50 cursor-not-allowed"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{s.title}</span>
                <span className="md:hidden">Step {idx + 1}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              </button>
            );
          })}
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-[#0284C7] h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation / Error Alert */}
      {(stepError || errorMessage) && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{stepError || errorMessage}</span>
          </div>
          <button
            onClick={() => setStepError(null)}
            className="text-xs font-bold text-rose-700 underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Form Container */}
      <div className="p-6 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-sm text-left">
        
        {/* STEP 0: Personal Information */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                STEP 1 OF 6 // PERSONAL CONTACT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight mt-1">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Recruiters require clear contact details. Privacy note: We do not store sensitive home addresses or personal identity numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Professional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  placeholder="e.g. alex.morgan@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City, State / Country <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={personal.cityState}
                  onChange={(e) => setPersonal({ ...personal, cityState: e.target.value })}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  LinkedIn Profile URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={personal.linkedinUrl}
                  onChange={(e) => setPersonal({ ...personal, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portfolio / GitHub URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={personal.portfolioUrl}
                  onChange={(e) => setPersonal({ ...personal, portfolioUrl: e.target.value })}
                  placeholder="https://github.com/username or your portfolio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Target Career & Job Description */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                STEP 2 OF 6 // CAREER DIRECTION
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight mt-1">
                Target Role &amp; Career Level
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Helps Gemini 4 Hydrogen calibrate the tone, seniority vocabulary, and ATS keywords.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={career.targetJobTitle}
                  onChange={(e) => setCareer({ ...career, targetJobTitle: e.target.value })}
                  placeholder="e.g. Full Stack Developer, Product Designer, Data Analyst"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Career Experience Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={career.careerLevel}
                  onChange={(e) =>
                    setCareer({
                      ...career,
                      careerLevel: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7] font-bold"
                >
                  <option value="student">Student (Currently in College / Degree)</option>
                  <option value="fresher">Fresher (Recent Graduate, 0-1 yr)</option>
                  <option value="intern">Intern Seeking Full-Time Role</option>
                  <option value="experienced">Experienced Professional (1-10+ yrs)</option>
                  <option value="freelancer">Freelancer / Independent Specialist</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Industry / Specialization <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={career.targetIndustry}
                onChange={(e) => setCareer({ ...career, targetIndustry: e.target.value })}
                placeholder="e.g. SaaS, E-Commerce, Fintech, AI Systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Thoughts for Summary <span className="text-slate-400 font-normal">(Optional &mdash; AI will polish)</span>
              </label>
              <textarea
                rows={2}
                value={career.professionalSummary}
                onChange={(e) => setCareer({ ...career, professionalSummary: e.target.value })}
                placeholder="Briefly describe your passion, core specialization, or career transition..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-bold text-[#0A192F]">
                  Paste Target Job Description (Optional High-Impact Optimization)
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Paste the job description of the role you want to apply for. Gemini 4 Hydrogen will scan its keywords and align your bullet points without hallucinating fake experience.
              </p>
              <textarea
                rows={3}
                value={career.targetJobDescription}
                onChange={(e) => setCareer({ ...career, targetJobDescription: e.target.value })}
                placeholder="Paste the job requirements, responsibilities, or skills from the job posting..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                  STEP 3 OF 6 // ACADEMICS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight mt-1">
                  Education &amp; Credentials
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  List your college, university, or major degrees.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEducation([
                    ...education,
                    {
                      id: `edu-${Date.now()}`,
                      institution: "",
                      degree: "",
                      fieldOfStudy: "",
                      startYear: "",
                      graduationYear: "",
                      grade: "",
                    },
                  ])
                }
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Degree</span>
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A192F]">
                      Education #{idx + 1}
                    </span>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Institution / University Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx] = { ...updated[idx], institution: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="e.g. Stanford University, Delhi University"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Degree / Qualification <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx] = { ...updated[idx], degree: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="e.g. B.Tech, B.S., M.S., Diploma"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Major / Field of Study <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx] = { ...updated[idx], fieldOfStudy: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="e.g. Computer Science, Mechanical Engineering, Business"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Grade / Percentage / CGPA <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={edu.grade || ""}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx] = { ...updated[idx], grade: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="e.g. 8.8 / 10 CGPA or 3.9 GPA"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Start Year <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.startYear}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx] = { ...updated[idx], startYear: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="e.g. 2022"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Graduation Year (or Expected) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx] = { ...updated[idx], graduationYear: e.target.value };
                          setEducation(updated);
                        }}
                        placeholder="e.g. 2026"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Work Experience (Explicitly Optional) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                    STEP 4 OF 6 // EXPERIENCE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    OPTIONAL FOR FRESHERS / STUDENTS
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight mt-1">
                  Work Experience
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  If you are a student or fresher without employment history, feel free to skip this section.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExperience([
                    ...experience,
                    {
                      id: `exp-${Date.now()}`,
                      company: "",
                      jobTitle: "",
                      employmentType: "full-time",
                      startDate: "",
                      endDate: "",
                      currentlyWorking: false,
                      responsibilities: "",
                      achievements: "",
                    },
                  ])
                }
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-[#0A192F]">No Work Experience Added</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Perfect for students, freshers, and interns. Your resume will emphasize your projects, academic coursework, and technical proficiencies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExperience([
                      {
                        id: `exp-${Date.now()}`,
                        company: "",
                        jobTitle: "",
                        employmentType: "full-time",
                        startDate: "",
                        endDate: "",
                        currentlyWorking: false,
                        responsibilities: "",
                        achievements: "",
                      },
                    ])
                  }
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0A192F] hover:bg-slate-100 cursor-pointer shadow-2xs"
                >
                  + Add Employment Record
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A192F]">
                        Experience #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx] = { ...updated[idx], company: e.target.value };
                            setExperience(updated);
                          }}
                          placeholder="e.g. Acme Corp"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx] = { ...updated[idx], jobTitle: e.target.value };
                            setExperience(updated);
                          }}
                          placeholder="e.g. Frontend Developer"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx] = { ...updated[idx], startDate: e.target.value };
                            setExperience(updated);
                          }}
                          placeholder="e.g. Jun 2023"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          End Date {exp.currentlyWorking && "(Present)"}
                        </label>
                        <input
                          type="text"
                          disabled={exp.currentlyWorking}
                          value={exp.currentlyWorking ? "Present" : exp.endDate || ""}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx] = { ...updated[idx], endDate: e.target.value };
                            setExperience(updated);
                          }}
                          placeholder="e.g. May 2024"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F] disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={exp.currentlyWorking}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx] = { ...updated[idx], currentlyWorking: e.target.checked };
                          setExperience(updated);
                        }}
                        className="rounded text-[#0284C7]"
                      />
                      <span>I currently work in this role</span>
                    </label>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Key Responsibilities &amp; Highlights (Raw text &mdash; AI will write bullet points)
                      </label>
                      <textarea
                        rows={2}
                        value={exp.responsibilities || ""}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx] = { ...updated[idx], responsibilities: e.target.value };
                          setExperience(updated);
                        }}
                        placeholder="e.g. Managed authentication, integrated REST APIs, fixed memory leak issues in dashboard..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Skills & Projects */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                STEP 5 OF 6 // COMPETENCIES
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight mt-1">
                Skills &amp; Key Projects
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Technical proficiencies, frameworks, and practical applications engineered.
              </p>
            </div>

            {/* Technical Skills Tag Input */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-[#0A192F]">
                Technical Skills &amp; Frameworks <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skillsAndMore.technicalSkills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 text-[#0284C7] text-xs font-bold font-mono"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSkillsAndMore({
                          ...skillsAndMore,
                          technicalSkills: skillsAndMore.technicalSkills.filter((_, i) => i !== sIdx),
                        })
                      }
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && techInput.trim()) {
                      e.preventDefault();
                      setSkillsAndMore({
                        ...skillsAndMore,
                        technicalSkills: [...skillsAndMore.technicalSkills, techInput.trim()],
                      });
                      setTechInput("");
                    }
                  }}
                  placeholder="Type skill and press Enter (e.g. Next.js, Python, SQL, Docker)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (techInput.trim()) {
                      setSkillsAndMore({
                        ...skillsAndMore,
                        technicalSkills: [...skillsAndMore.technicalSkills, techInput.trim()],
                      });
                      setTechInput("");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A192F]">Featured Projects</span>
                <button
                  type="button"
                  onClick={() =>
                    setSkillsAndMore({
                      ...skillsAndMore,
                      projects: [
                        ...skillsAndMore.projects,
                        {
                          id: `proj-${Date.now()}`,
                          title: "",
                          role: "",
                          description: "",
                          technologies: [],
                          link: "",
                        },
                      ],
                    })
                  }
                  className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {skillsAndMore.projects.map((proj, pIdx) => (
                <div key={proj.id || pIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Project #{pIdx + 1}</span>
                    {skillsAndMore.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSkillsAndMore({
                            ...skillsAndMore,
                            projects: skillsAndMore.projects.filter((_, i) => i !== pIdx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...skillsAndMore.projects];
                        updated[pIdx] = { ...updated[pIdx], title: e.target.value };
                        setSkillsAndMore({ ...skillsAndMore, projects: updated });
                      }}
                      placeholder="Project Title (e.g. Distributed Task Queue)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                    />
                    <input
                      type="url"
                      value={proj.link || ""}
                      onChange={(e) => {
                        const updated = [...skillsAndMore.projects];
                        updated[pIdx] = { ...updated[pIdx], link: e.target.value };
                        setSkillsAndMore({ ...skillsAndMore, projects: updated });
                      }}
                      placeholder="Live or GitHub Link (Optional)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const updated = [...skillsAndMore.projects];
                      updated[pIdx] = { ...updated[pIdx], description: e.target.value };
                      setSkillsAndMore({ ...skillsAndMore, projects: updated });
                    }}
                    placeholder="Describe what you engineered, stack used, and key challenges solved..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Preferences & Generate */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                STEP 6 OF 6 // PREFERENCES &amp; GENERATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight mt-1">
                Resume Style &amp; Layout
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose your ATS layout template. All templates support clean, selectable vector PDF printing.
              </p>
            </div>

            {/* Template Selector Radio Cards */}
            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-3">
                Select Your Resume Template:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setPreferences({ ...preferences, templateId: "classic-professional" })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferences.templateId === "classic-professional"
                      ? "border-[#0284C7] bg-sky-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0A192F]">Classic Professional</span>
                    {preferences.templateId === "classic-professional" && (
                      <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Formal serif display, crisp horizontal dividers. Optimal for corporate, finance, enterprise roles.
                  </p>
                </div>

                <div
                  onClick={() => setPreferences({ ...preferences, templateId: "modern-minimal" })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferences.templateId === "modern-minimal"
                      ? "border-[#0284C7] bg-sky-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0A192F]">Modern Minimal</span>
                    {preferences.templateId === "modern-minimal" && (
                      <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Contemporary sans-serif typography, refined spacing, subtle code accents. Optimal for tech &amp; design.
                  </p>
                </div>

                <div
                  onClick={() => setPreferences({ ...preferences, templateId: "student-fresher" })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferences.templateId === "student-fresher"
                      ? "border-[#0284C7] bg-sky-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#0A192F]">Student &amp; Fresher</span>
                    {preferences.templateId === "student-fresher" && (
                      <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Prioritizes academics, projects, and competencies before work experience. Perfect for college graduates.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Page Length
                </label>
                <select
                  value={preferences.pageLength}
                  onChange={(e) => setPreferences({ ...preferences, pageLength: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] font-bold"
                >
                  <option value="auto">Auto (Adaptive based on content density)</option>
                  <option value="one-page">One Page Standard (Recommended for &lt;5 yrs)</option>
                  <option value="two-page">Two Pages (Senior / Leadership)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resume Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] font-bold"
                >
                  <option value="en">English (Global Standard ATS)</option>
                  <option value="hi">Hindi (Architecture Ready)</option>
                </select>
              </div>
            </div>

            {/* AI Generation Trigger Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-sky-400 font-mono">
                    Ready to Generate with Gemini 4 Hydrogen
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  FREE BETA
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to send your structured information to the server. Gemini 4 Hydrogen will engineer impactful action bullet points, align keywords, and generate your ATS-compliant resume in real time.
              </p>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleFinalSubmit}
                className="w-full py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Engineering Resume with Gemini 4 Hydrogen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate ATS Resume Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 0 || isGenerating}
            onClick={handlePrevStep}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>Continue &rarr;</span>
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}
