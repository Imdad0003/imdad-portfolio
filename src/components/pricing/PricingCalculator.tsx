"use client";

import React, { useState } from "react";
import { allServices, getServiceById } from "@/data/pricing";
import { Calculator, Plus, Minus, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function PricingCalculator() {
  const [selectedServiceId, setSelectedServiceId] = useState("amazon-listing-pro");
  const [serviceQty, setServiceQty] = useState(3);

  const [selectedAddonId, setSelectedAddonId] = useState("creative-7-images");
  const [addonQty, setAddonQty] = useState(3);

  const selectedService = getServiceById(selectedServiceId) || allServices[0];
  const selectedAddon = selectedAddonId === "none" ? null : getServiceById(selectedAddonId);

  // Primary service cost calculation
  const servicePrice = selectedService.price;
  const serviceTotal = servicePrice * serviceQty;

  // Add-on cost calculation
  const addonPrice = selectedAddon ? selectedAddon.price : 0;
  const addonTotal = selectedAddon ? addonPrice * addonQty : 0;

  // Overall total
  const grandTotal = serviceTotal + addonTotal;

  const handleGetPackage = () => {
    let message = `Hi Imdad! I built a package on your website calculator:\n\n`;
    message += `• Primary Service: ${selectedService.name}\n`;
    message += `  Rate: ₹${servicePrice.toLocaleString("en-IN")} × ${serviceQty} = ₹${serviceTotal.toLocaleString("en-IN")}\n`;

    if (selectedAddon) {
      message += `• Add-on: ${selectedAddon.name}\n`;
      message += `  Rate: ₹${addonPrice.toLocaleString("en-IN")} × ${addonQty} = ₹${addonTotal.toLocaleString("en-IN")}\n`;
    }

    message += `\n• Estimated Total: ₹${grandTotal.toLocaleString("en-IN")}\n\n`;
    message += `Can you help me get started with this package and discuss the scope?`;

    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt: message,
        },
      })
    );
  };

  const primaryOptions = allServices.filter(
    (s) =>
      s.category === "ecommerce" ||
      s.category === "websites" ||
      s.category === "social" ||
      s.category === "marketing"
  );

  const addonOptions = allServices.filter(
    (s) =>
      s.category === "creatives" ||
      s.category === "video" ||
      s.category === "ai" ||
      s.category === "setup" ||
      s.id === "payment-gateway-integration" ||
      s.id === "product-research" ||
      s.id === "competitor-research"
  );

  return (
    <div className="relative rounded-3xl bg-white/80 border-2 border-[#502D55]/10 p-6 sm:p-10 backdrop-blur-3xl shadow-[0_20px_50px_-10px_rgba(80,45,85,0.07)] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F6DBC0]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#502D55]/08 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26] shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight">
              Build Your Custom Package
            </h3>
            <p className="text-xs sm:text-sm text-[#56475C]">
              Select your primary service and optional add-ons to see an instant dynamic estimate.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[11px] font-semibold text-[#7A3F26] self-start sm:self-auto">
          <Sparkles className="w-3 h-3 text-[#d97746]" />
          <span>Real-time Transparent Rates</span>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-8 relative z-10 items-start">
        {/* Left Side: Interactive Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Primary Service Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[#180D1D] font-bold block">
              1. Select Primary Service
            </label>
            <div className="relative">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white border border-[#502D55]/15 text-[#180D1D] text-xs sm:text-sm font-medium focus:border-[#935073] focus:ring-1 focus:ring-[#935073] focus:outline-none transition-colors cursor-pointer appearance-none shadow-xs"
              >
                {primaryOptions.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                    className="bg-white text-[#180D1D]"
                  >
                    {service.name} — ₹{service.price.toLocaleString("en-IN")} {service.unit}
                    {service.badge ? ` (${service.badge})` : ""}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A6880] text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Step 2: Primary Quantity Stepper */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[#180D1D] font-bold flex justify-between items-center">
              <span>2. Quantity ({selectedService.unit.replace(/^\/?\s*/, "")})</span>
              <span className="text-[#935073] font-normal lowercase font-sans">
                ₹{servicePrice.toLocaleString("en-IN")} each
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServiceQty(Math.max(1, serviceQty - 1))}
                className="w-11 h-11 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 py-2.5 px-4 rounded-xl bg-white/90 border border-[#502D55]/12 text-center font-black text-lg text-[#180D1D] shadow-2xs">
                {serviceQty}
              </div>

              <button
                type="button"
                onClick={() => setServiceQty(Math.min(50, serviceQty + 1))}
                className="w-11 h-11 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step 3: Add-on Service Selection */}
          <div className="space-y-2 pt-2 border-t border-[#502D55]/08">
            <label className="text-xs font-mono uppercase tracking-wider text-[#180D1D] font-bold block">
              3. Optional Add-on / Creative Stack
            </label>
            <div className="relative">
              <select
                value={selectedAddonId}
                onChange={(e) => setSelectedAddonId(e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white border border-[#502D55]/15 text-[#180D1D] text-xs sm:text-sm font-medium focus:border-[#935073] focus:ring-1 focus:ring-[#935073] focus:outline-none transition-colors cursor-pointer appearance-none shadow-xs"
              >
                <option value="none" className="bg-white text-[#7A6880]">
                  (No Add-on Selected)
                </option>
                {addonOptions.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                    className="bg-white text-[#180D1D]"
                  >
                    + {service.name} — ₹{service.price.toLocaleString("en-IN")} {service.unit}
                    {service.badge ? ` (${service.badge})` : ""}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A6880] text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Step 4: Add-on Quantity Stepper */}
          {selectedAddon && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-mono uppercase tracking-wider text-[#180D1D] font-bold flex justify-between items-center">
                <span>Add-on Quantity</span>
                <span className="text-[#935073] font-normal lowercase font-sans">
                  ₹{addonPrice.toLocaleString("en-IN")} each
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddonQty(Math.max(1, addonQty - 1))}
                  className="w-11 h-11 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                  aria-label="Decrease add-on quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 py-2.5 px-4 rounded-xl bg-white/90 border border-[#502D55]/12 text-center font-black text-lg text-[#180D1D] shadow-2xs">
                  {addonQty}
                </div>

                <button
                  type="button"
                  onClick={() => setAddonQty(Math.min(50, addonQty + 1))}
                  className="w-11 h-11 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                  aria-label="Increase add-on quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Calculated Investment Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-white/90 border border-[#502D55]/12 p-6 sm:p-7 backdrop-blur-2xl shadow-sm">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#7A6880] font-bold pb-3 border-b border-[#502D55]/08">
              Live Package Breakdown
            </div>

            {/* Itemized lines */}
            <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
              {/* Primary Line */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-bold text-[#180D1D]">{selectedService.name}</div>
                  <div className="text-[11px] text-[#7A6880]">
                    ₹{servicePrice.toLocaleString("en-IN")} × {serviceQty} {selectedService.unit.replace(/^\/?\s*/, "")}
                  </div>
                </div>
                <div className="font-mono font-bold text-[#180D1D]">
                  ₹{serviceTotal.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Add-on Line */}
              {selectedAddon && (
                <div className="flex justify-between items-start gap-2 pt-3 border-t border-[#502D55]/08">
                  <div>
                    <div className="font-bold text-[#180D1D]">{selectedAddon.name}</div>
                    <div className="text-[11px] text-[#7A6880]">
                      ₹{addonPrice.toLocaleString("en-IN")} × {addonQty} {selectedAddon.unit.replace(/^\/?\s*/, "")}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[#180D1D]">
                    ₹{addonTotal.toLocaleString("en-IN")}
                  </div>
                </div>
              )}
            </div>

            {/* Total Display */}
            <div className="mt-6 pt-5 border-t-2 border-[#502D55]/10 flex items-baseline justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#7A6880] font-semibold">
                  Estimated Total
                </div>
                <div className="text-[10px] text-[#7A6880]/80 mt-0.5">
                  Final quote may vary by scope
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gradient-dusk">
                ₹{grandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Key Deliverable Highlights */}
            <div className="mt-5 p-3 rounded-xl bg-[#FAF2EA]/70 border border-[#F6DBC0] text-[11px] text-[#56475C] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#7A3F26] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>What Happens Next?</span>
              </div>
              <p className="leading-snug">
                Clicking below connects you directly to the AI Assistant with this custom configuration pre-filled for an immediate scope walkthrough.
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-6 pt-4">
            <button
              type="button"
              onClick={handleGetPackage}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring active:scale-[0.98]"
            >
              <span>Get This Package</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
