"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function readTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "system";
}

function applyTheme(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
}

const CYCLE: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<Theme, string> = {
  system: "auto",
  light: "light",
  dark: "dark",
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next = CYCLE[theme];
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
      className="font-mono text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
    >
      {mounted ? `theme: ${LABEL[theme]}` : "theme: …"}
    </button>
  );
}
