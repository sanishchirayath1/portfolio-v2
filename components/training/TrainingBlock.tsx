type Discipline = {
  since: string;
  note?: string;
};

type Suggestion = {
  name: string;
  when: string;
  note?: string;
};

type Props = {
  swim?: Discipline;
  bike?: Discipline;
  calisthenics?: Discipline;
  suggestion?: Suggestion;
};

function Row({ name, since, note }: { name: string; since: string; note?: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[10rem_9rem_1fr]">
      <span className="text-[color:var(--color-fg)]">{name}</span>
      <span className="text-[color:var(--color-muted)]">since {since}</span>
      {note && <span className="text-[color:var(--color-muted)] sm:text-right">{note}</span>}
    </div>
  );
}

export function TrainingBlock({
  bike = { since: "2005", note: "weekends around Bangalore" },
  swim = { since: "Oct '25", note: "working on 400m" },
  calisthenics = { since: "'26", note: "bodyweight, starting out" },
  suggestion = { name: "triathlon", when: "summer '27", note: "first sprint" },
}: Props) {
  return (
    <section aria-label="training" className="my-8 font-mono text-sm">
      <div className="text-xs text-[color:var(--color-muted)]">$ training</div>
      <div className="mt-4 space-y-1.5">
        <Row name="bike" since={bike.since} note={bike.note} />
        <Row name="swim" since={swim.since} note={swim.note} />
        <Row name="calisthenics" since={calisthenics.since} note={calisthenics.note} />
        <div
          aria-label="aspirational goal"
          className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[10rem_9rem_1fr]"
        >
          <span className="inline-flex items-baseline gap-1">
            <span aria-hidden="true" className="cursor-blink text-[color:var(--color-fg)]">
              ▊
            </span>
            <span className="italic text-[color:var(--color-muted)] opacity-55">
              {suggestion.name}
            </span>
          </span>
          <span className="italic text-[color:var(--color-muted)] opacity-55">
            by {suggestion.when}
          </span>
          <span className="sm:text-right">
            {suggestion.note && (
              <span className="italic text-[color:var(--color-muted)] opacity-55">
                {suggestion.note}
              </span>
            )}{" "}
            <span
              aria-hidden="true"
              className="text-[10px] tracking-tight text-[color:var(--color-muted)] opacity-70"
            >
              ⇥ tab
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
