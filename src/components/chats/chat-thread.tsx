import { ChatComposer } from "@/components/chats/chat-composer";
import { ChatMessageBubble } from "@/components/chats/chat-message-bubble";
import type { ChatMessageView } from "@/lib/chats/types";

export function ChatThread({
  chatId,
  messages,
  currentUserId,
  emptyLabel,
}: {
  chatId: string;
  messages: ChatMessageView[];
  currentUserId: string;
  emptyLabel: string;
}) {
  return (
    <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-background">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isOwn={
                message.senderType === "user" &&
                message.senderUserId === currentUserId
              }
            />
          ))
        )}
      </div>
      <ChatComposer chatId={chatId} />
    </div>
  );
}
