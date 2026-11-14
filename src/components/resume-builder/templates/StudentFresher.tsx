import React from "react";
import { GeneratedResume } from "@/types/resume";

interface TemplateProps {
  resume: GeneratedResume;
  isEditing?: boolean;
  onUpdateField?: (path: string, value: any) => void;
}

export function StudentFresher({ resume }: TemplateProps) {
  const { header, professionalSummary, skills, education, projects, experience, certifications, languages, awards } =
    resume;

  return (
    <div className="w-full bg-white text-slate-800 font-sans leading-relaxed p-8 sm:p-12 text-[12.5px]">
      {/* Header */}
      <header className="border-b-2 border-sky-600 pb-4 mb-5 resume-section">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
          {header.fullName}
        </h1>
        <p className="text-xs font-bold text-[#0284C7] mt-0.5 uppercase tracking-wide">
          {header.targetTitle}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2">
          <span>{header.location}</span>
          <span>|</span>
          <a href={`mailto:${header.email}`} className="text-[#0284C7] hover:underline">
            {header.email}
          </a>
          <span>|</span>
          <span>{header.phone}</span>
          {header.linkedin && (
            <>
              <span>|</span>
              <a href={header.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0284C7] hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {header.portfolio && (
            <>
              <span>|</span>
              <a href={header.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#0284C7] hover:underline">
                Portfolio / GitHub
              </a>
            </>
          )}
        </div>
      </header>

      {/* Career Objective / Summary */}
      {professionalSummary && (
        <section className="mb-5 resume-section">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Career Objective
          </h2>
          <p className="text-slate-700 leading-relaxed text-xs">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* Education (Prioritized for Student/Fresher) */}
      {education && education.length > 0 && (
        <section className="mb-5 resume-section">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {edu.degree} in {edu.fieldOfStudy}
                    </span>
                    <span className="text-slate-600 text-xs"> &mdash; {edu.institution}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{edu.dateRange}</span>
                </div>
                {edu.grade && (
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Academic Standing: <span className="font-bold text-slate-900">{edu.grade}</span>
                  </p>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <div className="mt-1">
                    <span className="text-[11px] font-bold text-slate-700">Key Coursework / Focus Areas: </span>
                    <span className="text-[11px] text-slate-600">{edu.highlights.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical & Soft Skills */}
      <section className="mb-5 resume-section">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
          Skills &amp; Technical Tools
        </h2>
        <div className="space-y-1.5 text-xs">
          <div>
            <strong className="text-slate-900">Languages &amp; Frameworks: </strong>
            <span className="text-slate-700">{skills.technical.join(", ")}</span>
          </div>
          {skills.tools && skills.tools.length > 0 && (
            <div>
              <strong className="text-slate-900">Developer Tools &amp; Libraries: </strong>
              <span className="text-slate-700">{skills.tools.join(", ")}</span>
            </div>
          )}
          {skills.soft && skills.soft.length > 0 && (
            <div>
              <strong className="text-slate-900">Core Strengths: </strong>
              <span className="text-slate-700">{skills.soft.join(", ")}</span>
            </div>
          )}
        </div>
      </section>

      {/* Projects (Prioritized for Student/Fresher) */}
      {projects && projects.length > 0 && (
        <section className="mb-5 resume-section">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Key Projects &amp; Implementations
          </h2>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.title}</span>
                    {proj.role && <span className="text-xs text-slate-500">({proj.role})</span>}
                  </div>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0284C7] hover:underline font-mono">
                      Live / Code &rarr;
                    </a>
                  )}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    Stack: {proj.technologies.join(", ")}
                  </p>
                )}
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
                  {proj.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">
                      {bp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internships & Work Experience (Optional) */}
      {experience && experience.length > 0 && (
        <section className="mb-5 resume-section">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Internships &amp; Practical Experience
          </h2>
          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs">{exp.jobTitle}</span>
                    <span className="text-slate-600 text-xs"> &mdash; {exp.company}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{exp.dateRange}</span>
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
                  {exp.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications, Awards & Languages */}
      {((certifications && certifications.length > 0) || (awards && awards.length > 0) || (languages && languages.length > 0)) && (
        <section className="resume-section">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Certifications &amp; Achievements
          </h2>
          <div className="space-y-1 text-xs text-slate-700">
            {certifications && certifications.length > 0 && (
              <div>
                <strong className="text-slate-900">Certificates: </strong>
                <span>{certifications.map((c) => `${c.name} (${c.issuer})`).join(" • ")}</span>
              </div>
            )}
            {awards && awards.length > 0 && (
              <div>
                <strong className="text-slate-900">Awards &amp; Competitions: </strong>
                <span>{awards.join(" • ")}</span>
              </div>
            )}
            {languages && languages.length > 0 && (
              <div>
                <strong className="text-slate-900">Languages: </strong>
                <span>{languages.join(", ")}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
