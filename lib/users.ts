import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

const toDate = (value: unknown) => (value instanceof Date ? value : new Date(value as string));

async function ensureUsersTable() {
  await sql.query(CREATE_USERS_TABLE);
}

export async function createUser(email: string, password: string) {
  await ensureUsersTable();
  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO users (id, email, password_hash)
    VALUES (${id}, ${email}, ${hash});
  `;
  return { id, email };
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  await ensureUsersTable();
  const { rows } = await sql`
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE email = ${email}
    LIMIT 1;
  `;
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: toDate(row.created_at)
  };
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email };
}
