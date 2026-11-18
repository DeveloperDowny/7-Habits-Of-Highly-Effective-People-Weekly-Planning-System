import { NextResponse } from "next/server";
import { rpc } from "@/lib/db";
import { COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code || typeof code !== "string" || code.length > 40) {
    return NextResponse.json({ error: "Enter your code." }, { status: 400 });
  }
  try {
    const token = await rpc<string | null>("planner_login", { p_code: code });
    if (!token) return NextResponse.json({ error: "That code wasn't recognised." }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
