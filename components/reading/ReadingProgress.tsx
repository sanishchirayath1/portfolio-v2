"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const BAR_LENGTH = 8;
const FILL = "█";
const EMPTY = "░";
const BAR_PREFIX_REGEX = /^\[[█░]{8}]\s+/;

function isReadingPage(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "writing" && parts[1] !== "tag";
}

function makeBar(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const filled = Math.round(clamped * BAR_LENGTH);
  return `[${FILL.repeat(filled)}${EMPTY.repeat(BAR_LENGTH - filled)}]`;
}

export function ReadingProgress() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isReadingPage(pathname)) return;

    const stripped = document.title.replace(BAR_PREFIX_REGEX, "");
    const baseTitle = stripped;
    let rafId = 0;
    let pending = false;

    function update() {
      pending = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      document.title = `${makeBar(progress)} ${baseTitle}`;
    }

    function onScroll() {
      if (pending) return;
      pending = true;
      rafId = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(rafId);
      document.title = baseTitle;
    };
  }, [pathname]);

  return null;
}
