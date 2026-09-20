# Backend setup

The API uses Prisma with PostgreSQL whenever `DATABASE_URL` is set. Apply the schema
with `npx prisma migrate dev --name init` (or `npx prisma db push` for local
prototyping), then start it with `npm run api:dev`.

When `DATABASE_URL` is absent, properties, maintenance requests, and users use a
clearly scoped in-memory development fallback. This fallback is not suitable for
production. Set `JWT_SECRET` to a long random value outside development.
Production requires `NODE_ENV=production` and a JWT secret with at least 32
characters. See `docs/integrations.md` for provider and deployment boundaries.

Authentication endpoints are under `/api/v1/auth`:

- `POST /register` with `{ email, name, password }`
- `POST /login` with `{ email, password }`
- `GET /me` with `Authorization: Bearer <token>`

Properties and maintenance read/write endpoints require a bearer token. Creating
properties is limited to `ADMIN` and `MANAGER` users.

## Frontend auth wiring

The Vite client targets `http://localhost:4000/api/v1` automatically in development. Set `VITE_API_URL` when the API is hosted elsewhere; it must include the `/api/v1` prefix. The Express router is mounted at `/api/v1`, so registration and login are `POST /api/v1/auth/register` and `POST /api/v1/auth/login`.

For a safe local admin account, run `npm.cmd run db:seed:dev` with PostgreSQL configured. The command is blocked when `NODE_ENV=production`. Default development credentials are `admin@local.societyhub.test` / `SocietyHub-dev-2026!`; override them with `DEV_ADMIN_EMAIL` and `DEV_ADMIN_PASSWORD` for local use only.
