"use client";
import { useEffect, useState } from "react";
import { api, useAutosave } from "./client";
import { normalizeProfile, type Profile } from "./types";

/** Loads the profile once and autosaves every change. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const { status, schedule } = useAutosave<Profile>(api.saveProfile);

  useEffect(() => {
    api.getProfile().then((p) => setProfile(normalizeProfile(p))).catch(() => setError("Couldn't load your data."));
  }, []);

  const update = (patch: Partial<Profile>) => {
    if (!profile) return;
    const next = { ...profile, ...patch };
    setProfile(next);
    schedule(next);
  };

  return { profile, update, status, error };
}
