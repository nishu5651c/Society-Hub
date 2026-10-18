# SocietyHub

A full-stack society management platform for residential communities, built with React + Vite on the frontend and Express + Prisma + PostgreSQL on the backend.

SocietyHub helps property managers, staff, and residents manage properties, membership, leases, maintenance requests, applications, payments, messaging, and notifications from a single workspace.

## Features

- Role-based access for admin, manager, staff, resident, and owner accounts
- Property and unit management
- Member and lease tracking
- Payment tracking and status workflow
- Maintenance request intake and lifecycle updates
- Resident applications and verification workflow
- Notification center
- Real-time or provider-backed messaging and integration layer
- Prisma-powered PostgreSQL data model
- Local development seed account for quick setup

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Express, TypeScript
- Database: PostgreSQL via Prisma ORM
- Auth: JWT + bcrypt hashing
- Validation: Zod
- Testing: Node test runner via TSX

## Repository Structure

```text
.
├── .env.example
├── Dockerfile
├── Dockerfile.api
├── docker-compose.yml
├── docs/
│   ├── backend.md
│   ├── integrations.md
│   └── operations.md
├── prisma/
│   └── schema.prisma
├── server/
│   └── src/
│       ├── app.ts
│       ├── auth.ts
│       ├── routes.ts
│       ├── repositories.ts
│       ├── providers.ts
│       ├── seed.ts
│       └── ...
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.server.json
├── vite.config.ts
├── index.html
├── README.md
└── .github/
```

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+ (recommended)
- Optional: Docker for local containerized setup

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/nishu5651c/Society-Hub.git
cd Society-Hub
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Copy the example file and update values for your local setup:

```bash
cp .env.example .env
```

Example environment:

```env
PORT=4000
NODE_ENV=development
VITE_API_URL=http://localhost:4000/api/v1
APP_URL=http://localhost:8080
DATABASE_URL=postgresql://societyhub:replace-with-your-postgres-password@localhost:5432/societyhub?schema=public
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
CORS_ORIGIN=http://localhost:5173
PAYMENT_PROVIDER=development
EMAIL_PROVIDER=development
SMS_PROVIDER=development
LOG_LEVEL=info
```

4. Create the PostgreSQL database

```sql
CREATE DATABASE societyhub;
```

5. Run database migrations and generate Prisma client

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
npm run prisma:generate
```

For local development, you can also initialize or seed data with:

```bash
npm run db:seed:dev
```

This creates a development admin account:

- Email: admin@local.societyhub.test
- Password: SocietyHub-dev-2026!

## Running the App

Start the API:

```bash
npm run api:dev
```

The API will listen on:

```text
http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

The frontend will be available on:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev             # start Vite frontend
npm run build           # build frontend bundle
npm run preview         # preview production frontend build
npm run api:dev        # run Express API in watch mode
npm run api:build      # compile backend TypeScript
npm run api:start       # run compiled API server
npm run typecheck      # run TypeScript checks for frontend + backend
npm test               # run backend tests
npm run prisma:validate # validate Prisma schema
npm run prisma:generate # generate Prisma client
npm run prisma:migrate  # run Prisma migration in dev mode
npm run db:migrate:deploy # apply committed database migrations
npm run db:seed:dev    # create dev admin user
npm run db:bootstrap:admin # one-time production admin bootstrap
```

## API Overview

The backend uses a modular Express structure with routes for auth, property administration, maintenance, payments, applications, and notifications. Health endpoints are included for readiness and liveness checks.

Primary API conventions:

- Auth routes under `/api/v1/auth`
- Health checks under `/api/v1/health`
- Protected routes require a bearer token

## Documentation

Detailed technical docs are available in the `docs/` folder:

- `docs/backend.md` — backend setup and auth notes
- `docs/integrations.md` — provider adapters and integration boundaries
- `docs/operations.md` — deploy and operational guidance

## Production Notes

- Set a strong `JWT_SECRET` in production.
- Use a managed PostgreSQL service or secure deployment credentials.
- Stripe rent checkout is available after configuring the secret key and signed webhook; email and SMS remain development-only.
- Use the Render Blueprint in `render.yaml` for a managed deployment; it provisions paid service/database resources.
- Do not expose secrets in source control.
- For Docker Compose deployment instructions, health checks, and migration behavior, see [`docs/operations.md`](docs/operations.md).

## License

This project does not appear to include a license file. If you plan to distribute or reuse it commercially, confirm the repository’s intended licensing before publishing or integrating it into other projects.

## Contributing

Contributions are welcome. For significant changes, open an issue or start a discussion before making a large update.

## Support

For questions or troubleshooting, refer to the repository docs and the project configuration files first. If a problem persists, open a GitHub issue with the exact error message and setup context.
