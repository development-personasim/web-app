import { redirect } from "next/navigation";

import { authModalHref } from "@/lib/modals/auth";

export default function SignupPage() {
  redirect(authModalHref({ method: "email", view: "signup" }));
}
