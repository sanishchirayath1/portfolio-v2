const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonth(iso: string): string {
  if (iso === "present") return "Present";
  const [year, month] = iso.split("-");
  if (!year || !month) return iso;
  const idx = Number.parseInt(month, 10) - 1;
  const name = MONTH_SHORT[idx];
  if (!name) return iso;
  return `${name} ${year}`;
}
