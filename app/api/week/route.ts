import { NextResponse } from "next/server";
import { rpc } from "@/lib/db";
import { withToken } from "@/lib/session";

const isDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function GET(req: Request) {
  const w = new URL(req.url).searchParams.get("w");
  if (!isDate(w)) return NextResponse.json({ error: "bad week" }, { status: 400 });
  return withToken((token) => rpc("planner_get_week", { p_token: token, p_week: w }));
}

export async function PUT(req: Request) {
  const { week, data } = (await req.json()) as { week?: string; data?: unknown };
  if (!isDate(week)) return NextResponse.json({ error: "bad week" }, { status: 400 });
  return withToken((token) => rpc("planner_save_week", { p_token: token, p_week: week, p_data: data }));
}
