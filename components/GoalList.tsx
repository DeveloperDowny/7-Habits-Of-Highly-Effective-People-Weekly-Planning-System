"use client";
import { useState } from "react";
import { uid, type Goal } from "@/lib/types";

export default function GoalList({
  goals,
  onChange,
  placeholder,
}: {
  goals: Goal[];
  onChange: (g: Goal[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...goals, { id: uid(), text: draft.trim(), done: false }]);
    setDraft("");
  };
  return (
    <div>
      <ul className="list">
        {goals.map((g) => (
          <li key={g.id} className={g.done ? "done" : ""}>
            <input
              type="checkbox"
              checked={g.done}
              aria-label="Done"
              onChange={() => onChange(goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)))}
            />
            <span className="text grow">{g.text}</span>
            <button className="btn quiet small" onClick={() => onChange(goals.filter((x) => x.id !== g.id))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="row" style={{ marginTop: 8 }}>
        <input
          className="grow"
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn" onClick={add}>Add</button>
      </div>
    </div>
  );
}
