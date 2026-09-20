# SocietyHub operations

## Deploy

Copy `.env.example` to a secret-managed environment, set a random `JWT_SECRET`
(at least 32 characters), a PostgreSQL `DATABASE_URL`, and an explicit
`CORS_ORIGIN`. `docker compose up --build` is provider-neutral; put TLS and
secret injection at the hosting provider or ingress. Run migrations with
`npx prisma migrate deploy --schema prisma/schema.prisma` before starting the API.

`/api/v1/health/live` is a process liveness probe and `/api/v1/health/ready`
checks PostgreSQL. Do not route traffic until readiness is healthy.

## Backups and restore

Use the managed PostgreSQL provider's encrypted, automated backups where
available. For a self-hosted database:

```sh
docker compose exec postgres pg_dump -U societyhub societyhub > societyhub.sql
cat societyhub.sql | docker compose exec -T postgres psql -U societyhub societyhub
```

Test restores regularly in a separate database. Never commit dumps or secrets.

## Seed and provider adapters

`npm run db:seed:dev` creates a development admin only and refuses production.
Payment, email, SMS, and realtime integrations are adapter interfaces. The
development adapters never claim delivery or payment success. Implement and
credential a PCI-compliant/payment, SMTP or transactional email, Twilio/SMS,
or durable realtime adapter before selecting a live provider in production.
