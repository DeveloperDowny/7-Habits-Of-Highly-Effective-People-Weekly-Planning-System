export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function mondayOf(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function iso(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fromIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function short(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Index 0–6 of today within the given week, or -1 if not this week. */
export function todayIndex(weekStart: Date) {
  const diff = Math.round((mondayOf().getTime() - weekStart.getTime()) / 86400000);
  if (diff !== 0) return -1;
  return (new Date().getDay() + 6) % 7;
}
