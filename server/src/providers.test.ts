import assert from "node:assert/strict";
import { test } from "node:test";
import Stripe from "stripe";
import { DevelopmentChatTransport, DevelopmentPaymentProvider, StripePaymentProvider } from "./providers.js";

test("development payment adapter never reports external success", async () => {
  await assert.rejects(
    () => new DevelopmentPaymentProvider().createCheckout({ paymentId: "p1", amount: 100, currency: "INR" }),
    /No payment provider is configured/,
  );
});

test("Stripe webhook confirms only signed, paid checkout sessions", async () => {
  const secret = "whsec_test";
  const stripe = new Stripe("sk_test_placeholder");
  const provider = new StripePaymentProvider(stripe, secret, "https://society.example.test");
  const payload = JSON.stringify({
    id: "evt_test",
    object: "event",
    api_version: stripe.getApiField("version"),
    created: 1_800_000_000,
    data: {
      object: {
        id: "cs_test",
        object: "checkout.session",
        amount_total: 3850000,
        currency: "inr",
        metadata: { paymentId: "payment-1" },
        payment_status: "paid",
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "checkout.session.completed",
  });
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  const result = await provider.handleWebhook(Buffer.from(payload), signature);
  assert.deepEqual(result, {
    paymentId: "payment-1",
    amountPaid: 3850000,
    currency: "inr",
    paidAt: new Date(1_800_000_000 * 1000),
  });
  await assert.rejects(
    () => provider.handleWebhook(Buffer.from(payload), "invalid"),
    /Invalid Stripe webhook payload or signature/,
  );
});

test("chat transport publishes to active subscribers", async () => {
  const transport = new DevelopmentChatTransport();
  const events: unknown[] = [];
  const unsubscribe = transport.subscribe("c1", (event) => events.push(event));
  await transport.publish("c1", { type: "message.created", messageId: "m1" });
  unsubscribe();
  await transport.publish("c1", { type: "message.created", messageId: "m2" });
  assert.deepEqual(events, [{ type: "message.created", messageId: "m1" }]);
});
