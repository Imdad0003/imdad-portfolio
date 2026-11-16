import {
  VideoEditingContentDocument,
  VideoCategory,
  VideoSampleItem,
  VideoPricingPackage,
  EditorProfile,
} from "@/types/video-editing";

export const defaultVideoEditingContent: VideoEditingContentDocument = {
  id: "video-editing",

  // ==========================================
  // 1. HERO SECTION
  // ==========================================
  hero: {
    eyebrow: "SERVICE 04 // RETENTION MEDIA LAB",
    headline: "High-Retention Video Editing Engineered For",
    highlightedText: "Direct Response & Scale.",
    description:
      "From viral 9:16 Instagram Reels and YouTube Shorts to polished long-form documentaries and cinematic commercial spots. We cut for hook rate, sound architecture, and zero viewer drop-off.",
    primaryCtaText: "Explore Portfolio",
    primaryCtaLink: "#portfolio",
    secondaryCtaText: "View Packages & Pricing",
    secondaryCtaLink: "#pricing",
    stats: [
      { label: "MASTER EXPORT", value: "4K UHD", sublabel: "60 FPS ProRes & H.264" },
      { label: "HOOK RETENTION", value: "3.2s Target", sublabel: "First-frame pacing rule" },
      { label: "STANDARD TURNAROUND", value: "24–48h", sublabel: "Fast queue turnaround" },
      { label: "PREVIEW SECURITY", value: "100%", sublabel: "Watermarked review draft" },
    ],
  },

  // ==========================================
  // 2. WATERMARK CONFIGURATION
  // ==========================================
  watermark: {
    enabled: true,
    text: "IMDAD.BUILDS // VIDEO LAB",
    subtext: "PREVIEW ASSET • DEMO SHOWCASE",
    position: "bottom-right",
    opacity: 85,
    style: "badge",
  },

  // ==========================================
  // 3. CATEGORIES
  // ==========================================
  categories: ["All", "Reels", "YouTube", "Promotional", "Cinematic", "Podcast"],

  // ==========================================
  // 4. PORTFOLIO SAMPLES
  // ==========================================
  samples: [
    {
      id: "sample-reel-01",
      title: "Streetwear Brand Kinetic Lookbook",
      category: "Reels",
      description:
        "Fast-paced jump-cuts synchronized to bass transients with textured 16mm film grain, custom kinetic typography, and speed-ramped product highlights.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      duration: "0:38",
      aspectRatio: "9:16",
      badge: "Vertical Reel (9:16) • Demo",
      clientOrBrand: "Urban D2C Label",
      tags: ["Kinetic Typography", "Beat Syncing", "Film Grain", "Sound FX"],
      sortOrder: 1,
      featured: true,
    },
    {
      id: "sample-yt-01",
      title: "Building a SaaS in 30 Days — Documentary Chapter I",
      category: "YouTube",
      description:
        "Engaging narrative pacing combining code screen captures, b-roll zooms, chapter title cards, and ambient lofi soundtrack engineered for 65%+ watch duration.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      duration: "11:42",
      aspectRatio: "16:9",
      badge: "YouTube Long-Form (16:9) • Demo",
      clientOrBrand: "Indie Hacker Studio",
      tags: ["Documentary Pacing", "Screen Motion", "Color Grading", "Sound Mix"],
      sortOrder: 2,
      featured: true,
    },
    {
      id: "sample-promo-01",
      title: "Noise-Cancelling Earbuds Direct-Response Ad",
      category: "Promotional",
      description:
        "Punchy problem-agitate-solve hook featuring simulated sound wave visualization, split-screen feature callouts, and conversion-engineered bottom CTA card.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      duration: "0:45",
      aspectRatio: "9:16",
      badge: "Direct-Response Ad • Demo",
      clientOrBrand: "AudioTech Labs",
      tags: ["UGC Hook", "Graphic Overlay", "Audio Muffle FX", "CTR Optimized"],
      sortOrder: 3,
      featured: true,
    },
    {
      id: "sample-cinema-01",
      title: "Midnight Automotive Nocturne — 4K Spec Spot",
      category: "Cinematic",
      description:
        "Moody teal & orange anamorphic color grading with custom synthesized engine risers, subtle lens distortion, and deliberate 24fps cinematic shutter motion.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      duration: "1:20",
      aspectRatio: "16:9",
      badge: "Cinematic Spec Spot • Demo",
      clientOrBrand: "Automotive Collective",
      tags: ["Anamorphic Grade", "Sound Design", "Speed Ramps", "Atmospheric"],
      sortOrder: 4,
      featured: true,
    },
    {
      id: "sample-pod-01",
      title: "Founder Stories — Multi-Cam Interview Cut",
      category: "Podcast",
      description:
        "Seamless dynamic speaker-tracking switching, subtle motion backgrounds, synchronized karaoke-style subtitles, and master audio leveling with vocal compression.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      duration: "0:58",
      aspectRatio: "9:16",
      badge: "Multi-Cam Podcast Cut • Demo",
      clientOrBrand: "Venture Cast",
      tags: ["Multi-Camera", "Karaoke Subs", "Vocal Clarity", "Hook Teaser"],
      sortOrder: 5,
      featured: false,
    },
    {
      id: "sample-reel-02",
      title: "Minimalist Coffee Pour-Over Sensory Reel",
      category: "Reels",
      description:
        "Tactile ASMR audio mixing with extreme macro sound design, clean modern serif lower-thirds, and soft warm film tones highlighting steam and liquid motion.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      duration: "0:29",
      aspectRatio: "9:16",
      badge: "Sound Design ASMR Reel • Demo",
      clientOrBrand: "Artisan Roasters",
      tags: ["ASMR Audio", "Macro Motion", "Color Temp", "Subtle Subs"],
      sortOrder: 6,
      featured: false,
    },
    {
      id: "sample-yt-02",
      title: "Tokyo Cyberpunk After Dark — Travel Cinema",
      category: "YouTube",
      description:
        "Full widescreen travel cinematography with seamless match cuts, soundscapes recorded on location, neon light bloom grading, and atmospheric transitions.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      duration: "7:15",
      aspectRatio: "16:9",
      badge: "Travel Cinema Essay • Demo",
      clientOrBrand: "Wanderlust Media",
      tags: ["Match Cuts", "Neon Palette", "Spatial Audio", "Visual Rhythm"],
      sortOrder: 7,
      featured: false,
    },
    {
      id: "sample-promo-02",
      title: "Fintech Mobile App Launch Teaser",
      category: "Promotional",
      description:
        "3D device mockups combined with slick interface zooms, haptic sound pops, and dynamic feature typography illustrating zero-fee international transfers.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      duration: "0:42",
      aspectRatio: "9:16",
      badge: "Product Showcase Teaser • Demo",
      clientOrBrand: "PaySwift App",
      tags: ["UI Screen Motion", "Sound Effects", "Feature Callouts", "App Teaser"],
      sortOrder: 8,
      featured: false,
    },
  ],

  // ==========================================
  // 5. PRICING PACKAGES (Clearly Labelled Dummy Pricing)
  // ==========================================
  pricing: [
    {
      id: "product-reel",
      name: "Viral Vertical Reel",
      tier: "Starter Reel",
      price: 999,
      currency: "₹",
      unit: "per video",
      description:
        "Tailored for Instagram Reels, TikTok, and YouTube Shorts needing high-energy hooks and dynamic captions.",
      videoDuration: "Up to 60 Seconds",
      revisions: "2 Rounds Included",
      turnaroundTime: "24–48 Hours",
      deliverables: [
        "9:16 vertical export (1080x1920 Full HD)",
        "Kinetic animated subtitles (Word-by-word)",
        "Sound design, risers & whooshes",
        "Hook optimization & jump-cut pacing",
        "Color correction & contrast punch",
        "Royalty-free commercial audio track",
      ],
      badge: "Great for Reels",
      popular: false,
      orderCtaText: "Order Reel Edit",
      orderPrompt:
        "Hi Imdad! I'd like to order the 'Viral Vertical Reel' video edit package (₹999 / video). Let's discuss raw footage and details.",
      isDummyPricing: true,
    },
    {
      id: "youtube-longform",
      name: "YouTube Creator Edit",
      tier: "Long-Form Pro",
      price: 1999,
      currency: "₹",
      unit: "per video",
      description:
        "Comprehensive long-form editing for educational, tech, vlog, and business creators who value watch time.",
      videoDuration: "8–12 Minutes",
      revisions: "3 Rounds Included",
      turnaroundTime: "3–4 Business Days",
      deliverables: [
        "16:9 widescreen export (1080p / 4K UHD)",
        "Full narrative rhythm & dead-air removal",
        "Motion graphics & chapter title cards",
        "B-roll placement & screen capture zooms",
        "Multi-layer vocal leveling & noise reduction",
        "Exported YouTube chapter markers & timestamps",
      ],
      badge: "Most Popular",
      popular: true,
      orderCtaText: "Order YouTube Edit",
      orderPrompt:
        "Hi Imdad! I'm interested in the 'YouTube Creator Edit' package (₹1,999 / video). Can we discuss my channel's style and timeline?",
      isDummyPricing: true,
    },
    {
      id: "premium-ad-creative",
      name: "Commercial & Ad Spot",
      tier: "Cinematic Grade",
      price: 2499,
      currency: "₹",
      unit: "per video",
      description:
        "Polished commercial-grade editing with custom cinematic color grading and bespoke sound mixing for brands.",
      videoDuration: "Up to 90 Seconds",
      revisions: "Unlimited Revisions",
      turnaroundTime: "3 Business Days",
      deliverables: [
        "Multi-aspect exports (9:16 + 16:9 + 1:1)",
        "High-end DaVinci Resolve color grading",
        "Bespoke sound design & audio mastering",
        "Speed ramping & optical flow transitions",
        "Brand typography & logo sting animation",
        "Clean broadcast / social compression",
      ],
      badge: "Commercial Grade",
      popular: false,
      orderCtaText: "Order Commercial",
      orderPrompt:
        "Hi Imdad! I want to order the 'Commercial & Ad Spot' package (₹2,499 / video). Here is what our brand is looking for...",
      isDummyPricing: true,
    },
    {
      id: "monthly-retainer",
      name: "Creator Studio Retainer",
      tier: "Monthly Retainer",
      price: 12999,
      currency: "₹",
      unit: "per month",
      description:
        "A dedicated editing desk for founders and creators publishing consistent weekly content with zero friction.",
      videoDuration: "16 Videos / Month",
      revisions: "Unlimited Fast Revisions",
      turnaroundTime: "Guaranteed 24h Queue",
      deliverables: [
        "16 Vertical Reels / Shorts per month",
        "Dedicated editor & private Slack / WhatsApp sync",
        "Reusable visual asset toolkit & font templates",
        "Content hook ideation & thumbnail suggestions",
        "Monthly cloud raw footage backup storage",
        "Zero long-term contract (pause or cancel anytime)",
      ],
      badge: "Best Value",
      popular: false,
      orderCtaText: "Book Retainer",
      orderPrompt:
        "Hi Imdad! I'm looking for a monthly editing partner and want to book the 'Creator Studio Retainer' (₹12,999 / month). Let's connect!",
      isDummyPricing: true,
    },
  ],

  // ==========================================
  // 6. ABOUT SECTION
  // ==========================================
  about: {
    badge: "STUDIO CRAFT // EDITING ARCHITECTURE",
    title: "Retention-First Video Engineering",
    tagline:
      "Most videos lose 60% of their audience in the first 3 seconds. We build edits that hold.",
    descriptionParagraphs: [
      "At IMDAD.BUILDS, video editing is treated as an engineering discipline rather than a decorative filter. We analyze viewer attention spans, algorithm metrics, and pacing psychology to craft videos that keep eyes glued to the screen.",
      "Whether it's the rhythm of a micro-pause, the tactile punch of a sound effect, or the visual balance of kinetic type, every frame is crafted to serve audience retention and brand authority.",
    ],
    principles: [
      {
        title: "The 3-Second Hook Rule",
        description:
          "Opening frames are cut with visual movement and audio curiosity to prevent swiping and maximize immediate engagement.",
        icon: "Zap",
      },
      {
        title: "Sound Architecture",
        description:
          "High-impact whooshes, risers, ambient layers, and crisp vocal compression that make videos feel physical and immersive.",
        icon: "Volume2",
      },
      {
        title: "Kinetic Typography",
        description:
          "Dynamic, word-by-word subtitle highlighting styled to match your brand typography and keep muted viewers engaged.",
        icon: "Type",
      },
      {
        title: "Color Science",
        description:
          "Targeted contrast and saturation grading calibrated for OLED smartphone displays and high-retina monitors.",
        icon: "Palette",
      },
    ],
    workflowSteps: [
      {
        step: "01",
        title: "Ingest & Story Hook",
        description:
          "We review raw footage, eliminate filler pauses, and select the strongest audio-visual hook for the opening frames.",
        turnaround: "Hour 0–6",
      },
      {
        step: "02",
        title: "Pacing & Kinetic Motion",
        description:
          "Tight rhythmic cutting matched to audio transients with dynamic zoom-ins, b-roll insertions, and text tracking.",
        turnaround: "Hour 6–18",
      },
      {
        step: "03",
        title: "Sound Mixing & Color Grade",
        description:
          "Multi-track audio mastering, noise cleanup, tactile SFX placement, and scene-by-scene color grading.",
        turnaround: "Hour 18–30",
      },
      {
        step: "04",
        title: "Review & Multi-Ratio Delivery",
        description:
          "Client review link, immediate revision turnaround, and final rendering in full 9:16, 16:9, or 1:1 formats.",
        turnaround: "Hour 30–48",
      },
    ],
  },

  // ==========================================
  // 7. OUR EDITORS (Demo Verified Profiles)
  // ==========================================
  editors: [
    {
      id: "editor-rayan",
      name: "Rayan Khan",
      role: "Lead Senior Editor & Colorist",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      experienceYears: "6+ Years Experience",
      specialization: ["Kinetic Typography", "Hook Pacing", "Color Science", "Sound Architecture"],
      software: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
      bio: "Specializes in high-velocity D2C video ads and viral vertical reels. Has cut over 200+ reels generating 15M+ organic views across creator and brand accounts.",
      verified: true,
      verificationNote: "Verified Studio Editor (Demo Verification Status)",
      completedProjectsCount: 180,
      isDemo: true,
    },
    {
      id: "editor-sameer",
      name: "Sameer Shaikh",
      role: "Short-Form Motion Graphics Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      experienceYears: "4+ Years Experience",
      specialization: ["Micro-Animations", "3D Device Motion", "Beat-Synced Pacing", "UGC Hooks"],
      software: ["After Effects", "Blender 3D", "Premiere Pro"],
      bio: "Passionate about kinetic typography and 3D product integration. Transforms raw mobile phone clips into high-converting conversion media.",
      verified: true,
      verificationNote: "Verified Studio Editor (Demo Verification Status)",
      completedProjectsCount: 120,
      isDemo: true,
    },
    {
      id: "editor-ananya",
      name: "Ananya Verma",
      role: "Long-Form & Narrative Documentary Editor",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      experienceYears: "5+ Years Experience",
      specialization: ["Documentary Storytelling", "Interview Editing", "Sound Design", "Audio Restoration"],
      software: ["DaVinci Resolve", "Premiere Pro", "Logic Pro X"],
      bio: "Crafts long-form YouTube essays, founder interviews, and brand documentaries with focus on narrative clarity, deep-air elimination, and musical cadence.",
      verified: true,
      verificationNote: "Verified Studio Editor (Demo Verification Status)",
      completedProjectsCount: 95,
      isDemo: true,
    },
  ],
};
