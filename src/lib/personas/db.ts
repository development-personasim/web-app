import "server-only";

import { ensureProfilesTable } from "@/lib/account/profiles";
import { query } from "@/lib/db";
import type {
  Persona,
  PersonaVisibility,
  PersonaWithCreator,
} from "@/lib/personas/types";

let ensured = false;

type PersonaRow = {
  id: string;
  creator_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  visibility: PersonaVisibility;
  created_at: Date | string;
  updated_at: Date | string;
  creator_username?: string | null;
};

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapPersona(row: PersonaRow): Persona {
  return {
    id: row.id,
    creatorId: row.creator_id,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    visibility: row.visibility,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapPersonaWithCreator(row: PersonaRow): PersonaWithCreator {
  return {
    ...mapPersona(row),
    creatorUsername: row.creator_username ?? null,
  };
}

export async function ensurePersonasTable() {
  if (ensured) {
    return;
  }

  await ensureProfilesTable();

  await query(`
    create table if not exists public.personas (
      id uuid primary key,
      creator_id uuid not null,
      first_name text not null,
      last_name text not null,
      avatar_url text,
      visibility text not null default 'private'
        check (visibility in ('private', 'public')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await query(`
    create index if not exists personas_creator_id_idx
      on public.personas (creator_id)
  `);

  ensured = true;
}

export async function createPersona(input: {
  id: string;
  creatorId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  visibility?: PersonaVisibility;
}) {
  await ensurePersonasTable();

  const visibility = input.visibility ?? "private";

  const result = await query<PersonaRow>(
    `
      insert into public.personas (
        id, creator_id, first_name, last_name, avatar_url, visibility
      )
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `,
    [
      input.id,
      input.creatorId,
      input.firstName,
      input.lastName,
      input.avatarUrl ?? null,
      visibility,
    ],
  );

  return mapPersona(result.rows[0]!);
}

export async function listPersonasByCreator(creatorId: string) {
  await ensurePersonasTable();

  const result = await query<PersonaRow>(
    `
      select
        p.*,
        pr.username as creator_username
      from public.personas p
      left join public.profiles pr on pr.id = p.creator_id
      where p.creator_id = $1
      order by p.created_at desc
    `,
    [creatorId],
  );

  return result.rows.map(mapPersonaWithCreator);
}

export async function getPersonaById(personaId: string) {
  await ensurePersonasTable();

  const result = await query<PersonaRow>(
    `
      select
        p.*,
        pr.username as creator_username
      from public.personas p
      left join public.profiles pr on pr.id = p.creator_id
      where p.id = $1
      limit 1
    `,
    [personaId],
  );

  const row = result.rows[0];
  return row ? mapPersonaWithCreator(row) : null;
}
