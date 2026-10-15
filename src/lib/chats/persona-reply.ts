import "server-only";

/** Temporary stub until real persona LLM replies are wired. */
export function buildStubPersonaReply(input: {
  firstName: string;
  userMessage: string;
}) {
  const preview = input.userMessage.trim().slice(0, 120);
  return `${input.firstName}: I heard you — “${preview}”. Full AI replies will plug in here.`;
}
