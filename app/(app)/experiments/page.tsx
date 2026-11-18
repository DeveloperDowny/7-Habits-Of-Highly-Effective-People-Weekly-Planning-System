"use client";
import { useState } from "react";
import SaveStatus from "@/components/SaveStatus";
import { useProfile } from "@/lib/useProfile";
import { uid, type Experiment, type ExperimentStage, type ExperimentStatus } from "@/lib/types";

const STAGES: { id: ExperimentStage; label: string }[] = [
  { id: "ship", label: "Ship" },
  { id: "distribute", label: "Distribute" },
  { id: "measure", label: "Measure" },
  { id: "learn", label: "Learn" },
];

const STATUSES: { id: ExperimentStatus; label: string }[] = [
  { id: "running", label: "Running" },
  { id: "traction", label: "Has traction" },
  { id: "doubled", label: "Doubling down" },
  { id: "killed", label: "Killed" },
];

const ORDER: Record<ExperimentStatus, number> = { doubled: 0, traction: 1, running: 2, killed: 3 };

export default function ExperimentsPage() {
  const { profile, update, status, error } = useProfile();
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p className="muted">Loading…</p>;

  const exps = profile.experiments;
  const set = (id: string, patch: Partial<Experiment>) =>
    update({ experiments: exps.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const add = () => {
    if (!draft.trim()) return;
    const e: Experiment = {
      id: uid(),
      name: draft.trim(),
      hypothesis: "",
      stage: "ship",
      evidence: "",
      status: "running",
      createdAt: new Date().toISOString(),
    };
    update({ experiments: [e, ...exps] });
    setOpenId(e.id);
    setDraft("");
  };

  const live = exps.filter((e) => e.status !== "killed").sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const killed = exps.filter((e) => e.status === "killed");

  const renderExp = (e: Experiment) => {
    const open = openId === e.id;
    return (
      <div key={e.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div className="row">
          <button
            className="linkbtn grow"
            style={{ textAlign: "left", color: "var(--text)", fontWeight: 600 }}
            onClick={() => setOpenId(open ? null : e.id)}
          >
            {e.name}
          </button>
          {e.status === "traction" && <span className="pill on">traction</span>}
          {e.status === "doubled" && <span className="pill on">doubling down</span>}
          {e.status === "running" && <span className="pill">{e.stage}</span>}
        </div>
        {!open && e.evidence && <p className="muted small" style={{ margin: "4px 0 0" }}>{e.evidence}</p>}
        {open && (
          <div style={{ marginTop: 12 }}>
            <div className="field">
              <label>Name</label>
              <input type="text" value={e.name} onChange={(ev) => set(e.id, { name: ev.target.value })} />
            </div>
            <div className="field">
              <label>Hypothesis: whose pain, and what would prove it?</label>
              <textarea
                value={e.hypothesis}
                placeholder="Freelancers waste hours on X. If 10 people sign up from one post, it's real."
                onChange={(ev) => set(e.id, { hypothesis: ev.target.value })}
              />
            </div>
            <div className="field">
              <label>Where in the loop</label>
              <div className="chips">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    className={`pill ${e.stage === s.id ? "on" : ""}`}
                    onClick={() => set(e.id, { stage: s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Evidence: numbers and user behaviour, not opinions</label>
              <textarea
                value={e.evidence}
                placeholder="42 visits, 6 signups, 1 paid"
                onChange={(ev) => set(e.id, { evidence: ev.target.value })}
              />
            </div>
            <div className="field">
              <label>Decision</label>
              <div className="chips">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    className={`pill ${e.status === s.id ? (s.id === "killed" ? "clay" : "on") : ""}`}
                    onClick={() => set(e.id, { status: s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="muted small" style={{ marginTop: 6 }}>
                Marking traction lets this experiment override the random selector on the week page.
              </p>
            </div>
            <div className="row">
              <span className="grow" />
              <button
                className="btn quiet small"
                onClick={() => {
                  if (confirm(`Delete "${e.name}" completely? Killing keeps the lesson; deleting doesn't.`))
                    update({ experiments: exps.filter((x) => x.id !== e.id) });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="row" style={{ alignItems: "baseline" }}>
        <h1 className="grow">Experiments</h1>
        <SaveStatus status={status} />
      </div>
      <p className="muted">
        {exps.length} of 200 started · {killed.length} killed · {exps.filter((e) => e.status === "traction" || e.status === "doubled").length} with traction.
        Small scope, real users, quick decisions.
      </p>

      <div className="row" style={{ marginBottom: 20 }}>
        <input
          className="grow"
          type="text"
          value={draft}
          placeholder="Name a new experiment"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn primary" onClick={add}>Start</button>
      </div>

      {live.length === 0 && <p className="muted">No live experiments yet. Ship something small this week.</p>}
      {live.map(renderExp)}

      {killed.length > 0 && (
        <details className="card">
          <summary><h2>Killed ({killed.length}). Each one taught you something</h2></summary>
          {killed.map(renderExp)}
        </details>
      )}
    </>
  );
}
