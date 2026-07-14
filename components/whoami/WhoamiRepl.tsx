"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const FLAG_ROUTES: Record<string, string> = {
  "--writing": "/writing",
  "--work": "/work",
  "--projects": "/projects",
  "--now": "/now",
  "--uses": "/uses",
  "--home": "/",
};

const HELP_FLAGS = new Set(["--help", "-h"]);

const COMMANDS = ["sanish", "help", "ls", "whoami", "clear"] as const;

const USAGE = [
  "usage: sanish [--writing | --work | --projects | --now | --uses | --home]",
  "",
  "  --writing    long-form notes",
  "  --work       roles and highlights",
  "  --projects   github repos",
  "  --now        current focus",
  "  --uses       tools and setup",
  "  --home       homepage",
].join("\n");

const HELP = [
  "commands:",
  "  sanish [--flag]   navigate to a section",
  "  help              show this help",
  "  ls                list routes",
  "  whoami            print identity",
  "  clear             clear the log",
].join("\n");

const LS = [
  "/",
  "/writing",
  "/work",
  "/projects",
  "/now",
  "/uses",
  "/whoami",
  "/resume",
  "/plaintext",
].join("  ");

type LogKind = "prompt" | "info" | "error" | "success";
type LogEntry = { id: number; kind: LogKind; text: string };

type Props = { name: string; role: string; location: string };

export function WhoamiRepl({ name, role, location }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  const [log, setLog] = useState<LogEntry[]>(() => [
    {
      id: 0,
      kind: "info",
      text: "type `sanish --writing` or `help` · tab completes · ↑/↓ history · / to focus · esc to blur",
    },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const append = useCallback((entries: Array<Omit<LogEntry, "id">>) => {
    setLog((prev) => [...prev, ...entries.map((e) => ({ ...e, id: ++idCounter.current }))]);
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = e.target;
      if (t instanceof HTMLElement) {
        const tag = t.tagName.toLowerCase();
        if (["input", "textarea", "select"].includes(tag) || t.isContentEditable) return;
      }
      e.preventDefault();
      focusInput();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusInput]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (log.length === 0) return;
    el.scrollTop = el.scrollHeight;
  }, [log]);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const prompt: Omit<LogEntry, "id"> = {
        kind: "prompt",
        text: `sanish@portfolio $ ${trimmed}`,
      };

      if (!trimmed) {
        append([prompt]);
        return;
      }
      if (trimmed === "clear") {
        setLog([]);
        return;
      }

      const [cmd, ...rest] = trimmed.split(/\s+/);

      if (cmd === "sanish") {
        if (rest.length === 0 || (rest[0] && HELP_FLAGS.has(rest[0]))) {
          append([prompt, { kind: "info", text: USAGE }]);
          return;
        }
        const flag = rest[0] ?? "";
        const target = FLAG_ROUTES[flag];
        if (!target) {
          append([prompt, { kind: "error", text: `sanish: unknown flag: ${flag}` }]);
          return;
        }
        append([prompt, { kind: "success", text: `→ ${target}` }]);
        router.push(target);
        return;
      }
      if (cmd === "help") {
        append([prompt, { kind: "info", text: HELP }]);
        return;
      }
      if (cmd === "ls") {
        append([prompt, { kind: "info", text: LS }]);
        return;
      }
      if (cmd === "whoami") {
        append([prompt, { kind: "info", text: `${name} · ${role} · ${location}` }]);
        return;
      }
      append([prompt, { kind: "error", text: `zsh: command not found: ${cmd}` }]);
    },
    [append, name, role, location, router],
  );

  const tabComplete = () => {
    const trailingSpace = /\s$/.test(value);
    const parts = value.split(/\s+/).filter((p, i, arr) => p !== "" || i === arr.length - 1);
    const last = trailingSpace ? "" : (parts[parts.length - 1] ?? "");
    const isFirstToken = !trailingSpace && parts.length <= 1;

    const pool = isFirstToken ? COMMANDS.slice() : Object.keys(FLAG_ROUTES);
    const matches = pool.filter((p) => p.startsWith(last));
    if (matches.length === 0) return;
    if (matches.length === 1) {
      const completed = matches[0];
      if (!completed) return;
      if (isFirstToken) {
        setValue(completed);
      } else {
        const head = parts.slice(0, -1).join(" ");
        setValue(head ? `${head} ${completed}` : completed);
      }
      return;
    }
    append([
      { kind: "prompt", text: `sanish@portfolio $ ${value}` },
      { kind: "info", text: matches.join("  ") },
    ]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const submitted = value;
      runCommand(submitted);
      if (submitted.trim()) setHistory((h) => [...h, submitted]);
      setValue("");
      setHistoryIndex(null);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      tabComplete();
      return;
    }
    if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      e.preventDefault();
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setValue(history[nextIndex] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      if (historyIndex === null) return;
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex] ?? "");
      }
      return;
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <section
      aria-label="Interactive shell"
      className="repl-shell mt-10 rounded-sm border border-[color:var(--color-border)] font-mono text-xs"
      onClick={focusInput}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") focusInput();
      }}
    >
      <div className="border-b border-[color:var(--color-border)] px-3 py-1 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
        # try: sanish --writing · press <kbd>/</kbd> to focus
      </div>
      <div ref={scrollRef} className="max-h-56 overflow-y-auto px-3 py-2 leading-relaxed">
        {log.map((entry) => (
          <pre
            key={entry.id}
            className={
              entry.kind === "prompt"
                ? "whitespace-pre-wrap text-[color:var(--color-muted)]"
                : entry.kind === "success"
                  ? "whitespace-pre-wrap text-[color:var(--color-accent)]"
                  : "whitespace-pre-wrap text-[color:var(--color-fg)]"
            }
          >
            {entry.text}
          </pre>
        ))}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[color:var(--color-muted)]">sanish@portfolio $</span>
          <div className="repl-caret-wrap">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              className="repl-input"
              aria-label="Shell input"
            />
            <div className="repl-mirror" aria-hidden="true">
              {value}
              <span className="repl-block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
