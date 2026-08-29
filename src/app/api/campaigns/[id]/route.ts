import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("campaigns").select("*").eq("id", ctx.params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ row: data });
}
