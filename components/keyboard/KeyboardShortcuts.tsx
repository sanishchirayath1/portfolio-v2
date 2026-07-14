"use client";

import { useEffect } from "react";

const routes: Record<string, string> = {
  h: "/",
  w: "/writing",
  k: "/work",
  p: "/projects",
  n: "/now",
  u: "/uses",
  r: "/resume",
};

const PREFIX_TIMEOUT_MS = 900;

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

export function KeyboardShortcuts() {
  useEffect(() => {
    let prefixActive = false;
    let timer: number | null = null;

    function clearPrefix() {
      prefixActive = false;
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;

      if (prefixActive) {
        const key = e.key.toLowerCase();
        const dest = routes[key];
        clearPrefix();
        if (dest) {
          e.preventDefault();
          window.location.assign(dest);
        }
        return;
      }

      if (e.key === "g") {
        prefixActive = true;
        timer = window.setTimeout(clearPrefix, PREFIX_TIMEOUT_MS);
      }
    }

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearPrefix();
    };
  }, []);

  return null;
}
