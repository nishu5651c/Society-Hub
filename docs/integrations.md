# Integration boundaries

SocietyHub keeps external providers behind server-side interfaces. No provider
credentials belong in the browser or repository.

## Payments

`server/src/providers.ts` exposes `PaymentProvider`. The development adapter
always returns `503 No payment provider is configured`; it never marks a charge
paid or fabricates a checkout URL. The Stripe adapter creates server-priced
INR Checkout sessions, verifies `checkout.session.completed` signatures, and
marks a ledger entry paid only when Stripe reports the matching amount and
currency. Residents can start checkout for their own pending or overdue
payments. Configure `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and the public `APP_URL` before enabling it. Never
accept payment status from the browser.

## Email and SMS

`EmailProvider` (in `server/src/notifications.ts`) and `SmsProvider` (in
`server/src/providers.ts`) are the only application boundaries for outbound
messages. Development adapters log metadata only. Production adapters must
use secret-managed credentials, provider timeouts, retry limits, and delivery
status webhooks. Live email and SMS adapters are not implemented; production
startup rejects attempts to select them.

## Realtime chat

Conversations remain persisted in PostgreSQL. `ChatRealtimeTransport` publishes
`message.created` events and `/api/v1/conversations/:id/events` provides an
authenticated server-sent event stream for realtime-capable clients. The web
client uses authenticated polling today because native `EventSource` cannot
send bearer headers; replace that fallback with an authenticated WebSocket/SSE
client at deployment time.

## Deployment checklist

- Set `NODE_ENV=production`, a random `JWT_SECRET` of at least 32 characters,
  `DATABASE_URL`, and an explicit `CORS_ORIGIN`.
- Use `CORS_ORIGIN=same-origin` when the API serves the frontend itself.
- Create the initial administrator with the one-time
  `node dist-server/bootstrap-admin.js` command.
- Run `npm run prisma:validate`, `npm run api:build`, `npm run build`, and
  `npm test` in CI.
- Terminate TLS at the edge, restrict database network access, and configure
  provider secrets through the deployment secret manager.
- Do not use the in-memory fallback for production; it is intentionally
  non-durable and provider-free.
