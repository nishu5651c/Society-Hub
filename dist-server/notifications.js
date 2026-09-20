/** Development-safe boundary: never sends externally, but keeps delivery observable. */
export class DevelopmentEmailProvider {
    async send(input) {
        if (process.env.NODE_ENV !== "test")
            console.info(`[email:development] ${input.to} ${input.subject}`);
    }
}
export const emailProvider = new DevelopmentEmailProvider();
