import assert from "node:assert/strict";
import { test } from "node:test";
import { DevelopmentChatTransport, DevelopmentPaymentProvider } from "./providers.js";

test("development payment adapter never reports external success", async () => {
  await assert.rejects(
    () => new DevelopmentPaymentProvider().createCheckout({ paymentId: "p1", amount: 100, currency: "INR", returnUrl: "https://example.test" }),
    /No payment provider is configured/,
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
