export type ChatKind = "direct" | "group";

export type ChatMemberType = "user" | "persona";

export type ChatMemberRole = "owner" | "member";

export type Chat = {
  id: string;
  kind: ChatKind;
  title: string | null;
  directUserId: string | null;
  directPersonaId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMember = {
  chatId: string;
  memberType: ChatMemberType;
  userId: string | null;
  personaId: string | null;
  role: ChatMemberRole;
  joinedAt: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderType: ChatMemberType;
  senderUserId: string | null;
  senderPersonaId: string | null;
  body: string;
  createdAt: string;
};

export type ChatMessageView = ChatMessage & {
  senderName: string;
  senderAvatarUrl: string | null;
};
