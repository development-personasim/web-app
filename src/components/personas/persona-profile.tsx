import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PersonaWithCreator } from "@/lib/personas/types";

export function PersonaProfile({
  persona,
  creatorLabel,
  privateLabel,
}: {
  persona: PersonaWithCreator;
  creatorLabel: string;
  privateLabel: string;
}) {
  const fullName = `${persona.firstName} ${persona.lastName}`.trim();
  const initials =
    `${persona.firstName[0] ?? ""}${persona.lastName[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div className="grid gap-6">
      <div className="flex items-start gap-4">
        <Avatar size="lg" className="size-20 after:rounded-full data-[size=lg]:size-20">
          {persona.avatarUrl ? (
            <AvatarImage src={persona.avatarUrl} alt={fullName} />
          ) : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {creatorLabel}
            {persona.creatorUsername
              ? ` @${persona.creatorUsername}`
              : null}
          </p>
          {persona.visibility === "private" ? (
            <p className="text-xs text-muted-foreground">{privateLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
