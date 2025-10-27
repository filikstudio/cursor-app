import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { name, key } = body ?? {};
  if (!name || !key) return NextResponse.json({ error: "Missing name or key" }, { status: 400 });
  const update = await pool.query(
    "UPDATE public.user_keys SET name=$1, key_value=$2 WHERE id=$3 RETURNING id, name, usage_count AS usage, key_value AS key",
    [name, key, params.id]
  );
  if (update.rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(update.rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const del = await pool.query("DELETE FROM public.user_keys WHERE id=$1", [params.id]);
  if (del.rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}


