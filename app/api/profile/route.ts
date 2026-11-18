import { rpc } from "@/lib/db";
import { withToken } from "@/lib/session";

export async function GET() {
  return withToken((token) => rpc("planner_get_profile", { p_token: token }));
}

export async function PUT(req: Request) {
  const data = await req.json();
  return withToken((token) => rpc("planner_save_profile", { p_token: token, p_data: data }));
}
