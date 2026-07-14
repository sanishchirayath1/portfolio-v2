import "server-only";

import { formatMonth } from "./format";
import type { ExperienceEntry, Identity, Milestone } from "./schema";

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

function companySpan(milestones: Milestone[]): { start: string; end: string } {
  const starts = milestones.map((m) => m.start).sort();
  const hasPresent = milestones.some((m) => m.end === "present");
  const ends = milestones
    .map((m) => m.end)
    .filter((e) => e !== "present")
    .sort();
  return {
    start: starts[0] ?? "",
    end: hasPresent ? "present" : (ends[ends.length - 1] ?? ""),
  };
}

function milestoneBlock(m: Milestone): string {
  const dates = `${formatMonth(m.start)} → ${formatMonth(m.end)}`;
  const highlights = m.highlights.map((h) => `    ${ACCENT}❯${RESET} ${h}`).join("\n");
  return [`  ${BOLD}${m.role}${RESET}  ${DIM}${dates}${RESET}`, highlights].join("\n");
}

function experienceBlock(entries: ExperienceEntry[]): string {
  const rows = entries.map((entry) => {
    const span = companySpan(entry.milestones);
    const spanDates = `${formatMonth(span.start)} → ${formatMonth(span.end)}`;
    const milestones = entry.milestones.map(milestoneBlock).join("\n\n");
    const stack = entry.stack.length ? `\n  ${DIM}stack:${RESET} ${entry.stack.join(", ")}` : "";
    return [
      `${CYAN}${entry.company}${RESET}  ${DIM}${spanDates} · ${entry.location}${RESET}`,
      "",
      milestones + stack,
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
