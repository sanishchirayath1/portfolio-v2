"use client";

import { useCallback, useEffect, useState } from "react";

const LINES = [
  "[  0.001s] boot",
  "[  0.089s] loading identity...    ok",
  "[  0.213s] mounting content......ok",
  "[  0.298s] compiling projects....ok",
  "[  0.361s] tuning typography.....ok",
  "[  0.401s] ready.",
  "",
  "> welcome",
];

const STORAGE_KEY = "boot:seen";
const CHAR_INTERVAL_MS = 6;
const LINE_PAUSE_MS = 20;
const HOLD_MS = 500;
const FADE_MS = 220;

export function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [charIdx, setCharIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [dismissing, setDismissing] = useState(false);

  const dismiss = useCallback(() => {
    setDismissing((prev) => {
      if (prev) return prev;
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore private mode / disabled storage
      }
      window.setTimeout(() => setVisible(false), FADE_MS);
      return true;
    });
  }, []);

  const replay = useCallback(() => {
    setLineIdx(0);
    setCharIdx(0);
    setDismissing(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forced = new URLSearchParams(window.location.search).get("boot") === "1";
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // ignore
    }
    if (forced) {
      setVisible(true);
      return;
    }
    if (reduced || seen) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener("boot:replay", replay);
    return () => window.removeEventListener("boot:replay", replay);
  }, [replay]);

  useEffect(() => {
    if (!visible || dismissing) return;
    const currentLine = LINES[lineIdx];
    if (currentLine === undefined) {
      const t = window.setTimeout(dismiss, HOLD_MS);
      return () => window.clearTimeout(t);
    }
    if (charIdx < currentLine.length) {
      const t = window.setTimeout(() => setCharIdx((v) => v + 1), CHAR_INTERVAL_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLineIdx((v) => v + 1);
      setCharIdx(0);
    }, LINE_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [visible, dismissing, lineIdx, charIdx, dismiss]);

  useEffect(() => {
    if (!visible) return;
    function skip() {
      dismiss();
    }
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  const doneLines = LINES.slice(0, lineIdx).join("\n");
  const partial = LINES[lineIdx]?.slice(0, charIdx) ?? "";
  const printed = doneLines + (doneLines ? "\n" : "") + partial;

  return (
    <div className={`boot-overlay${dismissing ? " boot-dismissing" : ""}`} aria-hidden="true">
      <pre className="boot-log">
        {printed}
        <span className="boot-cursor">▊</span>
      </pre>
      <p className="boot-hint">press any key to skip</p>
    </div>
  );
}
