# Kharify

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

> Manage with grace what has been graciously entrusted to you.

**Under active development**

[Leia em português (Brasil)](README.pt-BR.md)

Kharify is an open-source, self-hosted financial management platform for individuals, families, and small businesses. It combines a web dashboard with a REST API for organizing accounts, transactions, recurring bills, debts, categories, cost centers, and financial indicators in one or more organizations.

Because Kharify is self-hosted, each installation controls its own database and financial data. Google OAuth and Pluggy Open Finance are optional integrations; the core application can run without them.

## What Kharify does

- User registration and email/password authentication.
- Optional Google OAuth login, verified on the API server.
- Personal and business organizations.
- Organization membership with `owner`, `gestor`, and `membro` roles.
- Account management for checking accounts, wallets, cards, and brokerages.
- Income, expense, and account-transfer transactions.
- Categories divided into income/expense and essential/necessary/discretionary groups.
- Cost centers for people, projects, or areas.
- Accounts payable and receivable, including monthly and annual recurrence.
- Debt tracking with installment information and Price/SAC amortization simulations.
- Dashboard summaries, monthly cash flow, category breakdowns, cost-center breakdowns, and financial health indicators.
- Optional Pluggy Open Finance connection, synchronization, and webhooks.
- Audit logs for data mutations, available to organization managers.
- Responsive web interface with search, charts, appearance preferences, and loading/error feedback.

The project does not collect payment data and was made to be installed and operated by the people who use it.

## Project structure

```text
.
├── apps/
│   ├── api/       NestJS REST API, Prisma schema, migrations, and tests
│   └── web/       Next.js web application
├── docs/
│   └── reference.md
├── docker-compose.yml
├── nginx.conf
├── .env.example
└── README.md
```

## Technology stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| API | NestJS 11, TypeScript, Passport, JWT |
| Database | PostgreSQL 15+ and Prisma 7 |
| State and forms | Zustand, React Hook Form, Zod |
| Charts | Recharts |
| Open Finance | Pluggy API and Pluggy Connect |
| Reverse proxy | Nginx in Docker Compose |

## Run the complete stack with Docker

### Requirements

- Docker Engine or Docker Desktop with the Compose plugin.
- Ports `80`, `3000`, `3080`, and `5432` available, or adjust `docker-compose.yml`.

### Setup

1. Clone the repository and enter it.

   ```bash
   git clone <repository-url>
   cd kharify
   ```

2. Create the root environment file.

   ```bash
   cp .env.example .env
   ```

3. Generate secrets and set at least `POSTGRES_PASSWORD` and `JWT_SECRET` in `.env`:

   ```bash
   openssl rand -hex 24  # database password
   openssl rand -hex 32  # JWT_SECRET
   ```

   These values must never be committed or shared.

4. Build and start the services.

   ```bash
   docker compose up --build
   ```

The application is then available at:

| Service | URL |
| --- | --- |
| Web application | http://localhost:3000 |
| API | http://localhost:3080/v1 |
| API through Nginx | http://localhost |
| PostgreSQL | `localhost:5432` |

The API container applies Prisma migrations before starting. PostgreSQL data is persisted in the `kharify-pgdata` Docker volume.

To stop the stack while preserving database data:

```bash
docker compose down
```

## Run locally without Docker

### Requirements

- Node.js 20 or newer.
- PostgreSQL 15 or newer.
- npm.

Create a PostgreSQL database named `kharify`, then configure the API in `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kharify?schema=public
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PORT=3080
FRONTEND_URL=http://localhost:3000

# Optional Google OAuth
# GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Optional Pluggy credentials. Without them, the integration uses sandbox behavior.
# PLUGGY_CLIENT_ID=
# PLUGGY_CLIENT_SECRET=
```

Install and start the API:

```bash
cd apps/api
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

Configure the web application in `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3080/v1
INTERNAL_API_URL=http://localhost:3080/v1

# Optional; the Google button stays hidden when this is not set.
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

In a second terminal, install and start the web app:

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000.

To populate the local installation with data for screenshots and README illustrations, run the demo seed from the API directory after applying the migrations:

```bash
cd apps/api
npm run prisma:seed
```

It creates the `Oliveira & Família` demo organization with accounts, categories, transactions, bills, a debt, a sandbox Open Finance item, and audit records. Demo login: `demo@kharify.local` / `Kharify123!`. These credentials are for local development only.

## Configuration

| Variable | Component | Required | Purpose |
| --- | --- | --- | --- |
| `POSTGRES_PASSWORD` | Docker Compose | Docker | PostgreSQL password used by the Compose stack |
| `DATABASE_URL` | API | Yes | PostgreSQL connection string |
| `JWT_SECRET` | API | Yes | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | API | No | Token lifetime; defaults to `7d` |
| `PORT` | API | No | API port; defaults to `3080` |
| `FRONTEND_URL` | API | No | Comma-separated allowed frontend origins |
| `GOOGLE_CLIENT_ID` | API | No | Enables and verifies Google login on the server |
| `PLUGGY_CLIENT_ID` | API | No | Enables Pluggy credentials |
| `PLUGGY_CLIENT_SECRET` | API | No | Enables Pluggy credentials |
| `NEXT_PUBLIC_API_URL` | Web | Yes | API URL visible to the browser |
| `INTERNAL_API_URL` | Web | Yes | API URL used by Next.js server actions |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Web | No | Shows the Google login button when configured |

Never commit `.env`, `.env.local`, database credentials, JWT secrets, OAuth secrets, or Pluggy credentials.

See the [technical reference](docs/reference.md) for web routes, API endpoint groups, roles and permissions, and useful commands.

<!-- Screenshots: add selected images under docs/images/ when ready, then document them here with accessible captions. Do not add placeholder images. -->

## Current limitations and roadmap

The main limitations and planned areas are:

- Password recovery and configurable notifications.
- Apple login.
- AI-assisted transaction categorization.
- OFX/CSV statement import.
- Organization member registration does not send e-mail automatically: an administrator creates the member and shares the generated initial password manually. The member can change it later from the profile page.
- Appearance and notification preferences are persisted locally in the browser.
- More integration and end-to-end test coverage.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Keep changes scoped and explain the user-facing impact.
2. Run the relevant API tests, web lint, and production builds.
3. Do not include secrets, private financial data, generated credentials, or local environment files.
4. Update this README or the application-specific README files when behavior or configuration changes.

Before opening a pull request, read [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Please see [SECURITY.md](SECURITY.md) for private vulnerability reporting instructions.

## License

Copyright (C) 2026 João Marcos Bueno Silva.

Kharify is free software licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only); see [LICENSE](LICENSE). You may run, study, modify, and redistribute it. If you offer a modified version to others over a network, you must make the corresponding source code of that version available under the same license.

The bundled Lora font files are separately licensed under the SIL Open Font License 1.1; see apps/web/src/app/fonts/OFL.txt.

## Disclaimer

Kharify is a software tool for recording and analyzing financial information. It is not financial, tax, legal, accounting, or investment advice. Verify imported data and calculations before relying on them, and maintain independent backups of important information.
