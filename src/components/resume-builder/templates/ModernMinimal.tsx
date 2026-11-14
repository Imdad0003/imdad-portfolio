import React from "react";
import { GeneratedResume } from "@/types/resume";

interface TemplateProps {
  resume: GeneratedResume;
  isEditing?: boolean;
  onUpdateField?: (path: string, value: any) => void;
}

export function ModernMinimal({ resume }: TemplateProps) {
  const { header, professionalSummary, skills, experience, education, projects, certifications, languages, awards } =
    resume;

  return (
    <div className="w-full bg-white text-slate-800 font-sans leading-relaxed p-8 sm:p-12 text-[12.5px]">
      {/* Header */}
      <header className="pb-5 mb-5 border-b border-slate-200 resume-section">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
          {header.fullName}
        </h1>
        <p className="text-xs font-mono font-bold text-[#0284C7] mt-1 uppercase tracking-wider">
          {header.targetTitle}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2.5 font-mono">
          <span>{header.location}</span>
          <span>•</span>
          <a href={`mailto:${header.email}`} className="text-slate-800 hover:text-[#0284C7] font-sans">
            {header.email}
          </a>
          <span>•</span>
          <span>{header.phone}</span>
          {header.linkedin && (
            <>
              <span>•</span>
              <a href={header.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#0284C7] font-sans">
                LinkedIn
              </a>
            </>
          )}
          {header.portfolio && (
            <>
              <span>•</span>
              <a href={header.portfolio} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-[#0284C7] font-sans">
                Portfolio
              </a>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {professionalSummary && (
        <section className="mb-5 resume-section">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            // Profile Summary
          </h2>
          <p className="text-slate-700 leading-relaxed text-xs">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* Skills Inventory */}
      <section className="mb-5 resume-section">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
          // Core Competencies
        </h2>
        <div className="space-y-1 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <span className="font-bold text-slate-900 w-32 shrink-0">Technical Skills:</span>
            <span className="text-slate-700">{skills.technical.join(", ")}</span>
          </div>
          {skills.tools && skills.tools.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="font-bold text-slate-900 w-32 shrink-0">Tools &amp; Stack:</span>
              <span className="text-slate-700">{skills.tools.join(", ")}</span>
            </div>
          )}
          {skills.soft && skills.soft.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="font-bold text-slate-900 w-32 shrink-0">Strengths:</span>
              <span className="text-slate-700">{skills.soft.join(", ")}</span>
            </div>
          )}
        </div>
      </section>

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-5 resume-section">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            // Work Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{exp.jobTitle}</span>
                    <span className="text-slate-400 text-xs">@</span>
                    <span className="font-semibold text-slate-700 text-xs">{exp.company}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{exp.dateRange}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                  {exp.bulletPoints.map((bp, bIdx) => (
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

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-5 resume-section">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            // Technical Projects
          </h2>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{proj.title}</span>
                    {proj.role && <span className="text-[11px] text-slate-500 font-mono">[{proj.role}]</span>}
                  </div>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#0284C7] hover:underline">
                      View Project &rarr;
                    </a>
                  )}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[10.5px] font-mono text-slate-500 mb-1">
                    Stack: {proj.technologies.join(" • ")}
                  </p>
                )}
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700">
                  {proj.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-5 resume-section">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
            // Education &amp; Credentials
          </h2>
          <div className="space-y-2.5">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-600 text-xs"> &bull; {edu.institution}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{edu.dateRange}</span>
                </div>
                {edu.grade && (
                  <p className="text-[11px] text-slate-500 mt-0.5">Academic Record: {edu.grade}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {((certifications && certifications.length > 0) || (languages && languages.length > 0) || (awards && awards.length > 0)) && (
        <section className="resume-section">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            // Additional Information
          </h2>
          <div className="space-y-1 text-xs text-slate-700">
            {certifications && certifications.length > 0 && (
              <div>
                <strong className="text-slate-900">Certifications: </strong>
                <span>{certifications.map((c) => `${c.name} (${c.issuer})`).join(", ")}</span>
              </div>
            )}
            {awards && awards.length > 0 && (
              <div>
                <strong className="text-slate-900">Awards: </strong>
                <span>{awards.join(", ")}</span>
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
