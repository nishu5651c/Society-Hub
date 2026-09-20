# Integration boundaries

SocietyHub keeps external providers behind server-side interfaces. No provider
credentials belong in the browser or repository.

## Payments

`server/src/providers.ts` exposes `PaymentProvider`. The development adapter
always returns `503 No payment provider is configured`; it never marks a charge
paid or fabricates a checkout URL. Implement `createCheckout` and verified
webhook handling for the chosen PCI-compliant provider, then inject it from
server configuration. The existing `POST /api/v1/payments` endpoint records a
pending ledger entry unless an explicitly verified status is supplied.

## Email and SMS

`EmailProvider` (in `server/src/notifications.ts`) and `SmsProvider` (in
`server/src/providers.ts`) are the only application boundaries for outbound
messages. Development adapters log metadata only. Production adapters must
use secret-managed credentials, provider timeouts, retry limits, and delivery
status webhooks.

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
- Run `npm run prisma:validate`, `npm run api:build`, `npm run build`, and
  `npm test` in CI.
- Terminate TLS at the edge, restrict database network access, and configure
  provider secrets through the deployment secret manager.
- Do not use the in-memory fallback for production; it is intentionally
  non-durable and provider-free.
