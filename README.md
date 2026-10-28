# Kharify API

> *"Gerencie com graça o que foi graciosamente confiado a você."*

API REST do **Kharify** — plataforma **open source e self-hosted** de gestão financeira pessoal, familiar e para pequenos negócios. A API centraliza autenticação, colaboração por organização, fluxo de caixa, contas a pagar/receber, dívidas, indicadores e sincronização de Open Finance.

O projeto é um monólito modular em NestJS. Todas as rotas são expostas sob o prefixo `/v1` e consumidas pelo app em [`../kharify-web`](../kharify-web).

## Funcionalidades

| Área | Status | Descrição |
|---|---|---|
| **Autenticação** | ✅ Implementado | Cadastro, login com e-mail/senha e **login com Google (OAuth 2.0)**. JWT Bearer em todos os endpoints protegidos. |
| **Organizações** | ✅ Implementado | Organizações pessoais ou empresariais, papéis (`owner`, `gestor`, `membro`) e gerenciamento de membros. |
| **Fluxo de caixa** | ✅ Implementado | CRUD de contas, categorias, centros de custo, lançamentos e contas a pagar/receber com suporte a recorrência. |
| **Dívidas** | ✅ Implementado | CRUD e simulações de amortização (Price e SAC). |
| **Dashboard** | ✅ Implementado | Resumo financeiro, Health Score, fluxo mensal e recortes por categoria e centro de custo. |
| **Open Finance** | ✅ Sandbox incluso | Pluggy Connect, itens, sincronização e webhook. Sem credenciais Pluggy, opera em modo sandbox automaticamente. |
| **Auditoria** | ✅ Implementado | Registro e consulta de mutações para `owner`/`gestor`. |
| **IA e notificações** | 🔜 Planejado | Categorização inteligente via IA (BYOK) e alertas configuráveis. |

## Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 11 + TypeScript
- **Banco**: PostgreSQL 15+ com Prisma 7 e `@prisma/adapter-pg`
- **Auth**: JWT/Passport, `google-auth-library` para verificação de tokens OAuth
- **Utilitários**: `nestjs-cls`, `class-validator`, `nodemailer`
- **Open Finance**: Pluggy API via Axios

## Segurança

Este projeto passou por uma auditoria de segurança completa. Os pontos principais:

- **JWT sem fallback inseguro** — `JWT_SECRET` obrigatório; a API falha ao subir se a variável não estiver definida.
- **Google OAuth verificado server-side** — o `idToken` recebido do frontend é validado diretamente nos servidores do Google via `google-auth-library` (não confiar em tokens não verificados).
- **Proteção contra BOLA/IDOR** — o guard de membros valida o `organizationId` da rota URL, não do body da requisição.
- **Injeção SQL prevenida** — queries brutas com RLS usam `$executeRaw` parametrizado e UUIDs são validados por regex antes de qualquer operação.
- **CORS restritivo em produção** — somente origens declaradas em `FRONTEND_URL` são aceitas quando `NODE_ENV=production`.
- **Credenciais Pluggy obrigatórias em produção** — a API falha explicitamente se as credenciais não estiverem configuradas no ambiente de produção.
- **Sem rastros de billing/SaaS** — o projeto não coleta dados de pagamento, não tem planos ou assinaturas. Os dados ficam no seu servidor.

Veja o documento completo em [`../AUDITORIA_SEGURANCA_E_GOOGLE_LOGIN.md`](../AUDITORIA_SEGURANCA_E_GOOGLE_LOGIN.md).

## Endpoints

Todos os caminhos são relativos a `/v1`.

| Módulo | Endpoints |
|---|---|
| Saúde | `GET /` |
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/google` |
| Organizações | `GET/POST /organizations` · `GET /organizations/active` · `PATCH/DELETE /organizations/:id` · `GET/POST /organizations/:id/members` |
| Contas | `GET/POST /accounts` · `GET/PATCH/DELETE /accounts/:id` |
| Categorias | `GET/POST /categories` · `GET/PATCH/DELETE /categories/:id` |
| Centros de custo | `GET/POST /cost-centers` · `GET/PATCH/DELETE /cost-centers/:id` |
| Lançamentos | `GET/POST /transactions` · `PATCH/DELETE /transactions/:id` |
| Contas a pagar/receber | `GET/POST /bills` · `GET/PATCH/DELETE /bills/:id` |
| Dívidas | `GET/POST /debts` · `GET/PATCH/DELETE /debts/:id` · `POST /debts/:id/simulate` |
| Dashboard | `GET /dashboard/summary` · `/cashflow-monthly` · `/category-breakdown` · `/cost-center-breakdown` |
| Open Finance | `POST /pluggy/connect-token` · `POST /pluggy/items` · `POST /pluggy/items/:id/sync` · `GET /pluggy/items` · `DELETE /pluggy/items/:id` · `POST /pluggy/webhooks` |
| Auditoria | `GET /audit-logs` |

## Como executar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ ou Docker

### Instalação

```bash
cd kharify-api
npm install
cp .env.example .env
```

Edite o `.env` com os valores do seu ambiente:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kharify?schema=public
JWT_SECRET=troque-por-um-segredo-forte-e-aleatorio   # obrigatório
JWT_EXPIRES_IN=7d
PORT=3080
FRONTEND_URL=http://localhost:3000

# Opcional — habilita login com Google (OAuth 2.0)
# Crie um Client ID em https://console.cloud.google.com
# GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com

# Opcional — sem estas credenciais, a integração Pluggy opera em sandbox
# PLUGGY_CLIENT_ID=
# PLUGGY_CLIENT_SECRET=
```

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

A API estará disponível em `http://localhost:3080/v1`.

## Login com Google

O endpoint `POST /auth/google` recebe um `idToken` (JWT emitido pelo Google) e o verifica diretamente nos servidores do Google via `google-auth-library`. Após verificação, o usuário é provisionado automaticamente caso não exista na base.

```bash
# Exemplo de request
curl -X POST http://localhost:3080/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "<id_token_do_google>"}'
```

Para habilitar, defina `GOOGLE_CLIENT_ID` no `.env` com o Client ID gerado no Google Cloud Console. O frontend só exibirá o botão Google quando a variável correspondente estiver configurada.

## Testes

```bash
npm test          # testes unitários
npm run test:e2e  # testes end-to-end
npm run build     # verifica build de produção
```

## Docker

O [`../docker-compose.yml`](../docker-compose.yml) sobe PostgreSQL, Mailpit, a API, o web app e Nginx com um único comando:

```bash
docker compose up --build
```

| Serviço | Porta |
|---|---|
| Web | 3000 |
| API | 3080 |
| PostgreSQL | 5432 |
| Mailpit UI | 8025 |
| Nginx (proxy) | 80 |

## Próximos incrementos

- Login com Apple (Sign in with Apple).
- Categorização e enriquecimento de transações por IA.
- Simulações de dívida avançadas com cenários comparativos.
- Notificações e fluxo de recuperação de senha.
- Maior cobertura de testes de integração.
