# SocietyHub operations

## Deploy

### Render (managed deployment)

For the simplest managed deployment, push the repository to GitHub, create a
new Render Blueprint from it, and deploy `render.yaml`. Render builds one
container that serves the frontend and API from the same origin, provisions a
private PostgreSQL database, runs migrations before each deploy, generates the
JWT secret, and uses Render's HTTPS endpoint. The Blueprint uses paid always-on
service/database plans; review the current prices in Render before confirming
resource creation. Configure a custom domain in Render if desired.

After the first deploy is healthy, open the service shell and run the
administrator bootstrap once. Add the three `BOOTSTRAP_ADMIN_*` variables
temporarily in the Render service's environment settings, then run:

```sh
node dist-server/bootstrap-admin.js
```

Remove the bootstrap variables and redeploy after the command succeeds. Do not
use the development seed account in production.

To accept rent through Stripe, first deploy with the default development
payment provider. In Stripe, add a webhook endpoint at
`https://<your-render-host>/api/v1/payments/webhook` for
`checkout.session.completed`. Then set `PAYMENT_PROVIDER=stripe`,
`STRIPE_SECRET_KEY`, and the endpoint's `STRIPE_WEBHOOK_SECRET` in the Render
service environment and redeploy. Stripe Checkout return URLs use
`RENDER_EXTERNAL_URL`; for other hosts, set `APP_URL` to the public HTTPS app
origin. Use Stripe test-mode keys and webhook signing secret for staging.

### Docker Compose

For the included Docker Compose deployment, copy `.env.example` to `.env` and
replace `JWT_SECRET` and `POSTGRES_PASSWORD` with strong, unique values. Keep
`POSTGRES_PASSWORD` URL-safe (letters, numbers, and hyphens) because Compose
uses it to build the PostgreSQL connection URL. Set `CORS_ORIGIN` to the
browser-facing app origin(s), for example `https://society.example.com`.
To enable Stripe for Compose, also set `PAYMENT_PROVIDER=stripe`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_URL` to the public HTTPS
application origin.

Start the stack with:

```sh
docker compose up --build -d
```

Compose runs the Prisma migrations before starting the API, waits for the
database and API health checks, and serves the frontend and `/api/v1` from the
same origin at `http://localhost:8080` (or your configured host). The API and
database are not published directly to the host. Put TLS and secret injection
at the hosting provider or ingress. Check readiness through the frontend
proxy with `curl http://localhost:8080/api/v1/health/ready`.

The first production administrator must be created explicitly. After the stack
is healthy, run this once using a secure environment-injection mechanism (do not
put the password directly in shell history):

```sh
docker compose run --rm \
  -e BOOTSTRAP_ADMIN_EMAIL \
  -e BOOTSTRAP_ADMIN_NAME \
  -e BOOTSTRAP_ADMIN_PASSWORD \
  api node dist-server/bootstrap-admin.js
```

Set those variables in the deployment environment before running the command.
The command requires a password of at least 12 characters, refuses to run when
an administrator already exists, and never prints the password. Keep public
registration limited to resident accounts and remove bootstrap credentials
from the environment after it succeeds.

For deployments outside Compose, supply a PostgreSQL `DATABASE_URL`, a random
`JWT_SECRET` of at least 32 characters, and an explicit `CORS_ORIGIN`. Run
`npm run db:migrate:deploy` before starting the
API, and configure the frontend's `VITE_API_URL` to the API base URL.

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
Stripe Checkout is implemented with signed webhook verification and
idempotent payment-state updates. Email and SMS still have development-only
adapters; production refuses unimplemented live provider selections. The
development payment adapter returns an explicit unavailable error at checkout.
Do not advertise email/SMS delivery or configure those integrations as live
until their provider adapters and delivery handling are implemented and tested.
