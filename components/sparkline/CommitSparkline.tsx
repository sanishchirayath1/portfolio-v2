import type { ContributionWeek } from "@/lib/github";

type Props = {
  weeks: ContributionWeek[];
  total: number;
  logins?: readonly string[];
};

const BAR_W = 3;
const BAR_GAP = 1;
const BAR_STEP = BAR_W + BAR_GAP;
const CHART_H = 28;
const MIN_ACTIVE_H = 3;
const EMPTY_H = 2;

function formatWeek(iso: string): string {
  if (!iso) return "unknown";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function CommitSparkline({ weeks, total, logins = [] }: Props) {
  if (weeks.length === 0) return null;

  const max = Math.max(1, ...weeks.map((w) => w.count));
  const width = weeks.length * BAR_STEP - BAR_GAP;

  const accountLine =
    logins.length > 1
      ? `${logins.map((l) => `@${l}`).join(" + ")} · merged`
      : logins.length === 1
        ? `@${logins[0]}`
        : "";

  return (
    <div className="font-mono text-xs">
      <div className="text-[color:var(--color-muted)]"># commits · last {weeks.length} weeks</div>
      <div className="mt-2" style={{ maxWidth: width }}>
        <svg
          width={width}
          height={CHART_H}
          viewBox={`0 0 ${width} ${CHART_H}`}
          className="block h-7 w-full"
          role="img"
          aria-label={`Commit activity for the last ${weeks.length} weeks; ${total} total`}
        >
          {weeks.map((w, i) => {
            const isEmpty = w.count === 0;
            const ratio = w.count / max;
            const h = isEmpty ? EMPTY_H : Math.max(MIN_ACTIVE_H, Math.sqrt(ratio) * (CHART_H - 1));
            const x = i * BAR_STEP;
            const y = CHART_H - h;
            const label = `${formatWeek(w.weekStart)} · ${w.count} commit${w.count === 1 ? "" : "s"}`;
            return (
              <rect
                key={w.weekStart || i}
                x={x}
                y={y}
                width={BAR_W}
                height={h}
                fill={isEmpty ? "var(--color-border)" : "var(--color-fg)"}
              >
                <title>{label}</title>
              </rect>
            );
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[color:var(--color-muted)]">
          <span>{weeks.length}w ago</span>
          <span>{total} total</span>
          <span>today</span>
        </div>
      </div>
      {accountLine && (
        <div className="mt-1 text-[10px] text-[color:var(--color-muted)]">{accountLine}</div>
      )}
    </div>
  );
}
