import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userHelper";
import { validateApiKeyFormat, apiKeyExists } from "@/lib/apiKeyValidator";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
  
  const existingKey = await pool.query(
    "SELECT key_value, usage_count FROM public.user_keys WHERE id=$1 AND user_id=$2",
    [params.id, userId]
  );
  
  if (existingKey.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  if (existingKey.rows[0].usage_count >= 10) {
    return NextResponse.json({ error: "Cannot update inactive key - maximum usage limit reached" }, { status: 400 });
  }

  // Check if new key already exists (and it's not the same key)
  if (existingKey.rows[0].key_value !== key) {
    const keyExists = await apiKeyExists(key);
    if (keyExists) {
      return NextResponse.json({ error: "API key already exists" }, { status: 400 });
    }
  }
  
  const update = await pool.query(
    "UPDATE public.user_keys SET name=$1, key_value=$2 WHERE id=$3 AND user_id=$4 RETURNING id, name, usage_count AS usage, key_value AS key",
    [name, key, params.id, userId]
  );
  if (update.rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(update.rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized - Authentication required" }, { status: 401 });
  }

  const userEmail = session.user.email;
  const userId = await getUserIdByEmail(userEmail);
  
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const del = await pool.query("DELETE FROM public.user_keys WHERE id=$1 AND user_id=$2", [params.id, userId]);
  if (del.rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}


