import type { SaveStatus as S } from "@/lib/client";

const TEXT: Record<S, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save. Check your connection.",
};

export default function SaveStatus({ status }: { status: S }) {
  return <div className="status" aria-live="polite">{TEXT[status]}</div>;
}
