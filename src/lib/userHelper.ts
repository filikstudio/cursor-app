import pool from "@/lib/db";

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const result = await pool.query(
    "SELECT id FROM public.users WHERE email = $1",
    [email]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0].id;
}

