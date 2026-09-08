import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Imdad Builds",
  description:
    "Privacy Policy for Imdad Builds digital services studio. Learn how personal data and project confidentiality are handled.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#7A6880] hover:text-[#180D1D] transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white/80 border border-[#502D55]/10 rounded-3xl p-6 sm:p-12 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#180D1D]">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-[#7A6880] mt-1">
              Last Updated: March 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 text-[#56475C] font-normal text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              1. Overview
            </h2>
            <p>
              This Privacy Policy explains how Imdad Builds (&ldquo;I&rdquo;, &ldquo;we&rdquo;, or &ldquo;studio&rdquo;)
              collects, protects, and uses information when you interact with this
              website, submit project inquiries, or engage in digital services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[#180D1D] font-semibold">Inquiry &amp; Communication Details:</strong> Your
                name, email address, phone/WhatsApp number, project requirements, and
                budget range when voluntarily submitted through our contact form.
              </li>
              <li>
                <strong className="text-[#180D1D] font-semibold">Review Submissions:</strong> Your name, role,
                company/store link, rating, and feedback submitted to our public
                reviews system. Your email is strictly kept private for verification
                and never shown publicly.
              </li>
              <li>
                <strong className="text-[#180D1D] font-semibold">Technical Diagnostics:</strong> Standard anonymized
                browser headers, IP geography, and navigation timestamps collected to
                ensure server security and fast asset loading.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              3. How Your Information Is Used
            </h2>
            <p>
              Information collected is used exclusively for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Reviewing project inquiries and delivering scoped proposals.</li>
              <li>Executing deliverables and collaborating on active client milestones.</li>
              <li>Preventing automated spam and maintaining platform security.</li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information with any
              third-party marketing agencies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              4. Client Confidentiality &amp; Proprietary Assets
            </h2>
            <p>
              As an operator working with Amazon/Flipkart sellers and digital
              founders, confidentiality is paramount. Any store credentials, sales
              metrics, unreleased ad creatives, or proprietary product assets
              shared during an engagement are handled with strict privacy and never
              disclosed without your prior written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              5. Contact &amp; Data Inquiries
            </h2>
            <p>
              If you have questions regarding your data or would like any
              information removed from our records, please reach out directly:
            </p>
            <p className="font-mono text-xs text-[#180D1D] bg-[#FAF2EA] p-4 rounded-xl border border-[#F6DBC0]">
              Email: contact@imdad.builds <br />
              Instagram: @imdad.builds
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
