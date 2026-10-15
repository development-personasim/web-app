import { redirect } from "next/navigation";

import { authModalHref } from "@/lib/modals/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  redirect(
    authModalHref({
      next: params.next,
      error: params.error,
    }),
  );
}
