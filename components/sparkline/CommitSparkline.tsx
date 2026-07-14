import type { ContributionWeek } from "@/lib/github";

type Props = {
  weeks: ContributionWeek[];
  total: number;
  logins?: readonly string[];
};

const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;
const ROWS = 7;

function formatDay(iso: string): string {
  if (!iso) return "unknown";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function dayOfWeek(iso: string): number {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? 0 : d.getUTCDay();
}

function buildTiers(counts: number[]): (count: number) => number {
  const active = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (active.length === 0) return () => 0;
  const q = (p: number) => active[Math.min(active.length - 1, Math.floor(active.length * p))] ?? 0;
  const t1 = q(0.25);
  const t2 = q(0.5);
  const t3 = q(0.75);
  return (count: number) => {
    if (count <= 0) return 0;
    if (count >= t3 && t3 > 0) return 4;
    if (count >= t2 && t2 > 0) return 3;
    if (count >= t1 && t1 > 0) return 2;
    return 1;
  };
}

const TIER_OPACITY: Record<number, number> = {
  1: 0.28,
  2: 0.5,
  3: 0.75,
  4: 1,
};

export function CommitSparkline({ weeks, total, logins = [] }: Props) {
  if (weeks.length === 0) return null;

  const allCounts = weeks.flatMap((w) => w.days.map((d) => d.count));
  const tierFor = buildTiers(allCounts);

  const width = weeks.length * STEP - GAP;
  const height = ROWS * STEP - GAP;

  const accountLine =
    logins.length > 1
      ? `${logins.map((l) => `@${l}`).join(" + ")} · merged`
      : logins.length === 1
        ? `@${logins[0]}`
        : "";

  return (
    <div className="font-mono text-xs">
      <div className="text-[color:var(--color-muted)]">
        # contributions · last {weeks.length} weeks
      </div>
      <div className="mt-2" style={{ maxWidth: width }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="block h-auto w-full"
          role="img"
          aria-label={`Contribution grid; ${total} contributions across last ${weeks.length} weeks`}
        >
          {weeks.map((week, wi) =>
            week.days.map((day) => {
              const t = tierFor(day.count);
              const row = dayOfWeek(day.date);
              const x = wi * STEP;
              const y = row * STEP;
              const label = `${formatDay(day.date)} · ${day.count} contribution${
                day.count === 1 ? "" : "s"
              }`;
              const isEmpty = t === 0;
              return (
                <rect
                  key={day.date || `${wi}-${row}`}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={1.5}
                  fill={isEmpty ? "var(--color-border)" : "var(--color-accent)"}
                  fillOpacity={isEmpty ? 1 : TIER_OPACITY[t]}
                >
                  <title>{label}</title>
                </rect>
              );
            }),
          )}
        </svg>
        <div className="mt-2 flex items-center justify-between text-[color:var(--color-muted)]">
          <span>{weeks.length}w ago</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[10px]">less</span>
            {[0, 1, 2, 3, 4].map((t) => (
              <span
                key={t}
                aria-hidden
                className="inline-block"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: t === 0 ? "var(--color-border)" : "var(--color-accent)",
                  opacity: t === 0 ? 1 : TIER_OPACITY[t],
                }}
              />
            ))}
            <span className="text-[10px]">more</span>
          </span>
          <span>today</span>
        </div>
        <div className="mt-1 text-[color:var(--color-muted)]">{total} total</div>
      </div>
      {accountLine && (
        <div className="mt-1 text-[10px] text-[color:var(--color-muted)]">{accountLine}</div>
      )}
    </div>
  );
}
