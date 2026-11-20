export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  badge: string;
  bio: string;
  specialties: string[];
  avatarUrl?: string;
  initials: string;
}

export const studioTeam: TeamMember[] = [
  {
    id: "imdad",
    name: "Imdad",
    role: "Founder",
    title: "Founder & Lead Product Creator",
    badge: "Studio Lead",
    bio: "Full-stack engineer, product architect, and founder of EasyXo. Leads studio creative direction, technical architecture, and commercial strategy.",
    specialties: [
      "Product Architecture",
      "Full-Stack Development",
      "E-Commerce Operations",
      "Creative Direction",
    ],
    avatarUrl: "/imdad-logo.png",
    initials: "IB",
  },
  {
    id: "ray",
    name: "Ray",
    role: "Video Editor",
    title: "Senior Video Editor",
    badge: "Video Production",
    bio: "Specializes in high-retention short-form reels, narrative pacing, commercial storytelling, and audio-reactive cuts that stop the scroll.",
    specialties: [
      "Instagram Reels & Shorts",
      "Commercial Advertisements",
      "Pacing & Retention Hooks",
      "Sound Design & SFX",
    ],
    initials: "R",
  },
  {
    id: "zafar",
    name: "Zafar",
    role: "Video Editor",
    title: "Motion Designer & Video Editor",
    badge: "Motion & Post",
    bio: "Crafts polished motion graphics, kinetic typography, product demonstration reels, and high-impact visual effects for digital brands.",
    specialties: [
      "Motion Graphics",
      "Product Demonstration Reels",
      "Kinetic Typography",
      "Visual Effects & Grading",
    ],
    initials: "Z",
  },
];
