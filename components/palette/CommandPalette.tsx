"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PostItem = { slug: string; title: string; tags: string[] };
type ProjectItem = { slug: string; name: string; description: string };

type Props = {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  posts: PostItem[];
  projects: ProjectItem[];
};

type Theme = "light" | "dark" | "system";
const THEME_CYCLE: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

function readTheme(): Theme {
  const v = document.documentElement.getAttribute("data-theme");
  if (v === "light" || v === "dark") return v;
  return "system";
}

function applyTheme(next: Theme): void {
  if (next === "system") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("theme");
  } else {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }
}

const PAGES: Array<{ path: string; label: string; keywords?: string[] }> = [
  { path: "/", label: "home" },
  { path: "/writing", label: "writing", keywords: ["blog", "posts"] },
  { path: "/work", label: "work", keywords: ["experience", "jobs"] },
  { path: "/projects", label: "projects", keywords: ["github", "repos"] },
  { path: "/now", label: "now", keywords: ["current", "training"] },
  { path: "/uses", label: "uses", keywords: ["tools", "setup"] },
  { path: "/whoami", label: "whoami", keywords: ["about", "bio"] },
  { path: "/resume", label: "resume", keywords: ["cv"] },
];

export function CommandPalette({ email, github, linkedin, twitter, posts, projects }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  const openExternal = useCallback((url: string) => {
    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 1400);
  }, []);

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(email).then(() => {
      showFlash("email copied");
      setOpen(false);
    });
  }, [email, showFlash]);

  const cycleTheme = useCallback(() => {
    const next = THEME_CYCLE[readTheme()];
    applyTheme(next);
    showFlash(`theme: ${next}`);
  }, [showFlash]);

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        className="cmdk-root"
      >
        <div className="cmdk-overlay" />
        <div className="cmdk-panel">
          <Command.Input placeholder="type a command or search…" className="cmdk-input" />
          <Command.List className="cmdk-list">
            <Command.Empty className="cmdk-empty">no results.</Command.Empty>

            <Command.Group heading="pages" className="cmdk-group">
              {PAGES.map((p) => (
                <Command.Item
                  key={p.path}
                  value={`${p.label} ${(p.keywords ?? []).join(" ")}`}
                  onSelect={() => go(p.path)}
                  className="cmdk-item"
                >
                  <span className="cmdk-item-kind">→</span>
                  <span>{p.label}</span>
                  <span className="cmdk-item-hint">{p.path}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {posts.length > 0 && (
              <Command.Group heading="writing" className="cmdk-group">
                {posts.map((p) => (
                  <Command.Item
                    key={p.slug}
                    value={`${p.title} ${p.tags.join(" ")}`}
                    onSelect={() => go(`/writing/${p.slug}`)}
                    className="cmdk-item"
                  >
                    <span className="cmdk-item-kind">✎</span>
                    <span>{p.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {projects.length > 0 && (
              <Command.Group heading="projects" className="cmdk-group">
                {projects.map((p) => (
                  <Command.Item
                    key={p.slug}
                    value={`${p.name} ${p.description}`}
                    onSelect={() => go(`/projects#${p.slug}`)}
                    className="cmdk-item"
                  >
                    <span className="cmdk-item-kind">◆</span>
                    <span>{p.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="actions" className="cmdk-group">
              <Command.Item value="copy email address" onSelect={copyEmail} className="cmdk-item">
                <span className="cmdk-item-kind">$</span>
                <span>copy email</span>
                <span className="cmdk-item-hint">{email}</span>
              </Command.Item>
              <Command.Item
                value="toggle theme dark light system"
                onSelect={cycleTheme}
                className="cmdk-item"
              >
                <span className="cmdk-item-kind">$</span>
                <span>cycle theme</span>
              </Command.Item>
              <Command.Item
                value="open github"
                onSelect={() => openExternal(`https://github.com/${github}`)}
                className="cmdk-item"
              >
                <span className="cmdk-item-kind">↗</span>
                <span>github</span>
                <span className="cmdk-item-hint">@{github}</span>
              </Command.Item>
              <Command.Item
                value="open linkedin"
                onSelect={() => openExternal(`https://linkedin.com/in/${linkedin}`)}
                className="cmdk-item"
              >
                <span className="cmdk-item-kind">↗</span>
                <span>linkedin</span>
                <span className="cmdk-item-hint">{linkedin}</span>
              </Command.Item>
              <Command.Item
                value="open twitter x"
                onSelect={() => openExternal(`https://x.com/${twitter}`)}
                className="cmdk-item"
              >
                <span className="cmdk-item-kind">↗</span>
                <span>x / twitter</span>
                <span className="cmdk-item-hint">@{twitter}</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="cmdk-footer">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> select
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </div>
        </div>
      </Command.Dialog>
      {flash && (
        <output aria-live="polite" className="cmdk-flash">
          {flash}
        </output>
      )}
    </>
  );
}
