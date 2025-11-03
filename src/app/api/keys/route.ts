import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userHelper";
import { validateApiKeyFormat, apiKeyExists } from "@/lib/apiKeyValidator";

export async function GET() {
  console.log("GET /api/keys");
  
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized - Authentication required" }, { status: 401 });
  }

  const userEmail = session.user.email;
  const userId = await getUserIdByEmail(userEmail);
  
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      first_login timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  
  await pool.query(
    "CREATE TABLE IF NOT EXISTS public.user_keys (" +
    "id uuid PRIMARY KEY DEFAULT gen_random_uuid()," +
    "name text NOT NULL," +
    "usage_count integer NOT NULL DEFAULT 0," +
    "key_value text NOT NULL," +
    "user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE" +
    ");"
  );

  const res = await pool.query(
    "SELECT id, name, usage_count AS usage, key_value AS key FROM public.user_keys WHERE user_id = $1 ORDER BY name ASC",
    [userId]
  );
  return NextResponse.json(res.rows);
}

export async function POST(request: Request) {
  console.log("POST /api/keys");
  
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized - Authentication required" }, { status: 401 });
  }

  const userEmail = session.user.email;
  const userId = await getUserIdByEmail(userEmail);
  
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, key } = body ?? {};
  if (!name || !key) return NextResponse.json({ error: "Missing name or key" }, { status: 400 });

  // Validate API key format
  const formatValidation = validateApiKeyFormat(key);
  if (!formatValidation.valid) {
    return NextResponse.json({ error: formatValidation.error }, { status: 400 });
  }

  // Check if key already exists
  const keyExists = await apiKeyExists(key);
  if (keyExists) {
    return NextResponse.json({ error: "API key already exists" }, { status: 400 });
  }

  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      first_login timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  
  await pool.query(
    "CREATE TABLE IF NOT EXISTS public.user_keys (" +
    "id uuid PRIMARY KEY DEFAULT gen_random_uuid()," +
    "name text NOT NULL," +
    "usage_count integer NOT NULL DEFAULT 0," +
    "key_value text NOT NULL," +
    "user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE" +
    ");"
  );
  
  const insert = await pool.query(
    "INSERT INTO public.user_keys (name, key_value, user_id) VALUES ($1, $2, $3) RETURNING id, name, usage_count AS usage, key_value AS key",
    [name, key, userId]
  );
  return NextResponse.json(insert.rows[0], { status: 201 });
}


