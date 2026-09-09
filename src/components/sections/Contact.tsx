"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import {
  Mail,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Send,
  ExternalLink,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

const serviceOptions = [
  "Amazon Listing",
  "Flipkart Listing",
  "Meesho Listing",
  "Product Images",
  "Product Video",
  "UGC Ad",
  "Website",
  "Shopify",
  "WordPress",
  "Social Media",
  "Meta Ads",
  "Business Setup Assistance",
  "Trademark Assistance",
  "GST Assistance",
  "Other",
];

const budgetRanges = [
  "Under ₹15,000",
  "₹15,000 – ₹40,000",
  "₹40,000 – ₹1,00,000",
  "₹1,00,000+",
  "To Be Discussed",
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    selectedServices: [] as string[],
    projectDetails: "",
    budget: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Listen for prefill events dispatched by AI Chatbot
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const customEvent = e as CustomEvent<{
        service?: string;
        details?: string;
        budget?: string;
      }>;
      if (customEvent.detail) {
        const { service, details, budget } = customEvent.detail;
        setFormData((prev) => {
          const matchedService = serviceOptions.find((opt) =>
            service && (opt.toLowerCase().includes(service.toLowerCase()) || service.toLowerCase().includes(opt.toLowerCase()))
          );

          const updatedServices = matchedService && !prev.selectedServices.includes(matchedService)
            ? [...prev.selectedServices, matchedService]
            : prev.selectedServices;

          return {
            ...prev,
            selectedServices: updatedServices,
            projectDetails: details
              ? `${prev.projectDetails ? prev.projectDetails + "\n\n" : ""}${details}`
              : prev.projectDetails,
            budget: budget || prev.budget,
          };
        });
      }
    };

    window.addEventListener("imdad:prefill-inquiry", handlePrefill);
    return () => window.removeEventListener("imdad:prefill-inquiry", handlePrefill);
  }, []);

  const toggleService = (service: string) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(service);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s !== service)
          : [...prev.selectedServices, service],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const whatsappUrl = getWhatsAppUrl();

  return (
    <section id="contact" className="py-24 sm:py-32 border-b border-[#F6DBC0]/15 relative overflow-hidden bg-gradient-to-b from-[#130917] via-[#220d29] to-[#130917]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-[#935073]/25 blur-[170px] rounded-full pointer-events-none -z-10" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Social Channels (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Badge variant="peach" size="md" className="mb-4 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-pulse shadow-[0_0_8px_#F6DBC0]" />
                Let&apos;s Build Together
              </Badge>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F8F4E9]">
                Have a project in mind?
              </h2>

              <p className="mt-4 text-base sm:text-lg text-[#d8cfc4] leading-relaxed">
                Tell me what you need and let&apos;s figure out the right way to
                build it — from high-impact marketplace listings and product
                creatives to responsive storefronts and paid ad campaigns.
              </p>

              {/* Direct Channels Cards */}
              <div className="mt-8 space-y-3.5">
                {/* Dedicated Instagram Card */}
                <a
                  href={siteConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[rgba(147,80,115,0.45)] via-[rgba(80,45,85,0.5)] to-[rgba(56,24,66,0.6)] border border-[#F6DBC0]/30 hover:border-[#F6DBC0]/60 transition-all duration-300 group focus-ring shadow-[0_10px_25px_rgba(10,3,14,0.5)] hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#935073] to-[#502D55] border border-[#F6DBC0]/35 flex items-center justify-center text-[#F8F4E9] group-hover:scale-105 transition-transform shadow-inner">
                      <Instagram className="w-6 h-6 text-[#F6DBC0]" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                        Prefer Instagram?
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#F8F4E9]">
                        Message {siteConfig.contact.instagramHandle}
                      </div>
                      <div className="text-[11px] text-[#d8cfc4]">
                        Discuss your project directly on Instagram
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#F6DBC0] group-hover:translate-x-1 transition-transform" />
                </a>

                {/* WhatsApp Direct */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[rgba(56,24,66,0.55)] border border-[#F6DBC0]/20 hover:border-[#F6DBC0]/45 transition-all duration-300 group focus-ring hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F6DBC0]/15 border border-[#F6DBC0]/30 flex items-center justify-center text-[#F6DBC0] group-hover:scale-105 transition-transform shadow-inner">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                        Fastest Response
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#F8F4E9]">
                        Chat on WhatsApp
                      </div>
                      <div className="text-[11px] text-[#bba89d]">
                        +91 7352608269 • Instant project scoping &amp; quick estimates
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#F6DBC0] group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Email Direct */}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[rgba(43,20,53,0.45)] border border-[#F6DBC0]/15 hover:border-[#F6DBC0]/35 transition-all duration-300 group focus-ring hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(30,12,38,0.75)] border border-[#F6DBC0]/20 flex items-center justify-center text-[#F8F4E9] group-hover:text-[#F6DBC0] transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#bba89d]">
                        Direct Email
                      </div>
                      <div className="text-sm font-semibold text-[#F8F4E9]">
                        {siteConfig.contact.email}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#bba89d] group-hover:text-[#F8F4E9]" />
                </a>
              </div>
            </div>

            {/* Response Time Note */}
            <div className="mt-8 pt-6 border-t border-[#F6DBC0]/12">
              <div className="flex items-center gap-2 text-xs text-[#d8cfc4]">
                <CheckCircle2 className="w-4 h-4 text-[#F6DBC0] shrink-0" />
                <span>Typical response time: Within 24 business hours</span>
              </div>
            </div>
          </div>

          {/* Right Column: Large Glass Contact Panel (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-gradient-to-br from-[rgba(56,24,66,0.75)] via-[rgba(43,20,53,0.7)] to-[rgba(30,12,38,0.85)] border border-[#F6DBC0]/25 p-7 sm:p-10 backdrop-blur-3xl shadow-[0_25px_60px_rgba(10,3,14,0.9),inset_0_1px_0_0_rgba(248,244,233,0.2)]">
              {submitted ? (
                <div className="py-14 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#F6DBC0]/20 border border-[#F6DBC0]/40 flex items-center justify-center text-[#F6DBC0] mb-5 animate-pulse shadow-[0_0_30px_rgba(246,219,192,0.4)]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#F8F4E9] tracking-tight">
                    Inquiry Received!
                  </h3>
                  <p className="mt-3 text-sm text-[#d8cfc4] max-w-md leading-relaxed">
                    Thank you, {formData.name || "there"}. I have recorded your
                    requirements and will review them carefully. Expect a direct
                    reply soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        businessName: "",
                        selectedServices: [],
                        projectDetails: "",
                        budget: "",
                      });
                    }}
                    className="mt-6 text-xs text-[#F6DBC0] underline hover:text-[#F8F4E9] cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2 font-bold"
                      >
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/18 text-sm text-[#F8F4E9] placeholder-[#bba89d]/60 focus-ring"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2 font-bold"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/18 text-sm text-[#F8F4E9] placeholder-[#bba89d]/60 focus-ring"
                      />
                    </div>
                  </div>

                  {/* Phone & Business Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2 font-bold"
                      >
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/18 text-sm text-[#F8F4E9] placeholder-[#bba89d]/60 focus-ring"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="businessName"
                        className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2 font-bold"
                      >
                        Business / Brand Name
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessName: e.target.value,
                          })
                        }
                        placeholder="e.g. Acme Naturals"
                        className="w-full px-4 py-3 rounded-xl bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/18 text-sm text-[#F8F4E9] placeholder-[#bba89d]/60 focus-ring"
                      />
                    </div>
                  </div>

                  {/* Service Multi-Select Chips */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2.5 font-bold">
                      What do you need help with? (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map((service) => {
                        const isSelected =
                          formData.selectedServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus-ring ${
                              isSelected
                                ? "bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] font-bold shadow-sm"
                                : "bg-[rgba(24,10,30,0.8)] border border-[#F6DBC0]/15 text-[#d8cfc4] hover:border-[#F6DBC0]/35 hover:text-[#F8F4E9]"
                            }`}
                          >
                            {service}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div>
                    <label
                      htmlFor="projectDetails"
                      className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2 font-bold"
                    >
                      Project Details *
                    </label>
                    <textarea
                      id="projectDetails"
                      required
                      rows={4}
                      value={formData.projectDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectDetails: e.target.value,
                        })
                      }
                      placeholder="Briefly describe your product, current marketplace/selling stage, what you need built, and target timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/18 text-sm text-[#F8F4E9] placeholder-[#bba89d]/60 focus-ring resize-none"
                    />
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-xs font-mono uppercase tracking-wider text-[#d8cfc4] mb-2 font-bold"
                    >
                      Estimated Budget Range (Optional)
                    </label>
                    <select
                      id="budget"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/18 text-sm text-[#F8F4E9] focus-ring cursor-pointer"
                    >
                      <option value="">Select a range...</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center text-sm sm:text-base py-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>Sending Inquiry...</span>
                    ) : (
                      <>
                        <span>Send Project Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center text-[11px] text-[#bba89d]">
                    Your details are treated with strict confidentiality.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
