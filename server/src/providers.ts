import { HttpError } from "./errors.js";

export type PaymentCheckout = {
  paymentId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  returnUrl: string;
};

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: PaymentCheckout): Promise<{ provider: string; checkoutUrl: string }>;
  handleWebhook(payload: string, signature: string): Promise<void>;
}

/**
 * Deliberately refuses to simulate a successful charge. Replace this adapter
 * with a PCI-compliant provider implementation in a production deployment.
 */
export class DevelopmentPaymentProvider implements PaymentProvider {
  readonly name: string = "development";
  async createCheckout(_input: PaymentCheckout): Promise<never> {
    throw new HttpError(503, "No payment provider is configured");
  }
  async handleWebhook(_payload: string, _signature: string): Promise<never> {
    throw new HttpError(503, "No payment provider is configured");
  }
}

/** Explicit live-provider gate; selecting it without an implementation never
 * pretends to have completed a payment. */
export class UnconfiguredPaymentProvider extends DevelopmentPaymentProvider {
  readonly name = "unconfigured";
}

export interface SmsProvider {
  send(input: { to: string; body: string }): Promise<void>;
}

export class DevelopmentSmsProvider implements SmsProvider {
  async send(input: { to: string; body: string }) {
    if (process.env.NODE_ENV !== "test") console.info(`[sms:development] ${input.to} (${input.body.length} chars)`);
  }
}

export interface ChatRealtimeTransport {
  publish(conversationId: string, event: { type: "message.created"; messageId: string }): Promise<void>;
  subscribe(conversationId: string, listener: (event: unknown) => void): () => void;
}

/** In-process transport keeps the API realtime-ready without pretending to be durable. */
export class DevelopmentChatTransport implements ChatRealtimeTransport {
  private listeners = new Map<string, Set<(event: unknown) => void>>();
  async publish(conversationId: string, event: unknown) {
    this.listeners.get(conversationId)?.forEach((listener) => listener(event));
  }
  subscribe(conversationId: string, listener: (event: unknown) => void) {
    const listeners = this.listeners.get(conversationId) ?? new Set();
    listeners.add(listener);
    this.listeners.set(conversationId, listeners);
    return () => { listeners.delete(listener); };
  }
}

export const paymentProvider: PaymentProvider = new DevelopmentPaymentProvider();
export const smsProvider: SmsProvider = new DevelopmentSmsProvider();
export const chatTransport: ChatRealtimeTransport = new DevelopmentChatTransport();
