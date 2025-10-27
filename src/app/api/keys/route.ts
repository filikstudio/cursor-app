import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  console.log("GET /api/keys");
  // Ensure required extension and table exist (Supabase compatible)
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  const { rows } = await pool.query(
    "CREATE TABLE IF NOT EXISTS public.user_keys (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, usage_count integer NOT NULL DEFAULT 0, key_value text NOT NULL);"
  );
  void rows; // noop for type

  const res = await pool.query(
    "SELECT id, name, usage_count AS usage, key_value AS key FROM public.user_keys ORDER BY name ASC"
  );
  return NextResponse.json(res.rows);
}

export async function POST(request: Request) {
  console.log("POST /api/keys");
  const body = await request.json();
  const { name, key } = body ?? {};
  if (!name || !key) return NextResponse.json({ error: "Missing name or key" }, { status: 400 });

  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  await pool.query(
    "CREATE TABLE IF NOT EXISTS public.user_keys (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, usage_count integer NOT NULL DEFAULT 0, key_value text NOT NULL);"
  );
  const insert = await pool.query(
    "INSERT INTO public.user_keys (name, key_value) VALUES ($1, $2) RETURNING id, name, usage_count AS usage, key_value AS key",
    [name, key]
  );
  return NextResponse.json(insert.rows[0], { status: 201 });
}


