import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { RpcError } from "./db";

export const COOKIE = "planner_token";

export async function getToken() {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

/** Wraps a route handler: requires a session token, maps errors to JSON. */
export async function withToken(handler: (token: string) => Promise<unknown>) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const result = await handler(token);
    return NextResponse.json(result ?? { ok: true });
  } catch (e) {
    const status = e instanceof RpcError ? e.status : 500;
    if (status === 500) console.error(e);
    return NextResponse.json({ error: status === 401 ? "unauthorized" : "server error" }, { status });
  }
}
