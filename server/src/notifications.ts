export interface EmailProvider {
  send(input: { to: string; subject: string; text: string }): Promise<void>;
}

/** Development-safe boundary: never sends externally, but keeps delivery observable. */
export class DevelopmentEmailProvider implements EmailProvider {
  async send(input: { to: string; subject: string; text: string }) {
    if (process.env.NODE_ENV !== "test") console.info(`[email:development] ${input.to} ${input.subject}`);
  }
}

export const emailProvider: EmailProvider = new DevelopmentEmailProvider();
