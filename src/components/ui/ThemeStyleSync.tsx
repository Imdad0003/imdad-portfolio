"use client";

import { useEffect } from "react";
import { getSettings, getSiteContent } from "@/lib/cms";
import { buildThemeCssVariables } from "@/lib/theme";

export function ThemeStyleSync() {
  useEffect(() => {
    let active = true;
    Promise.all([getSiteContent(), getSettings()])
      .then(([site, settings]) => {
        if (!active) return;
        const vars = buildThemeCssVariables(site.themeSettings, settings);
        const root = document.documentElement;
        Object.entries(vars).forEach(([prop, value]) => {
          if (typeof value === "string" && prop.startsWith("--")) {
            root.style.setProperty(prop, value);
          }
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return null;
}
