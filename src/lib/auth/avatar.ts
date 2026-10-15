type Claims = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export type UserAvatarInfo = {
  email: string | null;
  name: string | null;
  username: string | null;
  imageUrl: string | null;
  initials: string;
};

export function usernameFromClaims(claims: Claims | null) {
  if (!claims) {
    return null;
  }

  const meta = asRecord(claims.user_metadata);
  return asString(meta?.username) ?? asString(claims.username);
}

export function userAvatarFromClaims(claims: Claims | null): UserAvatarInfo {
  if (!claims) {
    return {
      email: null,
      name: null,
      username: null,
      imageUrl: null,
      initials: "?",
    };
  }

  const meta = asRecord(claims.user_metadata);
  const email = asString(claims.email) ?? asString(meta?.email);
  const username = usernameFromClaims(claims);
  const name =
    asString(meta?.full_name) ??
    asString(meta?.name) ??
    asString(claims.name);
  const imageUrl =
    asString(meta?.avatar_url) ??
    asString(meta?.picture) ??
    asString(claims.picture);

  const source = username ?? name ?? email ?? "?";
  const parts = source
    .split(/[\s@._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const initials =
    parts.length >= 2
      ? `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
      : source.slice(0, 2).toUpperCase();

  return { email, name, username, imageUrl, initials };
}
