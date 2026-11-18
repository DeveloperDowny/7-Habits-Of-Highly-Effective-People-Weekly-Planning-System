"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile, Week } from "./types";

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("unauthorized");
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const api = {
  getProfile: () => call<Partial<Profile>>("/api/profile"),
  saveProfile: (p: Profile) =>
    call("/api/profile", { method: "PUT", body: JSON.stringify(p), keepalive: true }),
  getWeek: (w: string) => call<Partial<Week>>(`/api/week?w=${w}`),
  saveWeek: (week: string, data: Week) =>
    call("/api/week", { method: "PUT", body: JSON.stringify({ week, data }), keepalive: true }),
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave. `schedule(v)` queues a save; `flush()` saves now.
 * Pending changes are flushed on unmount and when the tab is hidden.
 */
export function useAutosave<T>(save: (v: T) => Promise<unknown>, delay = 700) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pending = useRef<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const v = pending.current;
    if (v === null) return;
    pending.current = null;
    setStatus("saving");
    try {
      await saveRef.current(v);
      setStatus(pending.current === null ? "saved" : "saving");
    } catch {
      setStatus("error");
    }
  }, []);

  const schedule = useCallback(
    (v: T) => {
      pending.current = v;
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay]
  );

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  return { status, schedule, flush };
}
