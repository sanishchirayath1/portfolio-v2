import "server-only";

import { formatMonth } from "./format";
import type { ExperienceEntry, Identity } from "./schema";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const ACCENT = `${ESC}32m`;
const CYAN = `${ESC}36m`;

const RULE = "─".repeat(60);

function section(title: string): string {
  return `\n${DIM}${RULE}${RESET}\n${BOLD}${title.toUpperCase()}${RESET}\n${DIM}${RULE}${RESET}\n`;
}

function header(identity: Identity): string {
  const { name, headline, location, email, socials } = identity;
  return [
    `${BOLD}${ACCENT}${name}${RESET}`,
    `${headline} · ${location}`,
    `${DIM}${email}${RESET}`,
    "",
    `${DIM}github.com/${socials.github}${RESET}`,
    `${DIM}linkedin.com/in/${socials.linkedin}${RESET}`,
    `${DIM}x.com/${socials.twitter}${RESET}`,
  ].join("\n");
}

function experienceBlock(entries: ExperienceEntry[]): string {
  const rows = entries.map((entry) => {
    const dates = `${formatMonth(entry.start)} → ${formatMonth(entry.end)}`;
    const highlights = entry.highlights.map((h) => `  ${ACCENT}❯${RESET} ${h}`).join("\n");
    const stack = entry.stack.length ? `\n  ${DIM}stack:${RESET} ${entry.stack.join(", ")}` : "";
    return [
      `${CYAN}${entry.company}${RESET} · ${entry.role}`,
      `${DIM}${dates} · ${entry.location}${RESET}`,
      "",
      highlights + stack,
    ].join("\n");
  });
  return rows.join("\n\n");
}

function nowBlock(identity: Identity): string {
  return [
    `Currently: ${identity.currently.role}`,
    `Training: ${identity.currently.training.join(", ")}`,
    identity.currently.planning.length ? `Planning: ${identity.currently.planning.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function footer(): string {
  return [
    "",
    `${DIM}This is the CLI view. Try me in a browser: ${RESET}${ACCENT}portfolio.hstart.in${RESET}`,
    `${DIM}Or fetch a specific page:${RESET} curl portfolio.hstart.in`,
    "",
  ].join("\n");
}

export function renderResume(identity: Identity, experience: ExperienceEntry[]): string {
  return [
    header(identity),
    section("Experience"),
    experienceBlock(experience),
    section("Now"),
    nowBlock(identity),
    footer(),
  ].join("\n");
}
