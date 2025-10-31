import pool from "@/lib/db";

export interface UserData {
  email: string;
  name: string;
}

/**
 * Tracks user login by creating or updating user record in database
 * - Creates new user record with first_login timestamp if user doesn't exist
 * - Updates last_login timestamp if user already exists
 * 
 * @param userData - User email and name from authentication provider
 */
export async function trackUserLogin(userData: UserData): Promise<void> {
  try {
    console.log("Tracking user login:", userData.email);

    // Create users table if it doesn't exist
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

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT email FROM public.users WHERE email = $1",
      [userData.email]
    );

    if (existingUser.rows.length === 0) {
      // First time login - create new user
      await pool.query(
        `INSERT INTO public.users (email, name, first_login, last_login)
         VALUES ($1, $2, now(), now())`,
        [userData.email, userData.name]
      );
      console.log("Created new user record:", userData.email);
    } else {
      // Existing user - update last_login and updated_at
      await pool.query(
        `UPDATE public.users 
         SET last_login = now(), updated_at = now()
         WHERE email = $1`,
        [userData.email]
      );
      console.log("Updated last_login for user:", userData.email);
    }
  } catch (error) {
    console.error("Error tracking user login:", error);
    // Don't throw - we don't want to block authentication if tracking fails
  }
}

