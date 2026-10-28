# Kharify API

> *"Gerencie com graça o que foi graciosamente confiado a você."*

API REST do Kharify, uma plataforma de planejamento e gestão financeira para famílias e pequenos negócios (MEIs/PMEs). Ela centraliza autenticação, colaboração por organização, fluxo de caixa, contas a pagar/receber, dívidas, indicadores e sincronização de Open Finance.

O projeto é um monólito modular em NestJS. A API expõe todas as rotas sob o prefixo `/v1` e é consumida pelo app em [`../kharify-web`](../kharify-web).

## Status atual

Os módulos abaixo estão implementados no backend:

| Área | Status | Entregas atuais |
| --- | --- | --- |
| Autenticação | Implementado | Cadastro, login, login social por payload e JWT Bearer. |
| Organizações | Implementado | Organizações pessoais ou empresariais, papéis e membros. |
| Fluxo de caixa | Implementado | CRUD de contas, categorias, centros de custo, lançamentos e contas a pagar/receber. |
| Dívidas | Implementado | CRUD e simulações de amortização. |
| Dashboard | Implementado | Resumo financeiro, Health Score, fluxo mensal e recortes por categoria/centro de custo. |
| Open Finance | Implementado com modo sandbox | Pluggy Connect, itens, sincronização, webhook e desconexão; sem credenciais Pluggy, usa dados sandbox. |
| Auditoria | Implementado | Registro de mutações e consulta de logs para owner/gestor. |
| IA e notificações | Planejado / BYOK | Motor de categorização inteligente via IA e envio de alertas configuráveis. |

## Stack

- Node.js 20+
- NestJS 11 e TypeScript
- PostgreSQL 15+
- Prisma 7 com driver `@prisma/adapter-pg`
- JWT/Passport, `class-validator` e `nestjs-cls`
- Pluggy API via Axios

## Segurança e escopo de dados

- Por padrão, as rotas exigem `Authorization: Bearer <token>`; apenas as rotas marcadas como públicas dispensam o JWT.
- A organização ativa é definida pelo header `X-Organization-Id` ou pela organização do token. O usuário precisa ser membro da organização escolhida.
- Os papéis são `owner`, `gestor` e `membro`. Endpoints de escrita mais sensíveis são restritos a owner/gestor.
- O `PrismaService` injeta o contexto da organização em uma transação para trabalhar com as políticas de Row Level Security configuradas no banco.
- Respostas bem-sucedidas são encapsuladas em `{ "data": ... }` pelo interceptor global; exceções passam pelo filtro HTTP global.

## Módulos e endpoints

Todos os caminhos a seguir são relativos a `/v1`.

| Módulo | Endpoints |
| --- | --- |
| Saúde | `GET /` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/social-login` |
| Organizações | `GET/POST /organizations`, `GET /organizations/active`, `PATCH/DELETE /organizations/:id`, `GET/POST /organizations/:id/members` |
| Contas | `GET/POST /accounts`, `GET/PATCH/DELETE /accounts/:id` |
| Categorias | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| Centros de custo | `GET/POST /cost-centers`, `GET/PATCH/DELETE /cost-centers/:id` |
| Lançamentos | `GET/POST /transactions`, `PATCH/DELETE /transactions/:id` |
| Contas a pagar/receber | `GET/POST /bills`, `GET/PATCH/DELETE /bills/:id` |
| Dívidas | `GET/POST /debts`, `GET/PATCH/DELETE /debts/:id`, `POST /debts/:id/simulate` |
| Dashboard | `GET /dashboard/summary`, `/cashflow-monthly`, `/category-breakdown`, `/cost-center-breakdown` |
| Pluggy | `POST /pluggy/connect-token`, `POST /pluggy/items`, `POST /pluggy/items/:id/sync`, `GET /pluggy/items`, `DELETE /pluggy/items/:id`, `POST /pluggy/webhooks` |
| Auditoria | `GET /audit-logs?limit=50` |

## Modelo financeiro

O banco contém usuários, organizações e papéis de membro, além de contas, categorias, centros de custo, contas a pagar/receber, transações, dívidas, itens Pluggy e logs de auditoria.

Saldos de contas são calculados a partir do saldo inicial e das transações, incluindo transferências de origem e destino. As contas a pagar/receber suportam recorrência e têm status `aberta`, `parcial`, `paga` ou `atrasada`. As dívidas mantêm valor original, taxa mensal, parcelas e status, e podem ser simuladas pelo endpoint dedicado.

## Como executar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ ou Docker

### Instalação

```bash
cd kharify-api
npm install
```

Crie o arquivo local a partir do template:

```bash
cp .env.example .env
```

Depois, ajuste os valores de `.env` para seu ambiente:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kharify?schema=public
JWT_SECRET=troque-por-um-segredo-forte
JWT_EXPIRES_IN=7d
PORT=3080
FRONTEND_URL=http://localhost:3000

# Opcionais: sem estas credenciais, a integração Pluggy opera em sandbox.
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
```

Gere o cliente Prisma, aplique as migrações e suba a API:

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

A API estará disponível em `http://localhost:3080/v1`.

## Testes e qualidade

```bash
npm test
npm run test:e2e
npm run build
```

Há testes unitários para entidades de dívida e serviços de autenticação, contas e Pluggy. Os testes end-to-end dependem de uma configuração de banco compatível.

## Docker

O [`../docker-compose.yml`](../docker-compose.yml) sobe PostgreSQL, Mailpit, a API, o web app e Nginx. A partir da raiz do repositório:

```bash
docker compose up --build
```

As portas padrão são: web `3000`, API `3080`, Postgres `5432`, Mailpit `8025` (UI) e `1025` (SMTP), e Nginx `80`.

## Próximos incrementos

- Categorização e enriquecimento de transações por IA.
- Simulações de dívida mais avançadas, com economia de juros por aporte extra e cenários comparativos ampliados.
- Notificações e fluxos de recuperação de senha.
- Cobertura maior de testes de integração e validação da stack Docker em ambiente completo.
