# Kharify

> Manage with grace what has been graciously entrusted to you.

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

The application does not include billing, subscriptions, or a hosted SaaS service. It is designed to be deployed and operated by the person or organization that installs it.

## Project structure

```text
.
├── apps/
│   ├── api/       NestJS REST API, Prisma schema, migrations, and tests
│   └── web/       Next.js web application
├── docker-compose.yml
├── nginx.conf
├── env.example
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
| Local email | Mailpit in Docker Compose |
| Reverse proxy | Nginx in Docker Compose |

## Run the complete stack with Docker

### Requirements

- Docker Engine or Docker Desktop with the Compose plugin.
- Ports `80`, `3000`, `3080`, `5432`, `8025`, and `1025` available, or adjust `docker-compose.yml`.

### Setup

1. Clone the repository and enter it.

   ```bash
   git clone <repository-url>
   cd kharify
   ```

2. Create the root environment file.

   ```bash
   cp env.example .env
   ```

3. Set at least `POSTGRES_PASSWORD` and `JWT_SECRET` in `.env`. Use a long, random value for `JWT_SECRET`; it must never be committed or shared.

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
| Mailpit web interface | http://localhost:8025 |

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

## API

The API is prefixed with `/v1`. Protected organization endpoints use the `X-Organization-Id` header to select the active organization. The web app sends this header automatically.

Main endpoint groups include:

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
npm run prisma:studio  # Prisma database browser
npm run lint            # Lint and auto-fix
```

From `apps/web`:

```bash
npm run dev             # Development server
npm run build           # Production build
npm run start           # Serve the production build
npm run lint            # Lint
```

## Current limitations and roadmap

The following areas are not fully implemented yet:

- Password recovery and configurable notifications.
- Apple login.
- AI-assisted transaction categorization.
- OFX/CSV statement import.
- Some profile, organization-member, and preference flows remain partial or locally persisted in the web client.
- More integration and end-to-end test coverage.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Keep changes scoped and explain the user-facing impact.
2. Run the relevant API tests, web lint, and production builds.
3. Do not include secrets, private financial data, generated credentials, or local environment files.
4. Update this README or the application-specific README files when behavior or configuration changes.

## Open-source rights and license

Kharify is intended to be open-source software. Subject to the applicable license, users may run, study, modify, and redistribute the project, including modified versions, provided that the license and copyright notices are preserved and the source-code obligations for network use are respected.

The project owner requested that Kharify be described as licensed under **AGPL 2.0**. Important legal note: the GNU Affero General Public License has no official version 2; the recognized GNU license is **AGPL version 3**. This README therefore records the requested intent but does not replace a formal license file. Before publishing or distributing Kharify, add the exact license text and confirm whether the intended license is `AGPL-3.0-only` or `AGPL-3.0-or-later`.

The bundled Lora font files are separately licensed under the SIL Open Font License 1.1; see [`apps/web/src/app/fonts/OFL.txt`](apps/web/src/app/fonts/OFL.txt).

## Disclaimer

Kharify is a software tool for recording and analyzing financial information. It is not financial, tax, legal, accounting, or investment advice. Verify imported data and calculations before relying on them, and maintain independent backups of important information.

---

# Kharify — Português (Brasil)

> Gerencie com graça o que foi graciosamente confiado a você.

Kharify é uma plataforma open source e self-hosted de gestão financeira para pessoas, famílias e pequenas empresas. Ela combina um painel web com uma API REST para organizar contas, lançamentos, contas recorrentes, dívidas, categorias e indicadores financeiros em uma ou mais organizações.

Como o Kharify é self-hosted, cada instalação controla seu próprio banco de dados e seus dados financeiros. O login com Google e a integração Open Finance com Pluggy são opcionais; a aplicação principal funciona sem eles.

## Funcionalidades

- Cadastro e autenticação com e-mail e senha.
- Login opcional com Google OAuth, validado no servidor da API.
- Organizações pessoais e empresariais.
- Membros de organizações com os papéis `owner`, `gestor` e `membro`.
- Gestão de contas bancárias, carteiras, cartões e corretoras.
- Lançamentos de entrada, saída e transferência entre contas.
- Categorias de receitas e despesas, classificadas como essenciais, necessárias ou supérfluas.
- Centros de custo para pessoas, projetos ou áreas.
- Contas a pagar e a receber, com recorrência mensal e anual.
- Controle de dívidas com informações de parcelas e simulações de amortização Price/SAC.
- Dashboard com resumo financeiro, fluxo de caixa mensal, divisão por categoria, centro de custo e indicadores de saúde financeira.
- Conexão, sincronização e webhooks opcionais do Pluggy Open Finance.
- Logs de auditoria das alterações de dados, disponíveis para gestores da organização.
- Interface web responsiva com busca, gráficos, preferências visuais e feedback de carregamento e erros.

O projeto não possui cobrança, assinaturas ou serviço SaaS hospedado. Ele foi desenvolvido para ser instalado e operado pela pessoa ou organização responsável pelo ambiente.

## Estrutura do projeto

