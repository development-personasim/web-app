import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PersonaWithCreator } from "@/lib/personas/types";

export function PersonaChatHeader({
  persona,
  privateLabel,
}: {
  persona: PersonaWithCreator;
  privateLabel: string;
}) {
  const fullName = `${persona.firstName} ${persona.lastName}`.trim();
  const initials =
    `${persona.firstName[0] ?? ""}${persona.lastName[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div className="flex items-center gap-3 border-b border-border/80 px-1 pb-4">
      <Avatar size="default">
        {persona.avatarUrl ? (
          <AvatarImage src={persona.avatarUrl} alt={fullName} />
        ) : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {fullName}
        </h1>
        {persona.visibility === "private" ? (
          <p className="text-xs text-muted-foreground">{privateLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
