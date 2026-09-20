import { HttpError } from "./errors.js";
/**
 * Deliberately refuses to simulate a successful charge. Replace this adapter
 * with a PCI-compliant provider implementation in a production deployment.
 */
export class DevelopmentPaymentProvider {
    name = "development";
    async createCheckout(_input) {
        throw new HttpError(503, "No payment provider is configured");
    }
    async handleWebhook(_payload, _signature) {
        throw new HttpError(503, "No payment provider is configured");
    }
}
/** Explicit live-provider gate; selecting it without an implementation never
 * pretends to have completed a payment. */
export class UnconfiguredPaymentProvider extends DevelopmentPaymentProvider {
    name = "unconfigured";
}
export class DevelopmentSmsProvider {
    async send(input) {
        if (process.env.NODE_ENV !== "test")
            console.info(`[sms:development] ${input.to} (${input.body.length} chars)`);
    }
}
/** In-process transport keeps the API realtime-ready without pretending to be durable. */
export class DevelopmentChatTransport {
    listeners = new Map();
    async publish(conversationId, event) {
        this.listeners.get(conversationId)?.forEach((listener) => listener(event));
    }
    subscribe(conversationId, listener) {
        const listeners = this.listeners.get(conversationId) ?? new Set();
        listeners.add(listener);
        this.listeners.set(conversationId, listeners);
        return () => { listeners.delete(listener); };
    }
}
export const paymentProvider = new DevelopmentPaymentProvider();
export const smsProvider = new DevelopmentSmsProvider();
export const chatTransport = new DevelopmentChatTransport();
