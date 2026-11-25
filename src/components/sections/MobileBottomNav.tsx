"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Briefcase, Tag, MessageSquare } from "lucide-react";

const mobileNavTabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Services", href: "/services", icon: Layers },
  { label: "Work", href: "/projects", icon: Briefcase },
  { label: "Pricing", href: "/pricing", icon: Tag },
  { label: "Contact", href: "/contact", icon: MessageSquare },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--surface-pure,#FFFFFF)]/95 backdrop-blur-md border-t border-[var(--border-warm,#E8DFD5)] shadow-[0_-6px_24px_-6px_rgba(51,41,36,0.08)]"
      style={{
        paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto px-1.5 pt-1.5">
        {mobileNavTabs.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center min-h-[48px] py-1 rounded-2xl active:scale-95 transition-transform select-none"
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`w-11 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)]"
                    : "text-[var(--ink-muted,#8A7C75)]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span
                className={`text-[10px] mt-0.5 leading-none tracking-tight ${
                  isActive
                    ? "font-bold text-[var(--accent-coral-hover,#B4583F)]"
                    : "font-medium text-[var(--ink-body,#5F534D)]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
