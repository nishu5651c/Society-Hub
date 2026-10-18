import { HttpError } from "./errors.js";
import Stripe from "stripe";
import { config } from "./config.js";

export type PaymentCheckout = {
  paymentId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
};

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: PaymentCheckout): Promise<{ provider: string; checkoutUrl: string }>;
  handleWebhook(payload: Buffer, signature: string): Promise<{
    paymentId: string;
    amountPaid: number;
    currency: string;
    paidAt: Date;
  } | null>;
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
  async handleWebhook(_payload: Buffer, _signature: string): Promise<never> {
    throw new HttpError(503, "No payment provider is configured");
  }
}

/** Explicit live-provider gate; selecting it without an implementation never
 * pretends to have completed a payment. */
export class UnconfiguredPaymentProvider extends DevelopmentPaymentProvider {
  readonly name = "unconfigured";
}

export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";

  constructor(
    private readonly stripe: Stripe,
    private readonly webhookSecret: string,
    private readonly appUrl: string,
  ) {}

  async createCheckout(input: PaymentCheckout) {
    const amountInMinorUnits = input.amount * 100;
    if (!Number.isSafeInteger(amountInMinorUnits) || amountInMinorUnits <= 0) {
      throw new HttpError(400, "Payment amount is invalid");
    }
    const successUrl = new URL("/", this.appUrl);
    successUrl.searchParams.set("payment", "success");
    const cancelUrl = new URL("/", this.appUrl);
    cancelUrl.searchParams.set("payment", "cancelled");
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      allowed_payment_method_types: ["card"],
      client_reference_id: input.paymentId,
      customer_email: input.customerEmail,
      metadata: { paymentId: input.paymentId },
      payment_intent_data: { metadata: { paymentId: input.paymentId } },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: amountInMinorUnits,
          product_data: { name: "SocietyHub rent payment" },
        },
      }],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });
    if (!session.url) throw new HttpError(502, "Stripe did not return a checkout URL");
    return { provider: this.name, checkoutUrl: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new HttpError(400, "Invalid Stripe webhook payload or signature");
    }

    if (event.type !== "checkout.session.completed") return null;
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return null;
    if (!session.metadata?.paymentId || session.amount_total === null || !session.currency) {
      throw new HttpError(400, "Stripe checkout event is missing payment details");
    }
    return {
      paymentId: session.metadata.paymentId,
      amountPaid: session.amount_total,
      currency: session.currency,
      paidAt: new Date(event.created * 1000),
    };
  }
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

const createPaymentProvider = (): PaymentProvider => {
  if (config.paymentProvider === "development") return new DevelopmentPaymentProvider();
  const { stripeSecretKey, stripeWebhookSecret, appUrl } = config;
  if (!stripeSecretKey || !stripeWebhookSecret || !appUrl) {
    throw new Error("Stripe requires STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and APP_URL");
  }
  return new StripePaymentProvider(new Stripe(stripeSecretKey), stripeWebhookSecret, appUrl);
};

export const paymentProvider = createPaymentProvider();
export const smsProvider: SmsProvider = new DevelopmentSmsProvider();
export const chatTransport: ChatRealtimeTransport = new DevelopmentChatTransport();
