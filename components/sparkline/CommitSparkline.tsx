import type { ContributionWeek } from "@/lib/github";

const BLOCKS = ["·", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

type Props = {
  weeks: ContributionWeek[];
  total: number;
  logins?: readonly string[];
};

function renderBar(weeks: ContributionWeek[]): string {
  if (weeks.length === 0) return "";
  const max = Math.max(1, ...weeks.map((w) => w.count));
  return weeks
    .map((w) => {
      if (w.count === 0) return BLOCKS[0];
      const ratio = w.count / max;
      const idx = Math.min(BLOCKS.length - 1, 1 + Math.floor(ratio * (BLOCKS.length - 2)));
      return BLOCKS[idx];
    })
    .join("");
}

export function CommitSparkline({ weeks, total, logins = [] }: Props) {
  if (weeks.length === 0) return null;
  const bar = renderBar(weeks);
  const accountLine =
    logins.length > 1
      ? `${logins.map((l) => `@${l}`).join(" + ")} · merged`
      : logins.length === 1
        ? `@${logins[0]}`
        : "";
  return (
    <div className="font-mono text-xs">
      <div className="text-[color:var(--color-muted)]"># commits · last 52 weeks</div>
      <pre className="mt-2 whitespace-pre leading-none text-[color:var(--color-fg)]">{bar}</pre>
      <div className="mt-2 flex justify-between text-[color:var(--color-muted)]">
        <span>52w ago</span>
        <span>{total} total</span>
        <span>today</span>
      </div>
      {accountLine && (
        <div className="mt-1 text-[10px] text-[color:var(--color-muted)]">{accountLine}</div>
      )}
    </div>
  );
}
