"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  PhoneCall,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { siteConfig, getWhatsAppUrl } from "@/data/config";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "E-Commerce & Marketplaces",
    budget: "₹10,000 – ₹25,000",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen for prefill events dispatched by AI Chatbot
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const customEvent = e as CustomEvent<{
        service?: string;
        details?: string;
      }>;
      if (customEvent.detail) {
        setFormData((prev) => ({
          ...prev,
          service: customEvent.detail.service || prev.service,
          message: customEvent.detail.details
            ? `${prev.message ? prev.message + "\n\n" : ""}${customEvent.detail.details}`
            : prev.message,
        }));
      }
    };

    window.addEventListener("imdad:prefill-inquiry", handlePrefill);
    return () => window.removeEventListener("imdad:prefill-inquiry", handlePrefill);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          budget: formData.budget,
          message: formData.message,
          _hp: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Failed to deliver inquiry. Please try again or reach out on WhatsApp."
        );
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact" className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[#7A3F26] text-xs uppercase tracking-widest font-mono mb-4 font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#d97746]" />
          <span>Direct Operator Access</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#180D1D] tracking-tight mb-4">
          Let’s Talk About <br />
          <span className="text-gradient-dusk">
            Your Next Project.
          </span>
        </h1>
        <p className="text-[#56475C] text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
          Tell me about your business, your goals, and what you’d like to build.
          I personally review every inquiry and reply within 12–24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white/80 border border-[#502D55]/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F6DBC0]/15 rounded-full blur-3xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[#7A3F26] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#180D1D] mb-3">
                  Inquiry Received
                </h3>
                <p className="text-[#56475C] max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                  Thank you for reaching out, {formData.name}. I have received
                  your project details and will get back to your email with an
                  actionable estimate shortly.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setErrorMessage(null);
                    setHoneypot("");
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      service: "E-Commerce & Marketplaces",
                      budget: "₹10,000 – ₹25,000",
                      message: "",
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] text-sm hover:bg-[#FAF2EA] transition-colors font-medium shadow-2xs cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6 relative z-10"
              >
                {/* Anti-spam honeypot */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                    opacity: 0,
                    pointerEvents: "none",
                    height: 0,
                    width: 0,
                  }}
                >
                  <input
                    type="text"
                    name="_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="new-password"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-[#180D1D] font-bold mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-[#502D55]/15 rounded-xl px-4 py-3 text-[#180D1D] placeholder-[#7A6880]/50 text-sm focus:outline-none focus:border-[#935073] focus:ring-1 focus:ring-[#935073] transition-colors shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-[#180D1D] font-bold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@company.com"
                      className="w-full bg-white border border-[#502D55]/15 rounded-xl px-4 py-3 text-[#180D1D] placeholder-[#7A6880]/50 text-sm focus:outline-none focus:border-[#935073] focus:ring-1 focus:ring-[#935073] transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-[#180D1D] font-bold mb-2">
                      WhatsApp / Phone{" "}
                      <span className="text-[#7A6880] font-normal font-sans">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#502D55]/15 rounded-xl px-4 py-3 text-[#180D1D] placeholder-[#7A6880]/50 text-sm focus:outline-none focus:border-[#935073] focus:ring-1 focus:ring-[#935073] transition-colors shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-[#180D1D] font-bold mb-2">
                      Service Needed *
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) =>
                        setFormData({ ...formData, service: e.target.value })
                      }
                      className="w-full bg-white border border-[#502D55]/15 rounded-xl px-4 py-3 text-[#180D1D] text-sm focus:outline-none focus:border-[#935073] focus:ring-1 focus:ring-[#935073] transition-colors shadow-2xs cursor-pointer"
                    >
                      <option value="E-Commerce & Marketplaces">
                        E-Commerce & Marketplaces
                      </option>
                      <option value="Brand Identity & Graphic Design">
                        Brand Identity & Graphic Design
                      </option>
                      <option value="Custom Web Development">
                        Custom Web Development
                      </option>
                      <option value="AI Automation & Workflows">
                        AI Automation & Workflows
                      </option>
                      <option value="Creative Media & Ad Creatives">
                        Creative Media & Ad Creatives
                      </option>
                      <option value="Performance Marketing & SEO">
                        Performance Marketing & SEO
                      </option>
                      <option value="Digital Consulting & Strategy">
                        Digital Consulting & Strategy
                      </option>
                      <option value="Complete End-to-End Package">
                        Complete End-to-End Package
                      </option>
                      <option value="Other / Custom Inquiry">
                        Other / Custom Inquiry
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-[#180D1D] font-bold mb-2">
                    Estimated Budget Range *
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full bg-white border border-[#502D55]/15 rounded-xl px-4 py-3 text-[#180D1D] text-sm focus:outline-none focus:border-[#935073] focus:ring-1 focus:ring-[#935073] transition-colors shadow-2xs cursor-pointer"
                  >
                    <option value="Under ₹10,000">Under ₹10,000</option>
                    <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                    <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                    <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
                    <option value="₹1,00,000+">₹1,00,000+</option>
                    <option value="Flexible / Need Advice">
                      Flexible / Need Advice
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-[#180D1D] font-bold mb-2">
                    Project Details & Goals *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell me about your product, your target audience, current bottlenecks, or specific timeline constraints..."
                    className="w-full bg-white border border-[#502D55]/15 rounded-xl px-4 py-3 text-[#180D1D] placeholder-[#7A6880]/50 text-sm focus:outline-none focus:border-[#935073] focus:ring-1 focus:ring-[#935073] transition-colors resize-none shadow-2xs"
                  />
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{errorMessage}</p>
                      <p className="text-[11px] sm:text-xs mt-1 text-red-700/80">
                        Prefer instant response? Chat directly on{" "}
                        <a
                          href={getWhatsAppUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-bold text-red-900 hover:text-black"
                        >
                          WhatsApp (+91 7352608269)
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Your Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Project Inquiry</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info & Direct Channels */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contact Options */}
          <div className="bg-white/80 border border-[#502D55]/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-sm">
            <h3 className="text-xl font-bold text-[#180D1D] mb-4">
              Direct Channels
            </h3>
            <p className="text-sm text-[#56475C] mb-6">
              Prefer direct messaging? Reach out through any of these platforms
              for rapid communication.
            </p>

            <div className="space-y-3">
              {/* Instagram */}
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-[#502D55]/10 hover:border-[#935073]/40 transition-all hover:bg-white shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] flex items-center justify-center text-[#7A3F26] border border-[#F6DBC0]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#7A6880] uppercase">
                      Instagram DM
                    </div>
                    <div className="text-sm font-semibold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                      @imdad.builds
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A6880] group-hover:text-[#180D1D] group-hover:translate-x-1 transition-all" />
              </a>

              {/* WhatsApp Quick Connect */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-[#502D55]/10 hover:border-[#935073]/40 transition-all hover:bg-white shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] flex items-center justify-center text-[#7A3F26] border border-[#F6DBC0]">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#7A6880] uppercase">
                      WhatsApp Business
                    </div>
                    <div className="text-sm font-semibold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                      +91 7352608269
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A6880] group-hover:text-[#180D1D] group-hover:translate-x-1 transition-all" />
              </a>

              {/* Email */}
              <a
                href={siteConfig.links.email}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-[#502D55]/10 hover:border-[#935073]/40 transition-all hover:bg-white shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] flex items-center justify-center text-[#7A3F26] border border-[#F6DBC0]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#7A6880] uppercase">
                      Direct Email
                    </div>
                    <div className="text-sm font-semibold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                      {siteConfig.contact.email}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A6880] group-hover:text-[#180D1D] group-hover:translate-x-1 transition-all" />
              </a>
            </div>
          </div>

          {/* Response Expectations */}
          <div className="bg-white/70 border border-[#502D55]/08 rounded-3xl p-6 backdrop-blur-md space-y-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#935073] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#180D1D]">
                  12–24 Hour Turnaround
                </h4>
                <p className="text-xs text-[#56475C] mt-0.5">
                  I read every inquiry myself. You will receive a direct reply
                  with scoping questions or initial scope suggestions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#935073] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#180D1D]">
                  Transparent Estimates
                </h4>
                <p className="text-xs text-[#56475C] mt-0.5">
                  No hidden fees, no sales traps. Quotes strictly map to the
                  scope required for your success.
                </p>
              </div>
            </div>
          </div>

          {/* Assistant Callout */}
          <div className="bg-gradient-to-br from-[#FAF2EA] to-white border border-[#F6DBC0] rounded-3xl p-6 shadow-2xs">
            <h4 className="text-sm font-bold text-[#180D1D] mb-1">
              Need Instant Answers?
            </h4>
            <p className="text-xs text-[#56475C] mb-4">
              Our live AI sales assistant can quote common packages and
              clarify deliverables instantly.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#7A3F26] font-semibold hover:underline"
            >
              <span>Explore Common Questions in FAQ</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
