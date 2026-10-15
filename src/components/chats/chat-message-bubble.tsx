import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessageView } from "@/lib/chats/types";
import { cn } from "@/lib/utils";

export function ChatMessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessageView;
  isOwn: boolean;
}) {
  const initials = message.senderName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "flex max-w-[85%] gap-2",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        {message.senderAvatarUrl ? (
          <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} />
        ) : null}
        <AvatarFallback>{initials || "?"}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "grid gap-1 rounded-2xl px-3 py-2 text-sm",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {!isOwn ? (
          <p className="text-xs font-medium opacity-80">{message.senderName}</p>
        ) : null}
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
    </div>
  );
}
