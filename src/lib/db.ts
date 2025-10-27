import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local");
}

const pool = global.__pgPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

if (!global.__pgPool) {
  global.__pgPool = pool;
}

export default pool;


