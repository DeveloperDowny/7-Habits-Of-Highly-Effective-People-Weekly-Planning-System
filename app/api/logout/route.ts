import { NextResponse } from "next/server";
import { rpc } from "@/lib/db";
import { COOKIE, getToken } from "@/lib/session";

export async function POST() {
  const token = await getToken();
  if (token) await rpc("planner_logout", { p_token: token }).catch(() => {});
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