```text
.
├── apps/
│   ├── api/       API REST NestJS, schema Prisma, migrações e testes
│   └── web/       Aplicação web Next.js
├── docker-compose.yml
├── nginx.conf
├── env.example
└── README.md
```

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| API | NestJS 11, TypeScript, Passport, JWT |
| Banco de dados | PostgreSQL 15+ e Prisma 7 |
| Estado e formulários | Zustand, React Hook Form, Zod |
| Gráficos | Recharts |
| Open Finance | API Pluggy e Pluggy Connect |
| E-mail local | Mailpit no Docker Compose |
| Proxy reverso | Nginx no Docker Compose |

## Executar toda a aplicação com Docker

### Requisitos

- Docker Engine ou Docker Desktop com o plugin Compose.
- Portas `80`, `3000`, `3080`, `5432`, `8025` e `1025` disponíveis, ou ajustadas no `docker-compose.yml`.

### Configuração

1. Clone o repositório e entre na pasta:

   ```bash
   git clone <url-do-repositorio>
   cd kharify
   ```

2. Crie o arquivo de ambiente:

   ```bash
   cp env.example .env
   ```

3. Defina pelo menos `POSTGRES_PASSWORD` e `JWT_SECRET` no arquivo `.env`. Use um valor longo e aleatório para `JWT_SECRET`; ele nunca deve ser versionado ou compartilhado.

4. Compile e inicie os serviços:

   ```bash
   docker compose up --build
   ```

A aplicação ficará disponível em:

| Serviço | URL |
| --- | --- |
| Aplicação web | http://localhost:3000 |
| API | http://localhost:3080/v1 |
| API via Nginx | http://localhost |
| PostgreSQL | `localhost:5432` |
| Interface web do Mailpit | http://localhost:8025 |

O container da API executa as migrações do Prisma antes de iniciar. Os dados do PostgreSQL são persistidos no volume Docker `kharify-pgdata`.

Para parar os serviços sem apagar os dados do banco:

```bash
docker compose down
```

## Executar localmente sem Docker

### Requisitos

- Node.js 20 ou superior.
- PostgreSQL 15 ou superior.
- npm.

Crie um banco PostgreSQL chamado `kharify` e configure `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kharify?schema=public
JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
JWT_EXPIRES_IN=7d
PORT=3080
FRONTEND_URL=http://localhost:3000

# Google OAuth opcional
# GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com

# Credenciais Pluggy opcionais. Sem elas, a integração usa o modo sandbox.
# PLUGGY_CLIENT_ID=
# PLUGGY_CLIENT_SECRET=
```

Instale e inicie a API:

```bash
cd apps/api
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

Configure a aplicação web em `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3080/v1
INTERNAL_API_URL=http://localhost:3080/v1

# Opcional; o botão do Google permanece oculto sem esta variável.
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

Em outro terminal, instale e inicie a aplicação web:

```bash
cd apps/web
npm install
npm run dev
```

Acesse http://localhost:3000.

## Configuração

| Variável | Componente | Obrigatória | Finalidade |
| --- | --- | --- | --- |
| `POSTGRES_PASSWORD` | Docker Compose | Docker | Senha do PostgreSQL usada pelo Compose |
| `DATABASE_URL` | API | Sim | String de conexão com o PostgreSQL |
| `JWT_SECRET` | API | Sim | Segredo usado para assinar tokens de autenticação |
| `JWT_EXPIRES_IN` | API | Não | Validade do token; padrão `7d` |
| `PORT` | API | Não | Porta da API; padrão `3080` |
| `FRONTEND_URL` | API | Não | Origens permitidas do frontend, separadas por vírgula |
| `GOOGLE_CLIENT_ID` | API | Não | Habilita e valida o login com Google no servidor |
| `PLUGGY_CLIENT_ID` | API | Não | Habilita as credenciais Pluggy |
| `PLUGGY_CLIENT_SECRET` | API | Não | Habilita as credenciais Pluggy |
| `NEXT_PUBLIC_API_URL` | Web | Sim | URL da API visível no navegador |
| `INTERNAL_API_URL` | Web | Sim | URL da API usada pelas server actions do Next.js |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Web | Não | Exibe o botão de login com Google quando configurada |

Nunca versione `.env`, `.env.local`, credenciais de banco, segredos JWT, segredos OAuth ou credenciais Pluggy.

## Rotas da aplicação web

| Rota | Finalidade |
| --- | --- |
| `/login` | Login com e-mail/senha ou Google |
| `/register` | Cadastro de usuário |
| `/home` | Visão geral financeira e dashboard |
| `/accounts` | Contas e conexões Open Finance |
| `/transactions` | Lançamentos financeiros e busca |
| `/fixed-income` | Contas a receber |
| `/fixed-expenses` | Contas a pagar e despesas recorrentes |
| `/debts` | Gestão e simulação de dívidas |
| `/settings/*` | Perfil, organização, membros e preferências |

## API

A API utiliza o prefixo `/v1`. Os endpoints protegidos por organização usam o cabeçalho `X-Organization-Id` para selecionar a organização ativa. A aplicação web envia esse cabeçalho automaticamente.

