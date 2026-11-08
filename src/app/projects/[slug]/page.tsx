import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/config";
import { projectsData } from "@/data/projectsData";
import { getPublishedProjectBySlug, getPublishedProjects } from "@/lib/cms";
import { ProjectGalleryLightbox } from "@/components/projects/ProjectGalleryLightbox";
import { GalleryItem } from "@/types/cms";
import { GithubIcon } from "@/components/ui/GithubIcon";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Tag,
  Star,
  Layers,
  ArrowUpRight,
  Sparkles,
  Globe,
  Film,
} from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return projectsData.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | IMDAD.BUILDS",
      robots: { index: false, follow: false },
    };
  }

  const title = project.seoTitle || `${project.name} — ${project.category} Case Study | IMDAD.BUILDS`;
  const description =
    project.seoDescription ||
    project.shortDescription ||
    project.tagline ||
    project.description?.slice(0, 160) ||
    "Case study and engineering breakdown by IMDAD.BUILDS.";

  const ogImage = project.coverImage || `${siteConfig.siteUrl}/og-image.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.siteUrl}/projects/${project.slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project || project.published === false) {
    notFound();
  }

  // Related projects
  const allProjects = await getPublishedProjects();
  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug && p.published)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === project.category && b.category !== project.category) return -1;
      if (b.category === project.category && a.category !== project.category) return 1;
      return 0;
    })
    .slice(0, 3);

  // Gallery items normalization
  const galleryItems: GalleryItem[] =
    project.galleryItems && project.galleryItems.length > 0
      ? project.galleryItems
      : (project.gallery || []).map((url, idx) => ({
          id: `item_${idx}`,
          url,
          sortOrder: idx,
        }));

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: project.name,
    description: project.shortDescription || project.description,
    image: project.coverImage,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    datePublished: project.createdAt,
    dateModified: project.updatedAt,
    keywords: project.technologies?.join(", "),
  };

  return (
    <main className="min-h-screen pt-28 pb-24 bg-[#FDFBF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#56475C] mb-8">
          <Link href="/" className="hover:text-[#180D1D] transition-colors">
            STUDIO
          </Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[#180D1D] transition-colors">
            PROJECTS
          </Link>
          <span>/</span>
          <span className="text-[#935073] font-bold uppercase truncate">{project.name}</span>
        </div>

        {/* ======================================================== */}
        {/* HERO SECTION                                             */}
        {/* ======================================================== */}
        <div className="max-w-4xl space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] text-[10px] font-mono font-bold uppercase tracking-wider">
              {project.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
              {project.status || "Completed"}
            </span>
            {project.completionDate && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#56475C] pl-1">
                <Calendar className="w-3 h-3 text-[#935073]" />
                <span>{project.completionDate}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#180D1D] leading-[1.08]">
            {project.name}
          </h1>

          {project.tagline && (
            <p className="text-lg sm:text-xl text-[#56475C] font-medium leading-relaxed">
              {project.tagline}
            </p>
          )}

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <span>Visit Live Project</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-[#502D55]/15 text-[#180D1D] font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <GithubIcon size={16} />
                <span>Source Repository</span>
              </a>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COVER IMAGE SHOWCASE                                     */}
        {/* ======================================================== */}
        {project.coverImage && (
          <div className="relative rounded-3xl overflow-hidden bg-white border border-[#502D55]/12 shadow-md mb-12">
            <img
              src={project.coverImage}
              alt={project.name}
              className="w-full max-h-[600px] object-cover"
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* METRICS STRIP (IF PRESENT)                               */}
        {/* ======================================================== */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {project.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs space-y-1"
              >
                <span className="text-[10px] font-mono text-[#56475C] uppercase tracking-wider block">
                  {m.label}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#180D1D]">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN CONTENT GRID (NARRATIVE + SIDEBAR)                  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Left Column: Full Narrative & Case Study (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] font-mono text-[#935073] font-bold uppercase tracking-wider block mb-1">
                  CASE STUDY OVERVIEW
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#180D1D]">
                  Project Breakdown &amp; Execution
                </h2>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#56475C] leading-relaxed space-y-4 whitespace-pre-line">
                {project.description}
              </div>

              {/* Responsibilities / Scope */}
              {project.scope && project.scope.length > 0 && (
                <div className="pt-6 border-t border-[#502D55]/10 space-y-3">
                  <span className="text-[10px] font-mono text-[#56475C] font-bold uppercase tracking-wider block">
                    Scope of Execution
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.scope.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#180D1D]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {project.deliverables && project.deliverables.length > 0 && (
                <div className="pt-6 border-t border-[#502D55]/10 space-y-3">
                  <span className="text-[10px] font-mono text-[#56475C] font-bold uppercase tracking-wider block">
                    Shipped Deliverables
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.deliverables.map((d, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#180D1D]">
                        <Layers className="w-4 h-4 text-[#935073] shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Video Showcase (if present) */}
            {project.videoUrl && (
              <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#935073] uppercase tracking-wider">
                  <Film className="w-4 h-4" />
                  <span>Interactive Walkthrough / Video Showcase</span>
                </div>
                {project.videoUrl.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                  <video
                    src={project.videoUrl}
                    controls
                    className="w-full rounded-2xl shadow-sm bg-black"
                  />
                ) : (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={project.videoUrl}
                      title={project.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Interactive Gallery & Screenshots */}
            {galleryItems.length > 0 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#935073] font-bold uppercase tracking-wider block mb-1">
                    VISUAL ASSETS &amp; SCREENSHOTS
                  </span>
                  <h3 className="text-xl font-bold text-[#180D1D]">
                    Asset Gallery ({galleryItems.length})
                  </h3>
                  <p className="text-xs text-[#56475C]">
                    Click any image to view high-resolution full-screen lightbox
                  </p>
                </div>

                <ProjectGalleryLightbox
                  items={galleryItems}
                  coverImageUrl={project.coverImage}
                  projectName={project.name}
                />
              </div>
            )}
          </div>

          {/* Right Column: Sticky Metadata Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-5 sticky top-24">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#180D1D] pb-3 border-b border-[#502D55]/10">
                Technical Specifications
              </h3>

              {/* Technologies */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#56475C] uppercase tracking-wider block">
                  Technologies &amp; Tools
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF4F9] border border-[#502D55]/10 text-xs font-mono font-bold text-[#180D1D]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category & Status */}
              <div className="space-y-2 pt-3 border-t border-[#502D55]/10 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#56475C]">Category:</span>
                  <span className="font-bold text-[#180D1D]">{project.category}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#56475C]">Status:</span>
                  <span className="font-bold text-emerald-700">{project.status || "Completed"}</span>
                </div>
                {project.completionDate && (
                  <div className="flex justify-between py-1">
                    <span className="text-[#56475C]">Delivered:</span>
                    <span className="font-mono text-[#180D1D]">{project.completionDate}</span>
                  </div>
                )}
              </div>

              {/* Direct Live CTA */}
              <div className="pt-3 border-t border-[#502D55]/10 space-y-2">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Launch Live Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <Link
                  href="/contact"
                  className="w-full py-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#F3E5D8] text-[#7A3F26] border border-[#F6DBC0] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Inquire About Similar Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RELATED PROJECTS                                         */}
        {/* ======================================================== */}
        {relatedProjects.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-[#502D55]/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#935073] font-bold uppercase tracking-wider block mb-1">
                  MORE STUDIO WORK
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">
                  Related Case Studies
                </h3>
              </div>

              <Link
                href="/projects"
                className="text-xs font-bold text-[#180D1D] hover:text-[#935073] flex items-center gap-1"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/projects/${rel.slug}`}
                  className="group p-5 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs hover:shadow-md hover:border-[#935073]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {rel.coverImage ? (
                      <div className="aspect-16/10 rounded-2xl overflow-hidden bg-gray-100">
                        <img
                          src={rel.coverImage}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-16/10 rounded-2xl bg-[#FAF4F9] flex items-center justify-center text-[#935073]">
                        <Layers className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-mono text-[#7A3F26] uppercase">
                        {rel.category}
                      </span>
                      <h4 className="font-bold text-[#180D1D] text-base group-hover:text-[#935073] transition-colors mt-0.5">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-[#56475C] line-clamp-2 mt-1">
                        {rel.tagline || rel.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#502D55]/10 mt-3 flex items-center justify-between text-xs font-bold text-[#935073]">
                    <span>Read Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
