export const MODAL_PARAM = "modal";

export const authModal = {
  id: "auth",
  keys: ["view", "next", "error", "method"] as const,
} as const;

export type AuthModalView = "login" | "signup";
export type AuthModalMethod = "email";

export function parseAuthModalView(value: string | null): AuthModalView {
  return value === "signup" ? "signup" : "login";
}

export function parseAuthModalMethod(
  value: string | null,
): AuthModalMethod | null {
  return value === "email" ? "email" : null;
}

export function buildSearchParams(
  current: URLSearchParams | string,
  updates: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams(
    typeof current === "string" ? current : current.toString(),
  );

  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  return params;
}

export function hrefWithParams(
  pathname: string,
  params: URLSearchParams,
) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
