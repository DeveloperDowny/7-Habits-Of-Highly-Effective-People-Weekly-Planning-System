import type { Experiment, Role } from "./types";

/** Default allocation: weighted random pick among this week's roles. */
export function weightedPick(roles: Role[]): Role | null {
  const pool = roles.filter((r) => r.weight > 0);
  const total = pool.reduce((s, r) => s + r.weight, 0);
  if (!total) return null;
  let n = Math.random() * total;
  for (const r of pool) {
    n -= r.weight;
    if (n < 0) return r;
  }
  return pool[pool.length - 1];
}

/** Evidence beats randomness: experiments with real traction can override. */
export function evidenceCandidates(experiments: Experiment[]) {
  const rank = { doubled: 0, traction: 1 } as Record<string, number>;
  return experiments
    .filter((e) => e.status === "doubled" || e.status === "traction")
    .sort((a, b) => rank[a.status] - rank[b.status]);
}
