import "server-only";

import { randomUUID } from "crypto";
import type { PoolClient } from "pg";

import { ensureProfilesTable } from "@/lib/account/profiles";
import type {
  Chat,
  ChatKind,
  ChatMember,
  ChatMemberRole,
  ChatMemberType,
  ChatMessage,
  ChatMessageView,
} from "@/lib/chats/types";
import { query, withTransaction } from "@/lib/db";
import { ensurePersonasTable } from "@/lib/personas/db";

let ensured = false;

type ChatRow = {
  id: string;
  kind: ChatKind;
  title: string | null;
  direct_user_id: string | null;
  direct_persona_id: string | null;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
};

type MemberRow = {
  chat_id: string;
  member_type: ChatMemberType;
  user_id: string | null;
  persona_id: string | null;
  role: ChatMemberRole;
  joined_at: Date | string;
};

type MessageRow = {
  id: string;
  chat_id: string;
  sender_type: ChatMemberType;
  sender_user_id: string | null;
  sender_persona_id: string | null;
  body: string;
  created_at: Date | string;
};

type MessageViewRow = MessageRow & {
  sender_name: string | null;
  sender_avatar_url: string | null;
};

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapChat(row: ChatRow): Chat {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    directUserId: row.direct_user_id,
    directPersonaId: row.direct_persona_id,
    createdBy: row.created_by,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapMember(row: MemberRow): ChatMember {
  return {
    chatId: row.chat_id,
    memberType: row.member_type,
    userId: row.user_id,
    personaId: row.persona_id,
    role: row.role,
    joinedAt: toIso(row.joined_at),
  };
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    chatId: row.chat_id,
    senderType: row.sender_type,
    senderUserId: row.sender_user_id,
    senderPersonaId: row.sender_persona_id,
    body: row.body,
    createdAt: toIso(row.created_at),
  };
}

function mapMessageView(row: MessageViewRow): ChatMessageView {
  return {
    ...mapMessage(row),
    senderName: row.sender_name?.trim() || "Unknown",
    senderAvatarUrl: row.sender_avatar_url,
  };
}

async function clientQuery<T extends Record<string, unknown>>(
  client: PoolClient,
  text: string,
  params: readonly unknown[] = [],
) {
  return client.query<T>(text, [...params]);
}

export async function ensureChatsTables() {
  if (ensured) {
    return;
  }

  await ensureProfilesTable();
  await ensurePersonasTable();

  await query(`
    create table if not exists public.chats (
      id uuid primary key,
      kind text not null check (kind in ('direct', 'group')),
      title text,
      direct_user_id uuid,
      direct_persona_id uuid,
      created_by uuid not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint chats_direct_pair_check check (
        (kind = 'direct'
          and direct_user_id is not null
          and direct_persona_id is not null
          and title is null)
        or
        (kind = 'group'
          and direct_user_id is null
          and direct_persona_id is null)
      )
    )
  `);

  await query(`
    create unique index if not exists chats_direct_pair_unique
      on public.chats (direct_user_id, direct_persona_id)
      where kind = 'direct'
  `);

  await query(`
    create table if not exists public.chat_members (
      chat_id uuid not null references public.chats (id) on delete cascade,
      member_type text not null check (member_type in ('user', 'persona')),
      user_id uuid,
      persona_id uuid,
      role text not null default 'member'
        check (role in ('owner', 'member')),
      joined_at timestamptz not null default now(),
      constraint chat_members_identity_check check (
        (member_type = 'user' and user_id is not null and persona_id is null)
        or
        (member_type = 'persona' and persona_id is not null and user_id is null)
      )
    )
  `);

  await query(`
    create unique index if not exists chat_members_user_unique
      on public.chat_members (chat_id, user_id)
      where user_id is not null
  `);

  await query(`
    create unique index if not exists chat_members_persona_unique
      on public.chat_members (chat_id, persona_id)
      where persona_id is not null
  `);

  await query(`
    create index if not exists chat_members_user_id_idx
      on public.chat_members (user_id)
      where user_id is not null
  `);

  await query(`
    create table if not exists public.chat_messages (
      id uuid primary key,
      chat_id uuid not null references public.chats (id) on delete cascade,
      sender_type text not null check (sender_type in ('user', 'persona')),
      sender_user_id uuid,
      sender_persona_id uuid,
      body text not null,
      created_at timestamptz not null default now(),
      constraint chat_messages_sender_check check (
        (sender_type = 'user'
          and sender_user_id is not null
          and sender_persona_id is null)
        or
        (sender_type = 'persona'
          and sender_persona_id is not null
          and sender_user_id is null)
      )
    )
  `);

  await query(`
    create index if not exists chat_messages_chat_id_created_at_idx
      on public.chat_messages (chat_id, created_at)
  `);

  ensured = true;
}

async function insertMember(
  client: PoolClient,
  input: {
    chatId: string;
    memberType: ChatMemberType;
    userId?: string | null;
    personaId?: string | null;
    role?: ChatMemberRole;
  },
) {
  await clientQuery(
    client,
    `
      insert into public.chat_members (
        chat_id, member_type, user_id, persona_id, role
      )
      values ($1, $2, $3, $4, $5)
    `,
    [
      input.chatId,
      input.memberType,
      input.userId ?? null,
      input.personaId ?? null,
      input.role ?? "member",
    ],
  );
}