Principais grupos de endpoints:

| Grupo | Rotas |
| --- | --- |
| Saúde | `GET /v1/` |
| Autenticação | `POST /v1/auth/register`, `/login`, `/google` |
| Organizações | `/v1/organizations` e rotas de membros |
| Contas | `/v1/accounts` |
| Categorias | `/v1/categories` |
| Centros de custo | `/v1/cost-centers` |
| Lançamentos | `/v1/transactions` |
| Contas a pagar/receber | `/v1/bills` |
| Dívidas | `/v1/debts`, incluindo `POST /:id/simulate` |
| Dashboard | `/v1/dashboard/summary`, `/cashflow-monthly`, `/category-breakdown`, `/cost-center-breakdown` |
| Open Finance | `/v1/pluggy/*` |
| Auditoria | `/v1/audit-logs` |

## Papéis e permissões

As permissões são limitadas à organização ativa. A associação do usuário é verificada no servidor antes do acesso aos dados.

| Capacidade | `owner` | `gestor` | `membro` |
| --- | :---: | :---: | :---: |
| Visualizar dados da organização | Sim | Sim | Sim |
| Criar lançamentos e contas a pagar/receber | Sim | Sim | Sim |
| Criar/editar/excluir contas | Sim | Sim | Não |
| Criar/editar/excluir categorias | Sim | Sim | Não |
| Criar/editar/excluir centros de custo | Sim | Sim | Não |
| Editar/excluir lançamentos e contas | Sim | Sim | Não |
| Criar/editar/excluir dívidas | Sim | Sim | Não |
| Conectar e sincronizar Open Finance | Sim | Sim | Sim |
| Visualizar logs de auditoria | Sim | Sim | Não |
| Atualizar/excluir organização | Sim | Não | Não |
| Adicionar membros à organização | Sim | Não | Não |

A API também utiliza autenticação JWT, validação de requisições, verificação de associação à organização, guards de papéis, auditoria, CORS restritivo em produção e padrões de isolamento com Prisma/PostgreSQL. Esses controles ajudam a proteger a aplicação, mas os operadores continuam responsáveis por hospedagem segura, backups, segredos, HTTPS e controle de acesso ao servidor.

## Comandos úteis

Na pasta `apps/api`:

```bash
npm run dev             # API com recarregamento automático
npm run build           # Build de produção
npm run start:prod      # Executa o build de produção
npm test                # Testes unitários
npm run test:e2e        # Testes end-to-end
npm run test:cov        # Testes com cobertura
npm run prisma:studio  # Navegador do banco Prisma
npm run lint            # Lint e correção automática
```

Na pasta `apps/web`:

```bash
npm run dev             # Servidor de desenvolvimento
npm run build           # Build de produção
npm run start           # Serve o build de produção
npm run lint            # Lint
```

## Limitações atuais e roadmap

As áreas abaixo ainda não estão totalmente implementadas:

- Recuperação de senha e notificações configuráveis.
- Login com Apple.
- Categorização de transações com auxílio de IA.
- Importação de extratos OFX/CSV.
- Alguns fluxos de perfil, membros da organização e preferências ainda são parciais ou ficam armazenados localmente no cliente web.
- Maior cobertura de testes de integração e end-to-end.

## Contribuição

Contribuições são bem-vindas. Antes de abrir um pull request:

1. Mantenha as alterações focadas e explique o impacto para o usuário.
2. Execute os testes relevantes da API, o lint da aplicação web e os builds de produção.
3. Não inclua segredos, dados financeiros privados, credenciais geradas ou arquivos de ambiente.
4. Atualize este README ou os READMEs específicos das aplicações quando o comportamento ou a configuração mudar.

## Direitos de código aberto e licença

Kharify é destinado a ser software open source. Sujeito à licença aplicável, os usuários podem executar, estudar, modificar e redistribuir o projeto, incluindo versões modificadas, desde que preservem os avisos de licença e copyright e cumpram as obrigações de disponibilização do código-fonte aplicáveis ao uso pela rede.

O proprietário do projeto solicitou que o Kharify seja descrito como licenciado sob **AGPL 2.0**. Observação jurídica importante: a GNU Affero General Public License não possui uma versão oficial 2; a licença GNU reconhecida é a **AGPL versão 3**. Portanto, esta seção registra a intenção solicitada, mas não substitui um arquivo formal de licença. Antes de publicar ou distribuir o Kharify, adicione o texto exato da licença e confirme se a intenção é `AGPL-3.0-only` ou `AGPL-3.0-or-later`.

Os arquivos da fonte Lora incluídos no projeto são licenciados separadamente sob a SIL Open Font License 1.1; consulte [`apps/web/src/app/fonts/OFL.txt`](apps/web/src/app/fonts/OFL.txt).

## Aviso legal

Kharify é uma ferramenta para registrar e analisar informações financeiras. Não constitui aconselhamento financeiro, tributário, jurídico, contábil ou de investimentos. Verifique os dados importados e os cálculos antes de tomar decisões com base neles e mantenha backups independentes das informações importantes.
