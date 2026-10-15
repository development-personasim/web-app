export type PersonaVisibility = "private" | "public";

export type Persona = {
  id: string;
  creatorId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  visibility: PersonaVisibility;
  createdAt: string;
  updatedAt: string;
};

export type PersonaWithCreator = Persona & {
  creatorUsername: string | null;
};
