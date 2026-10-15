import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PersonaWithCreator } from "@/lib/personas/types";
import { cn } from "@/lib/utils";

export function PersonaList({
  personas,
  hrefForPersona,
  emptyLabel,
  privateLabel,
}: {
  personas: PersonaWithCreator[];
  hrefForPersona: (id: string) => string;
  emptyLabel: string;
  privateLabel: string;
}) {
  if (personas.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-2">
      {personas.map((persona) => {
        const fullName = `${persona.firstName} ${persona.lastName}`.trim();
        const initials =
          `${persona.firstName[0] ?? ""}${persona.lastName[0] ?? ""}`.toUpperCase() ||
          "?";

        return (
          <li key={persona.id}>
            <Link
              href={hrefForPersona(persona.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border/80 px-3 py-2.5",
                "transition-colors hover:bg-muted/50",
              )}
            >
              <Avatar size="sm">
                {persona.avatarUrl ? (
                  <AvatarImage src={persona.avatarUrl} alt={fullName} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fullName}</p>
                {persona.visibility === "private" ? (
                  <p className="text-xs text-muted-foreground">{privateLabel}</p>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
