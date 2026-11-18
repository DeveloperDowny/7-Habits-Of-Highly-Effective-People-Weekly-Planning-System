"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SaveStatus from "@/components/SaveStatus";
import { api, useAutosave } from "@/lib/client";
import { addDays, DAYS, fromIso, iso, mondayOf, short, todayIndex } from "@/lib/dates";
import { evidenceCandidates, weightedPick } from "@/lib/selector";
import { normalizeProfile, normalizeWeek, uid, type Profile, type Rock, type Week } from "@/lib/types";

const SAW = [
  { key: "physical", label: "Physical", hint: "Sleep, movement, food" },
  { key: "mental", label: "Mental", hint: "Read, learn, plan" },
  { key: "social", label: "Social / emotional", hint: "Connection, service" },
  { key: "spiritual", label: "Spiritual", hint: "Values, nature, reflection" },
] as const;

type Saved = { week: string; data: Week };
const saveWeek = (v: Saved) => api.saveWeek(v.week, v.data);

export default function WeekPage() {
  const [weekStart, setWeekStart] = useState(() => iso(mondayOf()));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [error, setError] = useState("");
  const { status, schedule, flush } = useAutosave<Saved>(saveWeek);

  useEffect(() => {
    api.getProfile().then((p) => setProfile(normalizeProfile(p))).catch(() => setError("Couldn't load your data."));
  }, []);

  useEffect(() => {
    let live = true;
    setWeek(null);
    api.getWeek(weekStart)
      .then((w) => live && setWeek(normalizeWeek(w)))
      .catch(() => setError("Couldn't load this week."));
    return () => {
      live = false;
    };
  }, [weekStart]);

  if (error) return <p className="error">{error}</p>;
  if (!profile || !week) return <p className="muted">Loading…</p>;

  const start = fromIso(weekStart);
  const today = todayIndex(start);
  const update = (patch: Partial<Week>) => {
    const next = { ...week, ...patch };
    setWeek(next);
    schedule({ week: weekStart, data: next });
  };
  const go = async (delta: number) => {
    await flush();
    setWeekStart(iso(addDays(start, delta * 7)));
  };

  const activeRoles = profile.roles.filter((r) => week.activeRoles.includes(r.id));
  const roleName = (id: string) => (id === "saw" ? "Sharpen the saw" : profile.roles.find((r) => r.id === id)?.name ?? "Role");
  const setRock = (id: string, patch: Partial<Rock>) =>
    update({ rocks: week.rocks.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const doneCount = week.rocks.filter((r) => r.done).length;

  return (
    <>
      <div className="row" style={{ alignItems: "baseline", flexWrap: "wrap" }}>
        <h1 className="grow">
          Week of {short(start)} – {short(addDays(start, 6))}
        </h1>
        <SaveStatus status={status} />
      </div>
      <div className="row" style={{ marginBottom: 20 }}>
        <button className="btn quiet" onClick={() => go(-1)}>← Previous</button>
        {today === -1 && <button className="btn quiet" onClick={() => { flush(); setWeekStart(iso(mondayOf())); }}>This week</button>}
        <span className="grow" />
        <button className="btn quiet" onClick={() => go(1)}>Next →</button>
      </div>

      {today !== -1 && (
        <TodayFocus
          profile={profile}
          week={week}
          dayIndex={today}
          onChange={(focus) => update({ focus: { ...week.focus, [today]: focus } })}
        />
      )}

      <details className="card" open={!profile.mission}>
        <summary>
          <span className="step">Step 1 · Connect</span>
          <h2>Mission and north star</h2>
        </summary>
        {profile.mission ? (
          <p style={{ whiteSpace: "pre-wrap" }}>{profile.mission}</p>
        ) : (
          <p className="muted">
            You haven&apos;t written a mission yet. <Link href="/compass">Start it on the Compass page.</Link>
          </p>
        )}
        <p className="muted small" style={{ whiteSpace: "pre-wrap" }}>North star: {profile.northStar}</p>
      </details>

      <section className="card">
        <span className="step">Step 2 · Roles</span>
        <h2>Which roles am I picking up this week?</h2>
        {profile.roles.length === 0 ? (
          <p className="muted">
            Add your roles on the <Link href="/compass">Compass page</Link> first.
          </p>
        ) : (
          <div className="chips">
            {profile.roles.map((r) => {
              const on = week.activeRoles.includes(r.id);
              return (
                <button
                  key={r.id}
                  className={`pill ${on ? "on" : ""}`}
                  aria-pressed={on}
                  onClick={() =>
                    update({
                      activeRoles: on ? week.activeRoles.filter((x) => x !== r.id) : [...week.activeRoles, r.id],
                    })
                  }
                >
                  {r.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <span className="step">Step 3 · Big rocks</span>
        <h2>One or two important, not urgent, goals per role</h2>
        <p className="muted small">
          Quadrant II: what would move things forward, but nothing forces you to do it? Prefer shipping and
          distribution over polishing.
        </p>
        {activeRoles.length === 0 && <p className="muted">Pick at least one role above.</p>}
        {activeRoles.map((r) => (
          <RoleRocks
            key={r.id}
            title={r.name}
            vision={r.vision}
            rocks={week.rocks.filter((x) => x.roleId === r.id)}
            onAdd={(text) => update({ rocks: [...week.rocks, { id: uid(), roleId: r.id, text, day: null, done: false }] })}
            onSet={setRock}
            onRemove={(id) => update({ rocks: week.rocks.filter((x) => x.id !== id) })}
          />
        ))}
      </section>

      <section className="card">
        <span className="step">Step 3b · Sharpen the saw</span>
        <h2>Renewal, at a sustainable pace</h2>
        <div className="grid2">
          {SAW.map((s) => (
            <div key={s.key}>
              <label>{s.label}</label>
              <input
                type="text"
                placeholder={s.hint}
                value={week.saw[s.key]}
                onChange={(e) => update({ saw: { ...week.saw, [s.key]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <span className="step">Step 4 · Schedule</span>
        <h2>Put the big rocks in first</h2>
        <p className="muted small">
          Pick a day for each rock in step 3. Use the notes for appointments and anything else that comes up.
          {week.rocks.length > 0 && ` ${doneCount} of ${week.rocks.length} rocks done.`}
        </p>
        <div className="days">
          {DAYS.map((d, i) => {
            const rocks = week.rocks.filter((r) => r.day === i);
            return (
              <div key={d} className={`day ${i === today ? "today" : ""}`}>
                <h3>{d} {addDays(start, i).getDate()}</h3>
                {week.focus[i] && <p className="small" style={{ margin: "0 0 4px" }}>◎ {week.focus[i].chosen}</p>}
                <ul>
                  {rocks.map((r) => (
                    <li key={r.id} className="row" style={{ gap: 6, alignItems: "flex-start" }}>
                      <input
                        type="checkbox"
                        style={{ width: 14, height: 14, marginTop: 4 }}
                        checked={r.done}
                        aria-label={`Done: ${r.text}`}
                        onChange={() => setRock(r.id, { done: !r.done })}
                      />
                      <span style={r.done ? { color: "var(--muted)", textDecoration: "line-through" } : undefined}>
                        {r.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <textarea
                  aria-label={`${d} notes`}
                  value={week.notes[i] ?? ""}
                  onChange={(e) => update({ notes: { ...week.notes, [i]: e.target.value } })}
                />
              </div>
            );
          })}
        </div>
        {week.rocks.some((r) => r.day === null) && (
          <p className="muted small" style={{ marginTop: 10 }}>
            Not scheduled yet: {week.rocks.filter((r) => r.day === null).map((r) => r.text).join(" · ")}
          </p>
        )}
      </section>

      <details className="card">
        <summary>
          <span className="step">Step 5 · Evaluate</span>
          <h2>End-of-week review</h2>
        </summary>
        <div className="field">
          <label>What did I ship, and who did I put it in front of?</label>
          <textarea value={week.review.shipped} onChange={(e) => update({ review: { ...week.review, shipped: e.target.value } })} />
        </div>
        <div className="field">
          <label>What did I learn from customer behaviour, or from failure?</label>
          <textarea value={week.review.learned} onChange={(e) => update({ review: { ...week.review, learned: e.target.value } })} />
        </div>
        <div className="field">
          <label>Activity or progress? Which rocks actually moved something?</label>
          <textarea value={week.review.progress} onChange={(e) => update({ review: { ...week.review, progress: e.target.value } })} />
        </div>
        <div className="field">
          <label>Kill or double down: what will I stop, and what deserves more?</label>
          <textarea value={week.review.decisions} onChange={(e) => update({ review: { ...week.review, decisions: e.target.value } })} />
        </div>
        <p className="muted small">
          Update the decisions on the <Link href="/experiments">Experiments page</Link> so evidence can steer next
          week.
        </p>
      </details>
    </>
  );
}

function RoleRocks({
  title,
  vision,
  rocks,
  onAdd,
  onSet,
  onRemove,
}: {
  title: string;
  vision: string;
  rocks: Rock[];
  onAdd: (text: string) => void;
  onSet: (id: string, patch: Partial<Rock>) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  };
  return (
    <div style={{ marginTop: 16 }}>
      <h3>{title}</h3>
      {vision && <p className="muted small" style={{ margin: "0 0 4px" }}>{vision}</p>}
      <ul className="list">
        {rocks.map((r) => (
          <li key={r.id} className={r.done ? "done" : ""}>
            <input type="checkbox" checked={r.done} aria-label="Done" onChange={() => onSet(r.id, { done: !r.done })} />
            <span className="text grow">{r.text}</span>
            <select
              style={{ width: 96 }}
              aria-label="Day"
              value={r.day ?? ""}
              onChange={(e) => onSet(r.id, { day: e.target.value === "" ? null : Number(e.target.value) })}
            >
              <option value="">Day…</option>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
            <button className="btn quiet small" aria-label="Remove" onClick={() => onRemove(r.id)}>×</button>
          </li>
        ))}
      </ul>
      {rocks.length < 3 && (
        <div className="row" style={{ marginTop: 6 }}>
          <input
            className="grow"
            type="text"
            value={draft}
            placeholder="Add a big rock"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn" onClick={add}>Add</button>
        </div>
      )}
    </div>
  );
}

function TodayFocus({
  profile,
  week,
  dayIndex,
  onChange,
}: {
  profile: Profile;
  week: Week;
  dayIndex: number;
  onChange: (f: Week["focus"][string]) => void;
}) {
  const current = week.focus[dayIndex];
  const pool = profile.roles.filter((r) => week.activeRoles.includes(r.id));
  const evidence = evidenceCandidates(profile.experiments)[0] ?? null;
  const [pending, setPending] = useState<{ random: string; evidence: string | null } | null>(null);

  const roll = () => {
    const pick = weightedPick(pool.length ? pool : profile.roles);
    if (!pick) return;
    if (evidence) setPending({ random: pick.name, evidence: evidence.name });
    else onChange({ random: pick.name, evidence: null, chosen: pick.name });
  };

  return (
    <section className="card" style={{ borderColor: "var(--accent)" }}>
      <span className="step">Today · {DAYS[dayIndex]}</span>
      <h2>Today&apos;s focus</h2>

      {pending ? (
        <>
          <p>
            The selector suggests <b>{pending.random}</b>.
          </p>
          <div className="callout">
            <b>Evidence beats randomness.</b> <i>{pending.evidence}</i> has traction. Another day on it may be worth
            more than a random pick.
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button
              className="btn primary"
              onClick={() => {
                onChange({ ...pending, chosen: pending.evidence! });
                setPending(null);
              }}
            >
              Work on {pending.evidence}
            </button>
            <button
              className="btn"
              onClick={() => {
                onChange({ ...pending, chosen: pending.random });
                setPending(null);
              }}
            >
              Keep {pending.random}
            </button>
          </div>
        </>
      ) : current ? (
        <div className="row">
          <p className="grow" style={{ margin: 0 }}>
            ◎ <b>{current.chosen}</b>
            {current.evidence && current.chosen === current.evidence && (
              <span className="muted small"> (evidence over “{current.random}”)</span>
            )}
          </p>
          <button className="btn quiet small" onClick={roll}>Pick again</button>
        </div>
      ) : (
        <div className="row">
          <p className="grow muted" style={{ margin: 0 }}>
            {profile.roles.length
              ? "Let the weighted selector pick a default. Strong evidence can override it."
              : "Add roles on the Compass page to use the selector."}
          </p>
          <button className="btn primary" onClick={roll} disabled={!profile.roles.length}>Suggest</button>
        </div>
      )}
    </section>
  );
}
