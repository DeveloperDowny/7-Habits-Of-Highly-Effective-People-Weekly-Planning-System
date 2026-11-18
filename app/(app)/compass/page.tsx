"use client";
import { useState } from "react";
import GoalList from "@/components/GoalList";
import SaveStatus from "@/components/SaveStatus";
import { useProfile } from "@/lib/useProfile";
import { uid, type Role } from "@/lib/types";

const ROLE_IDEAS = ["Builder", "Distributor", "Learner", "Family member", "Friend", "Musician", "Body & health"];

export default function CompassPage() {
  const { profile, update, status, error } = useProfile();
  const [roleDraft, setRoleDraft] = useState("");

  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p className="muted">Loading…</p>;

  const setRole = (id: string, patch: Partial<Role>) =>
    update({ roles: profile.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const addRole = (name: string) => {
    if (!name.trim()) return;
    update({ roles: [...profile.roles, { id: uid(), name: name.trim(), weight: 3, vision: "" }] });
    setRoleDraft("");
  };
  const unusedIdeas = ROLE_IDEAS.filter((n) => !profile.roles.some((r) => r.name === n));

  return (
    <>
      <div className="row" style={{ alignItems: "baseline" }}>
        <h1 className="grow">Compass</h1>
        <SaveStatus status={status} />
      </div>
      <p className="muted">
        Habit 2: Begin with the end in mind. This page changes slowly. Come back to it when the week feels noisy.
      </p>

      <section className="card">
        <span className="step">Personal mission statement</span>
        <h2>Who do I want to be, and what do I want to do?</h2>
        <p className="muted small">
          Write it around principles, not circumstances. Try: what I stand for, how I treat people, the work I want
          to leave behind.
        </p>
        <textarea
          style={{ minHeight: 160 }}
          value={profile.mission}
          onChange={(e) => update({ mission: e.target.value })}
          placeholder="I live by…"
        />
      </section>

      <section className="card">
        <span className="step">North star</span>
        <h2>The one sentence your experiments serve</h2>
        <textarea value={profile.northStar} onChange={(e) => update({ northStar: e.target.value })} />
      </section>

      <section className="card">
        <span className="step">Roles</span>
        <h2>The roles I carry</h2>
        <p className="muted small">
          Keep it to about seven. The weight (1–5) sets how often the selector suggests a role. It&apos;s your
          default allocation, not your boss.
        </p>
        <div className="stack">
          {profile.roles.map((r) => (
            <div key={r.id} className="card" style={{ background: "var(--bg)", padding: 14, marginBottom: 0 }}>
              <div className="row">
                <input
                  className="grow"
                  type="text"
                  value={r.name}
                  aria-label="Role name"
                  onChange={(e) => setRole(r.id, { name: e.target.value })}
                />
                <label className="row small" style={{ margin: 0, gap: 6 }}>
                  Weight
                  <select
                    style={{ width: 64 }}
                    value={r.weight}
                    onChange={(e) => setRole(r.id, { weight: Number(e.target.value) })}
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="btn quiet small"
                  onClick={() => update({ roles: profile.roles.filter((x) => x.id !== r.id) })}
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                style={{ marginTop: 8 }}
                value={r.vision}
                placeholder="In this role, I want to be someone who…"
                onChange={(e) => setRole(r.id, { vision: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="grow"
            type="text"
            value={roleDraft}
            placeholder="Add a role"
            onChange={(e) => setRoleDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRole(roleDraft)}
          />
          <button className="btn" onClick={() => addRole(roleDraft)}>Add</button>
        </div>
        {unusedIdeas.length > 0 && profile.roles.length < 7 && (
          <div className="chips" style={{ marginTop: 10 }}>
            {unusedIdeas.map((n) => (
              <button key={n} className="pill" onClick={() => addRole(n)}>+ {n}</button>
            ))}
          </div>
        )}
      </section>

      <div className="grid2">
        <section className="card">
          <span className="step">Long-term</span>
          <h2>1–5 years</h2>
          <GoalList
            goals={profile.longGoals}
            onChange={(g) => update({ longGoals: g })}
            placeholder="e.g. One product paying my rent"
          />
        </section>
        <section className="card">
          <span className="step">Short-term</span>
          <h2>This quarter</h2>
          <GoalList
            goals={profile.shortGoals}
            onChange={(g) => update({ shortGoals: g })}
            placeholder="e.g. Ship 12 experiments, 3 with real users"
          />
        </section>
      </div>
    </>
  );
}
