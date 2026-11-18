export type Role = {
  id: string;
  name: string;
  weight: number; // 1–5, used by the weighted selector
  vision: string; // Habit 2: who I want to be in this role
};

export type Goal = { id: string; text: string; done: boolean };

export type ExperimentStage = "ship" | "distribute" | "measure" | "learn";
export type ExperimentStatus = "running" | "traction" | "doubled" | "killed";

export type Experiment = {
  id: string;
  name: string;
  hypothesis: string; // the customer pain + what I'm testing
  stage: ExperimentStage;
  evidence: string; // numbers, not opinions
  status: ExperimentStatus;
  createdAt: string;
};

export type Profile = {
  mission: string;
  northStar: string;
  roles: Role[];
  longGoals: Goal[];
  shortGoals: Goal[];
  experiments: Experiment[];
};

export type Rock = {
  id: string;
  roleId: string; // role id, or "saw"
  text: string;
  day: number | null; // 0 = Monday … 6 = Sunday
  done: boolean;
};

export type Focus = {
  random: string; // what the selector picked
  evidence: string | null; // an experiment with traction, if any
  chosen: string; // what I actually committed to
};

export type Week = {
  activeRoles: string[];
  rocks: Rock[];
  saw: { physical: string; mental: string; social: string; spiritual: string };
  notes: Record<string, string>; // per day index
  focus: Record<string, Focus>; // per day index
  review: {
    shipped: string;
    learned: string;
    progress: string; // activity vs progress
    decisions: string; // kill or double down
  };
};

export const DEFAULT_NORTH_STAR =
  "Run 200 small, real-world experiments to discover projects with meaningful economic potential, while continuously improving my ability to build, distribute, learn, and identify winners.";

export function normalizeProfile(p: Partial<Profile> | null | undefined): Profile {
  return {
    mission: p?.mission ?? "",
    northStar: p?.northStar ?? DEFAULT_NORTH_STAR,
    roles: p?.roles ?? [],
    longGoals: p?.longGoals ?? [],
    shortGoals: p?.shortGoals ?? [],
    experiments: p?.experiments ?? [],
  };
}

export function normalizeWeek(w: Partial<Week> | null | undefined): Week {
  return {
    activeRoles: w?.activeRoles ?? [],
    rocks: w?.rocks ?? [],
    saw: { physical: "", mental: "", social: "", spiritual: "", ...(w?.saw ?? {}) },
    notes: w?.notes ?? {},
    focus: w?.focus ?? {},
    review: { shipped: "", learned: "", progress: "", decisions: "", ...(w?.review ?? {}) },
  };
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
