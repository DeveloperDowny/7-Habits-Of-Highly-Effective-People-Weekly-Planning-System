// Server-only: talks to Supabase through locked-down RPC functions.
// Tables have RLS with no policies; every call is scoped by the session token.

export class RpcError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new RpcError(500, "Supabase env vars missing");

  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new RpcError(text.includes("unauthorized") ? 401 : 500, text);
  }
  return (text ? JSON.parse(text) : null) as T;
}
