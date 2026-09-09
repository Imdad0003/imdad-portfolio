import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";

import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Clear guidelines on project milestones, cancellations, deposits, and refunds for custom digital services with Imdad Digital Studio.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/refund-policy`,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 min-h-[44px] text-xs font-mono text-[#7A6880] hover:text-[#180D1D] transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white/80 border border-[#502D55]/10 rounded-3xl p-5 sm:p-12 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26]">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#180D1D]">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs font-mono text-[#7A6880] mt-1">
              Last Updated: March 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 text-[#56475C] font-normal text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              1. Custom Digital Services
            </h2>
            <p>
              Imdad Builds provides specialized, bespoke creative, development,
              and optimization services. Because each deliverable requires
              dedicated operator hours and tailored strategic execution, services
              cannot be &ldquo;returned&rdquo; in the traditional sense once completed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              2. Pre-Kickoff Cancellation
            </h2>
            <p>
              If you decide to cancel a project before any discovery, wireframing,
              or production work has commenced, you are eligible for a 100% refund
              of your initial deposit (minus any direct transaction or banking
              fees incurred).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              3. Milestone-Based Project Cancellation
            </h2>
            <p>
              For projects divided into multiple milestones:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                If work is halted during an active milestone, the initial deposit
                is retained to cover completed engineering and design hours.
              </li>
              <li>
                Any advance payments made for uncommenced future milestones will
                be promptly refunded.
              </li>
              <li>
                All draft assets, code, and creative files produced up to the
                cancellation point will be transferred to you upon final billing
                reconciliation.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              4. Revision Commitment
            </h2>
            <p>
              If you feel a delivered asset does not meet the standards agreed
              upon in the project scope, we offer inclusive revision rounds to
              refine the work. We prioritize client satisfaction through iterative
              collaboration rather than leaving you with unsatisfactory results.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              5. Contacting Us
            </h2>
            <p>
              To discuss project adjustments, cancellations, or refund
              inquiries, please email directly:
            </p>
            <p className="font-mono text-xs text-[#180D1D] bg-[#FAF2EA] p-4 rounded-xl border border-[#F6DBC0]">
              Email:{" "}
              <a
                href="mailto:imdad.builds@gmail.com"
                className="underline hover:text-[#935073] transition-colors"
              >
                imdad.builds@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