export async function getOrCreateDirectPersonaChat(input: {
  userId: string;
  personaId: string;
}) {
  await ensureChatsTables();

  const existing = await query<ChatRow>(
    `
      select *
      from public.chats
      where kind = 'direct'
        and direct_user_id = $1
        and direct_persona_id = $2
      limit 1
    `,
    [input.userId, input.personaId],
  );

  if (existing.rows[0]) {
    return mapChat(existing.rows[0]);
  }

  return withTransaction(async (client) => {
    const chatId = randomUUID();

    const inserted = await clientQuery<ChatRow>(
      client,
      `
        insert into public.chats (
          id, kind, title, direct_user_id, direct_persona_id, created_by
        )
        values ($1, 'direct', null, $2, $3, $2)
        on conflict (direct_user_id, direct_persona_id)
          where kind = 'direct'
          do nothing
        returning *
      `,
      [chatId, input.userId, input.personaId],
    );

    if (inserted.rows[0]) {
      await insertMember(client, {
        chatId,
        memberType: "user",
        userId: input.userId,
        role: "owner",
      });
      await insertMember(client, {
        chatId,
        memberType: "persona",
        personaId: input.personaId,
        role: "member",
      });
      return mapChat(inserted.rows[0]);
    }

    const raced = await clientQuery<ChatRow>(
      client,
      `
        select *
        from public.chats
        where kind = 'direct'
          and direct_user_id = $1
          and direct_persona_id = $2
        limit 1
      `,
      [input.userId, input.personaId],
    );

    if (!raced.rows[0]) {
      throw new Error("Could not create direct chat.");
    }

    return mapChat(raced.rows[0]);
  });
}

/** Foundation for multi-user / multi-persona chats. */
export async function createGroupChat(input: {
  createdBy: string;
  title?: string | null;
  userIds?: string[];
  personaIds?: string[];
}) {
  await ensureChatsTables();

  const userIds = Array.from(
    new Set([input.createdBy, ...(input.userIds ?? [])]),
  );
  const personaIds = Array.from(new Set(input.personaIds ?? []));

  if (userIds.length + personaIds.length < 2) {
    throw new Error("A group chat needs at least two members.");
  }

  return withTransaction(async (client) => {
    const chatId = randomUUID();

    const inserted = await clientQuery<ChatRow>(
      client,
      `
        insert into public.chats (
          id, kind, title, direct_user_id, direct_persona_id, created_by
        )
        values ($1, 'group', $2, null, null, $3)
        returning *
      `,
      [chatId, input.title?.trim() || null, input.createdBy],
    );

    const chat = mapChat(inserted.rows[0]!);

    for (const userId of userIds) {
      await insertMember(client, {
        chatId,
        memberType: "user",
        userId,
        role: userId === input.createdBy ? "owner" : "member",
      });
    }

    for (const personaId of personaIds) {
      await insertMember(client, {
        chatId,
        memberType: "persona",
        personaId,
        role: "member",
      });
    }

    return chat;
  });
}

export async function getChatById(chatId: string) {
  await ensureChatsTables();

  const result = await query<ChatRow>(
    `select * from public.chats where id = $1 limit 1`,
    [chatId],
  );

  return result.rows[0] ? mapChat(result.rows[0]) : null;
}

export async function isUserChatMember(chatId: string, userId: string) {
  await ensureChatsTables();

  const result = await query<{ ok: number }>(
    `
      select 1 as ok
      from public.chat_members
      where chat_id = $1
        and member_type = 'user'
        and user_id = $2
      limit 1
    `,
    [chatId, userId],
  );

  return Boolean(result.rows[0]);
}

export async function listChatMembers(chatId: string) {
  await ensureChatsTables();

  const result = await query<MemberRow>(
    `
      select *
      from public.chat_members
      where chat_id = $1
      order by joined_at asc
    `,
    [chatId],
  );

  return result.rows.map(mapMember);
}

export async function listChatMessages(
  chatId: string,
  options: { limit?: number } = {},
) {
  await ensureChatsTables();

  const limit = options.limit ?? 100;

  const result = await query<MessageViewRow>(
    `
      select
        m.*,
        case
          when m.sender_type = 'user' then coalesce(pr.username, 'User')
          else trim(both from concat(p.first_name, ' ', p.last_name))
        end as sender_name,
        case
          when m.sender_type = 'persona' then p.avatar_url
          else null
        end as sender_avatar_url
      from public.chat_messages m
      left join public.profiles pr
        on m.sender_type = 'user' and pr.id = m.sender_user_id
      left join public.personas p
        on m.sender_type = 'persona' and p.id = m.sender_persona_id
      where m.chat_id = $1
      order by m.created_at asc
      limit $2
    `,
    [chatId, limit],
  );

  return result.rows.map(mapMessageView);
}

export async function insertChatMessage(input: {
  chatId: string;
  senderType: ChatMemberType;
  senderUserId?: string | null;
  senderPersonaId?: string | null;
  body: string;
}) {
  await ensureChatsTables();

  const id = randomUUID();

  const result = await query<MessageRow>(
    `
      insert into public.chat_messages (
        id, chat_id, sender_type, sender_user_id, sender_persona_id, body
      )
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `,
    [
      id,
      input.chatId,
      input.senderType,
      input.senderUserId ?? null,
      input.senderPersonaId ?? null,
      input.body,
    ],
  );

  await query(
    `update public.chats set updated_at = now() where id = $1`,
    [input.chatId],
  );

  return mapMessage(result.rows[0]!);
}
