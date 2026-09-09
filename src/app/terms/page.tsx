import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Imdad Builds",
  description:
    "Terms and Conditions governing digital services, project engagements, and client deliverables with Imdad Builds.",
};

export default function TermsPage() {
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#180D1D]">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs font-mono text-[#7A6880] mt-1">
              Last Updated: March 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 text-[#56475C] font-normal text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              1. Engagement &amp; Agreement
            </h2>
            <p>
              By commissioning work, submitting inquiries, or engaging Imdad
              Builds for digital creative, technical, or advisory services, you
              agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              2. Scope of Work &amp; Deliverables
            </h2>
            <p>
              Each project begins with a clear written agreement detailing
              deliverables, estimated turnaround times, and pricing. Any requests
              beyond the agreed scope will be estimated separately as an add-on
              or subsequent phase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              3. Milestone Invoicing &amp; Payments
            </h2>
            <p>
              Standard engagements require an initial deposit (typically 50%)
              prior to production kickoff, with the balance due upon milestone
              completion and final approval.
            </p>
            <div className="p-3 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] text-xs font-mono text-[#7A3F26]">
              Note: Online payment options will be added as the payment system is
              finalized. Direct bank transfer and verified UPI methods are currently
              coordinated.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              4. Intellectual Property &amp; Ownership
            </h2>
            <p>
              Upon receipt of full payment, all finalized customized
              deliverables (code repositories, brand assets, ad creative files)
              become the exclusive property of the client. Imdad Builds retains
              the right to display anonymized or approved work samples in
              portfolios and promotional case studies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              5. Revisions &amp; Collaboration
            </h2>
            <p>
              Projects include designated rounds of revisions (typically 2–3
              rounds) to refine details within the established creative brief.
              Client feedback must be provided in a consolidated and timely manner
              to maintain agreed delivery dates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              6. Limitation of Liability
            </h2>
            <p>
              While all work is executed to professional standards, Imdad Builds
              is not liable for indirect damages, marketplace account policy
              changes, algorithm adjustments by third-party platforms (Amazon,
              Flipkart, Google, Meta), or downtime caused by external hosting
              providers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#180D1D]">
              7. Contact
            </h2>
            <p>
              For legal inquiries or clarifications regarding these terms:
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
