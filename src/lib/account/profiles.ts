import "server-only";

import { query } from "@/lib/db";

let ensured = false;

export async function ensureProfilesTable() {
  if (ensured) {
    return;
  }

  await query(`
    create table if not exists public.profiles (
      id uuid primary key,
      username text not null,
      updated_at timestamptz not null default now()
    )
  `);

  await query(`
    create unique index if not exists profiles_username_lower_unique
      on public.profiles (lower(username))
  `);

  ensured = true;
}

export async function getProfileUsername(userId: string) {
  await ensureProfilesTable();

  const result = await query<{ username: string }>(
    `select username from public.profiles where id = $1 limit 1`,
    [userId],
  );

  return result.rows[0]?.username ?? null;
}

export async function upsertProfileUsername(userId: string, username: string) {
  await ensureProfilesTable();

  await query(
    `
      insert into public.profiles (id, username, updated_at)
      values ($1, $2, now())
      on conflict (id) do update
        set username = excluded.username,
            updated_at = now()
    `,
    [userId, username],
  );
}

export async function deleteProfile(userId: string) {
  await ensureProfilesTable();
  await query(`delete from public.profiles where id = $1`, [userId]);
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
