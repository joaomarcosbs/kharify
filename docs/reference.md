# Kharify technical reference

## Web application routes

| Route | Purpose |
| --- | --- |
| `/login` | Email/password or Google login |
| `/register` | Account registration |
| `/home` | Financial overview and dashboard |
| `/accounts` | Accounts and Open Finance connections |
| `/transactions` | Financial transactions and search |
| `/fixed-income` | Accounts receivable |
| `/fixed-expenses` | Accounts payable and recurring expenses |
| `/debts` | Debt management and simulations |
| `/settings/*` | Profile, organization, members, and preferences |

## API endpoint groups

The API is prefixed with `/v1`. Protected organization endpoints use the `X-Organization-Id` header to select the active organization. The web app sends this header automatically.

| Group | Routes |
| --- | --- |
| Health | `GET /v1/` |
| Authentication | `POST /v1/auth/register`, `/login`, `/google` |
| Organizations | `/v1/organizations` and member routes |
| Accounts | `/v1/accounts` |
| Categories | `/v1/categories` |
| Cost centers | `/v1/cost-centers` |
| Transactions | `/v1/transactions` |
| Bills | `/v1/bills` |
| Debts | `/v1/debts`, including `POST /:id/simulate` |
| Dashboard | `/v1/dashboard/summary`, `/cashflow-monthly`, `/category-breakdown`, `/cost-center-breakdown` |
| Open Finance | `/v1/pluggy/*` |
| Audit | `/v1/audit-logs` |

## Roles and permissions

Permissions are scoped to the active organization. Membership is verified server-side before organization data is accessed.

| Capability | `owner` | `gestor` | `membro` |
| --- | :---: | :---: | :---: |
| View organization data | Yes | Yes | Yes |
| Create transactions and bills | Yes | Yes | Yes |
| Create/edit/delete accounts | Yes | Yes | No |
| Create/edit/delete categories | Yes | Yes | No |
| Create/edit/delete cost centers | Yes | Yes | No |
| Edit/delete transactions and bills | Yes | Yes | No |
| Create/edit/delete debts | Yes | Yes | No |
| Connect and sync Open Finance | Yes | Yes | Yes |
| View audit logs | Yes | Yes | No |
| Update/delete organization | Yes | No | No |
| Add organization members | Yes | No | No |

The API also uses JWT authentication, request validation, organization membership checks, role guards, audit interception, restrictive production CORS behavior, and Prisma/PostgreSQL isolation patterns. These controls protect the application, but operators remain responsible for secure hosting, backups, secrets, HTTPS, and access to the server.

## Useful commands

From `apps/api`:

```bash
npm run dev             # API with file watching
npm run build           # Production build
npm run start:prod      # Run the production build
npm test                # Unit tests
npm run test:e2e        # End-to-end tests
npm run test:cov        # Tests with coverage
npm run prisma:studio   # Prisma database browser
npm run lint            # Lint and auto-fix
```

From `apps/web`:

```bash
npm run dev             # Development server
npm run build           # Production build
npm run start           # Serve the production build
npm run lint            # Lint
```
