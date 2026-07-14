"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

const STORAGE_KEY = "verbose";

function inferSource(pathname: string): string {
  if (pathname === "/") return "app/page.tsx";
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "writing" && segments[1]) return "app/writing/[slug]/page.tsx";
  if (segments[0] === "writing" && segments[1] === "tag") return "app/writing/tag/[tag]/page.tsx";
  return `app${pathname}/page.tsx`;
}

function isTypingInto(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
}

export function KonamiVerbose() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const bufferRef = useRef<string[]>([]);

  const apply = useCallback((next: boolean) => {
    setOn(next);
    if (next) {
      document.documentElement.dataset.verbose = "on";
      try {
        localStorage.setItem(STORAGE_KEY, "on");
      } catch {}
    } else {
      delete document.documentElement.dataset.verbose;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    setFlash(next ? "verbose mode ON" : "verbose mode OFF");
    window.setTimeout(() => setFlash(null), 1500);
  }, []);

  useEffect(() => {
    let stored = false;
    try {
      stored = localStorage.getItem(STORAGE_KEY) === "on";
    } catch {}
    if (stored) {
      setOn(true);
      document.documentElement.dataset.verbose = "on";
    }
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (isTypingInto(e.target)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const buf = bufferRef.current;
      buf.push(key);
      if (buf.length > KONAMI.length) buf.splice(0, buf.length - KONAMI.length);
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        apply(!on);
        bufferRef.current = [];
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [on, apply]);

  const commitShort = (process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev").slice(0, 7);
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? "local";
  const env = process.env.NEXT_PUBLIC_DEPLOY_ENV ?? "local";

  return (
    <>
      {on && (
        <div className="verbose-hud" aria-hidden="true">
          <div>
            <span className="verbose-hud-key">route</span> {pathname}
          </div>
          <div>
            <span className="verbose-hud-key">source</span> {inferSource(pathname)}
          </div>
          <div>
            <span className="verbose-hud-key">commit</span> {commitShort}
          </div>
          <div>
            <span className="verbose-hud-key">env</span> {env}
          </div>
          <div>
            <span className="verbose-hud-key">built</span> {buildTime}
          </div>
        </div>
      )}
      {flash && <output className="cmdk-flash">{flash}</output>}
    </>
  );
}
