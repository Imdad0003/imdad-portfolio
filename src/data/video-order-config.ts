/**
 * Admin Configuration & Default Data Structures for Video Editing Orders
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * All structures are editable by administrators and provide complete compatibility
 * with CMS dashboards, pricing schedules, and customer intake forms.
 */

import { VideoOrderAdminConfig } from "@/types/video-order";

export const defaultVideoOrderConfig: VideoOrderAdminConfig = {
  // 1. Service Options
  serviceOptions: [
    {
      id: "basic-product-video",
      name: "Basic Product Video",
      startingPrice: 799,
      description: "Clean demonstration video with fast-paced cuts and product highlight overlays.",
      typicalDuration: "15–30s",
      deliverables: [
        "15–30s product showcase video",
        "Feature text callouts & clean cuts",
        "Upbeat royalty-free background track",
        "Vertical 9:16 mobile-optimized format",
      ],
      isPopular: false,
    },
    {
      id: "product-reel",
      name: "Product Reel",
      startingPrice: 999,
      description: "High-engagement short-form reel built for Instagram, Facebook, and YouTube Shorts.",
      typicalDuration: "20–45s",
      deliverables: [
        "High-energy hook in the first 3 seconds",
        "Trending audio sync & dynamic transitions",
        "Kinetic subtitle animations",
        "Clear call-to-action overlay",
      ],
      isPopular: true,
    },
    {
      id: "ugc-style-ad",
      name: "UGC-Style Ad",
      startingPrice: 1499,
      description: "Authentic, relatable creator-style video ad designed to drive high click-through rates.",
      typicalDuration: "30–60s",
      deliverables: [
        "Authentic customer-perspective format",
        "Problem → Solution → Result hook structure",
        "Unboxing & hands-on demonstration flow",
        "High-CTR captioning & visual styling",
      ],
      isPopular: true,
    },
    {
      id: "ai-ugc-ad",
      name: "AI UGC Ad",
      startingPrice: 1499,
      description: "AI-generated avatar and voice presenter delivering a high-converting product sales pitch.",
      typicalDuration: "30–60s",
      deliverables: [
        "Photorealistic AI presenter / avatar demonstration",
        "Natural speech synthesis & scriptwriting",
        "Dynamic visual B-roll & overlays",
        "Commercial usage rights included",
      ],
      isPopular: false,
    },
    {
      id: "premium-ad-creative",
      name: "Premium Ad Creative",
      startingPrice: 2499,
      description: "High-production ad asset combining motion design, kinetic type, and multi-hook variations.",
      typicalDuration: "30–60s",
      deliverables: [
        "High-fidelity motion design & kinetic typography",
        "2 alternative 3-second hook variations for A/B testing",
        "Sound design, foley & acoustic mastering",
        "Ad copy & headline suggestions included",
      ],
      isPopular: false,
    },
    {
      id: "youtube-longform",
      name: "YouTube / Long-Form Edit",
      startingPrice: 1999,
      description: "Comprehensive pacing, storytelling cuts, b-roll integration, and chapter structuring.",
      typicalDuration: "3–10 mins",
      deliverables: [
        "Narrative pacing & dead air removal",
        "B-roll inserts, sound effects & meme cues",
        "Color correction & audio leveling",
        "YouTube thumbnail concept frame",
      ],
      isPopular: false,
    },
    {
      id: "monthly-retainer",
      name: "Creator Studio Retainer",
      startingPrice: 12999,
      description: "Dedicated monthly editing desk for founders and creators publishing consistent weekly content.",
      typicalDuration: "16 Videos / Month",
      deliverables: [
        "16 Vertical Reels / Shorts per month",
        "Dedicated editor & private Slack / WhatsApp sync",
        "Reusable visual asset toolkit & font templates",
        "Content hook ideation & thumbnail suggestions",
        "Guaranteed 24-hour delivery queue",
      ],
      isPopular: false,
    },
    {
      id: "custom",
      name: "Custom Video Edit",
      startingPrice: 1299,
      description: "Tailored editing project scoped specifically to your creative brief.",
      typicalDuration: "Custom",
      deliverables: [
        "Bespoke creative direction",
        "Custom dimensions and formatting",
        "Dedicated revision rounds",
      ],
      isPopular: false,
    },
  ],

  // 2. Video Formats
  videoFormats: [
    {
      id: "mp4",
      label: "MP4 (H.264/AAC)",
      extension: ".mp4",
      recommended: true,
    },
    {
      id: "mov",
      label: "MOV (Apple ProRes / QuickTime)",
      extension: ".mov",
      recommended: false,
    },
    {
      id: "webm",
      label: "WebM (High-efficiency web)",
      extension: ".webm",
      recommended: false,
    },
    {
      id: "mkv",
      label: "MKV (Matroska container)",
      extension: ".mkv",
      recommended: false,
    },
    {
      id: "custom",
      label: "Other / Custom format",
      extension: "custom",
      recommended: false,
    },
  ],

  // 3. Aspect Ratios
  aspectRatios: [
    {
      id: "9:16",
      label: "9:16 (Vertical)",
      ratio: "9:16",
      description: "Instagram Reels, TikTok, YouTube Shorts, Meta Stories",
      recommended: true,
    },
    {
      id: "16:9",
      label: "16:9 (Horizontal)",
      ratio: "16:9",
      description: "YouTube, Website Landing Pages, Desktop displays",
      recommended: false,
    },
    {
      id: "1:1",
      label: "1:1 (Square)",
      ratio: "1:1",
      description: "Instagram Feed Posts, Facebook Feed Ads",
      recommended: false,
    },
    {
      id: "4:5",
      label: "4:5 (Portrait)",
      ratio: "4:5",
      description: "Instagram In-Feed Optimized Carousel & Videos",
      recommended: false,
    },
    {
      id: "custom",
      label: "Custom Aspect Ratio",
      ratio: "custom",
      description: "Specified in project notes or multi-format delivery",
      recommended: false,
    },
  ],

  // 4. Delivery Options
  deliveryOptions: [
    {
      id: "standard",
      label: "Standard Delivery (48–72 Hours)",
      days: 3,
      extraCharge: 0,
      isDefault: true,
    },
    {
      id: "express",
      label: "Express Priority (24–36 Hours)",
      days: 1.5,
      extraCharge: 499,
      isDefault: false,
    },
    {
      id: "rush",
      label: "Same-Day Rush (Within 12 Hours)",
      days: 0.5,
      extraCharge: 999,
      isDefault: false,
    },
  ],

  // 5. File Upload Settings
  uploadSettings: {
    allowedMimeTypes: [
      // Video
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-matroska",
      // Audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/m4a",
      "audio/x-m4a",
      "audio/aac",
      // Images
      "image/jpeg",
      "image/png",
      "image/webp",
      // Documents & Archives
      "application/zip",
      "application/x-zip-compressed",
      "application/pdf",
    ],
    allowedExtensions: [
      ".mp4",
      ".mov",
      ".webm",
      ".mkv",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".zip",
      ".pdf",
    ],
    maxFileSizeMb: 50, // 50MB per individual file
    maxTotalFiles: 10,
    maxTotalSizeMb: 200,
    storageProvider: "secure_internal_vault",
    privateAccessOnly: true, // Guarantees files are NOT exposed publicly
  },

  // 6. Order Form Fields
  orderFormFields: [
    {
      id: "fullName",
      fieldName: "customer.fullName",
      label: "Full Name",
      placeholder: "e.g. Rahul Sharma",
      required: true,
      type: "text",
      helperText: "Your legal or business contact name",
    },
    {
      id: "mobileNumber",
      fieldName: "customer.mobileNumber",
      label: "Mobile / WhatsApp Number",
      placeholder: "e.g. 9876543210",
      required: true,
      type: "tel",
      helperText: "10-digit number for order updates & draft previews",
    },
    {
      id: "email",
      fieldName: "customer.email",
      label: "Email Address",
      placeholder: "e.g. rahul@brand.com",
      required: true,
      type: "email",
      helperText: "For official invoice and high-resolution deliverables",
    },
    {
      id: "videoType",
      fieldName: "project.videoType",
      label: "Video Editing Type",
      placeholder: "Select video editing package",
      required: true,
      type: "select",
      options: [
        { label: "Product Reel (₹999)", value: "product-reel" },
        { label: "Basic Product Video (₹799)", value: "basic-product-video" },
        { label: "UGC-Style Ad (₹1,499)", value: "ugc-style-ad" },
        { label: "AI UGC Ad (₹1,499)", value: "ai-ugc-ad" },
        { label: "Premium Ad Creative (₹2,499)", value: "premium-ad-creative" },
        { label: "YouTube / Long-Form (₹1,999)", value: "youtube-longform" },
        { label: "Custom Project (From ₹1,299)", value: "custom" },
      ],
    },
    {
      id: "videoFormat",
      fieldName: "project.videoFormat",
      label: "Video Format",
      placeholder: "Select format",
      required: true,
      type: "select",
      options: [
        { label: "MP4 (H.264 - Recommended)", value: "mp4" },
        { label: "MOV (ProRes / QuickTime)", value: "mov" },
        { label: "WebM", value: "webm" },
        { label: "MKV", value: "mkv" },
        { label: "Custom / Other", value: "custom" },
      ],
    },
    {
      id: "aspectRatio",
      fieldName: "project.aspectRatio",
      label: "Aspect Ratio",
      placeholder: "Select aspect ratio",
      required: true,
      type: "select",
      options: [
        { label: "9:16 (Vertical Reels & Shorts - Recommended)", value: "9:16" },
        { label: "16:9 (Horizontal YouTube / Web)", value: "16:9" },
        { label: "1:1 (Square Feed)", value: "1:1" },
        { label: "4:5 (Portrait Feed)", value: "4:5" },
        { label: "Custom Ratio", value: "custom" },
      ],
    },
    {
      id: "approxDuration",
      fieldName: "project.approxDuration",
      label: "Approximate Duration",
      placeholder: "e.g. 30 seconds, 60 seconds",
      required: true,
      type: "text",
      helperText: "Desired length of the final edited video",
    },
    {
      id: "requirements",
      fieldName: "project.requirements",
      label: "Editing Requirements & Instructions",
      placeholder: "Describe desired hook, pacing, caption styling, color grade, text callouts, or key features...",
      required: true,
      type: "textarea",
      helperText: "Be as specific as possible so we nail the first cut",
    },
    {
      id: "deliveryDate",
      fieldName: "project.deliveryDate",
      label: "Required Delivery Date / Timeline",
      placeholder: "e.g. Within 48 hours, or by Friday",
      required: true,
      type: "text",
      helperText: "Target deadline for the first complete cut",
    },
    {
      id: "referenceVideoUrl",
      fieldName: "project.referenceVideoUrl",
      label: "Reference Video or Style Link (Optional)",
      placeholder: "e.g. https://instagram.com/reel/..., or YouTube link",
      required: false,
      type: "text",
      helperText: "Inspirational reel, creator handle, or benchmark style",
    },
  ],
};
