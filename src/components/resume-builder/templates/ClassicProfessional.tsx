import React from "react";
import { GeneratedResume } from "@/types/resume";

interface TemplateProps {
  resume: GeneratedResume;
  isEditing?: boolean;
  onUpdateField?: (path: string, value: any) => void;
}

export function ClassicProfessional({ resume }: TemplateProps) {
  const { header, professionalSummary, skills, experience, education, projects, certifications, languages, awards } =
    resume;

  return (
    <div className="w-full bg-white text-slate-900 font-serif leading-normal p-8 sm:p-12 text-[13px]">
      {/* Header */}
      <header className="text-center border-b-2 border-slate-900 pb-4 mb-6 resume-section">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-950 font-serif">
          {header.fullName}
        </h1>
        <p className="text-sm font-semibold tracking-wide text-slate-700 mt-1 uppercase font-sans">
          {header.targetTitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-sans">
          <span>{header.location}</span>
          <span>&bull;</span>
          <a href={`mailto:${header.email}`} className="text-slate-900 hover:underline">
            {header.email}
          </a>
          <span>&bull;</span>
          <span>{header.phone}</span>
          {header.linkedin && (
            <>
              <span>&bull;</span>
              <a href={header.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:underline">
                LinkedIn
              </a>
            </>
          )}
          {header.portfolio && (
            <>
              <span>&bull;</span>
              <a href={header.portfolio} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:underline">
                Portfolio
              </a>
            </>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {professionalSummary && (
        <section className="mb-6 resume-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2.5 font-sans">
            Professional Summary
          </h2>
          <p className="text-slate-800 leading-relaxed text-justify font-sans text-xs">
            {professionalSummary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-6 resume-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-3 font-sans">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                  <div>
                    <span className="font-bold text-slate-950 text-sm">{exp.jobTitle}</span>
                    <span className="text-slate-600 text-xs"> &mdash; {exp.company}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono mt-0.5 sm:mt-0">{exp.dateRange}</span>
                </div>
                <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-xs text-slate-800 font-sans">
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
        <section className="mb-6 resume-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-3 font-sans">
            Key Projects
          </h2>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="resume-item">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                  <div>
                    <span className="font-bold text-slate-950 text-xs">{proj.title}</span>
                    {proj.role && <span className="text-slate-600 text-xs"> ({proj.role})</span>}
                  </div>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#0284C7] hover:underline">
                      Project Link &rarr;
                    </a>
                  )}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] text-slate-600 font-sans italic mt-0.5">
                    Technologies: {proj.technologies.join(", ")}
                  </p>
                )}
                <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-xs text-slate-800 font-sans">
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

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-6 resume-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-3 font-sans">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="resume-item font-sans">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-950 text-xs">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-600 text-xs"> &mdash; {edu.institution}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{edu.dateRange}</span>
                </div>
                {edu.grade && (
                  <p className="text-[11px] text-slate-600 mt-0.5">Grade / Performance: {edu.grade}</p>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-[11px] text-slate-700 space-y-0.5">
                    {edu.highlights.map((h, hIdx) => (
                      <li key={hIdx}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      <section className="mb-6 resume-section">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2.5 font-sans">
          Skills &amp; Competencies
        </h2>
        <div className="space-y-1.5 text-xs font-sans">
          <div>
            <strong className="text-slate-950">Technical Skills: </strong>
            <span className="text-slate-800">{skills.technical.join(" • ")}</span>
          </div>
          {skills.tools && skills.tools.length > 0 && (
            <div>
              <strong className="text-slate-950">Tools &amp; Platforms: </strong>
              <span className="text-slate-800">{skills.tools.join(" • ")}</span>
            </div>
          )}
          {skills.soft && skills.soft.length > 0 && (
            <div>
              <strong className="text-slate-950">Professional Strengths: </strong>
              <span className="text-slate-800">{skills.soft.join(" • ")}</span>
            </div>
          )}
        </div>
      </section>

      {/* Certifications & Awards */}
      {((certifications && certifications.length > 0) || (awards && awards.length > 0) || (languages && languages.length > 0)) && (
        <section className="resume-section">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-1 mb-2.5 font-sans">
            Additional Credentials
          </h2>
          <div className="space-y-1.5 text-xs font-sans">
            {certifications && certifications.length > 0 && (
              <div>
                <strong className="text-slate-950">Certifications: </strong>
                <span className="text-slate-800">
                  {certifications.map((c) => `${c.name} (${c.issuer}${c.year ? ` - ${c.year}` : ""})`).join(" • ")}
                </span>
              </div>
            )}
            {awards && awards.length > 0 && (
              <div>
                <strong className="text-slate-950">Honors &amp; Awards: </strong>
                <span className="text-slate-800">{awards.join(" • ")}</span>
              </div>
            )}
            {languages && languages.length > 0 && (
              <div>
                <strong className="text-slate-950">Languages: </strong>
                <span className="text-slate-800">{languages.join(" • ")}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
