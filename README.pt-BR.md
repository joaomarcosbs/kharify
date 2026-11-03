# Kharify

[![Licença: AGPL v3](https://img.shields.io/badge/Licença-AGPL%20v3-blue.svg)](LICENSE)

> Gerencie com graça o que foi graciosamente confiado a você.

**Em desenvolvimento ativo**

[Read in English](README.md)

Kharify é uma plataforma open source e self-hosted de gestão financeira para pessoas, famílias e pequenas empresas. Ela combina um painel web com uma API REST para organizar contas, lançamentos, contas recorrentes, dívidas, categorias, centros de custo e indicadores financeiros em uma ou mais organizações.

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

O projeto não coleta dados de pagamento e foi feito para ser instalado e operado por quem o utiliza.

## Estrutura do projeto

```text
.
├── apps/
│   ├── api/       API REST NestJS, schema Prisma, migrações e testes
│   └── web/       Aplicação web Next.js
├── docs/
│   └── reference.md
├── docker-compose.yml
├── nginx.conf
├── .env.example
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
| Proxy reverso | Nginx no Docker Compose |

## Executar toda a aplicação com Docker

### Requisitos

- Docker Engine ou Docker Desktop com o plugin Compose.
- Portas `80`, `3000`, `3080` e `5432` disponíveis, ou ajustadas no `docker-compose.yml`.

### Configuração

1. Clone o repositório e entre na pasta:

   ```bash
   git clone <url-do-repositorio>
   cd kharify
   ```

2. Crie o arquivo de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Gere os segredos e defina pelo menos `POSTGRES_PASSWORD` e `JWT_SECRET` no `.env`:

   ```bash
   openssl rand -hex 24  # senha do banco
   openssl rand -hex 32  # JWT_SECRET
   ```

   Esses valores nunca devem ser versionados ou compartilhados.

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

Para preencher a instalação local com dados para capturas de tela e ilustrações do README, execute o seed de demonstração na pasta da API depois de aplicar as migrações:

```bash
cd apps/api
npm run prisma:seed
```

Ele cria a organização de demonstração `Oliveira & Família` com contas, categorias, lançamentos, contas a pagar/receber, uma dívida, um item Open Finance sandbox e registros de auditoria. Login de demonstração: `demo@kharify.local` / `Kharify123!`. Essas credenciais são apenas para desenvolvimento local.

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

Consulte a [referência técnica](docs/reference.md) para rotas web, grupos de endpoints da API, papéis e permissões e comandos úteis.

<!-- Screenshots: adicione imagens selecionadas em docs/images/ quando estiverem prontas e documente-as aqui com legendas acessíveis. Não adicione imagens placeholder. -->

## Limitações atuais e roadmap

As principais limitações e próximos incrementos são:

- Recuperação de senha e notificações configuráveis.
- Login com Apple.
- Categorização de transações com auxílio de IA.
- Importação de extratos OFX/CSV.
- O cadastro de membros da organização não envia e-mail automaticamente: um administrador cria o membro e compartilha manualmente a senha inicial gerada. O membro pode alterá-la depois na tela de perfil.
- As preferências de aparência e notificações são armazenadas localmente no navegador.
- Maior cobertura de testes de integração e end-to-end.

## Contribuição

Contribuições são bem-vindas. Antes de abrir um pull request:

1. Mantenha as alterações focadas e explique o impacto para o usuário.
2. Execute os testes relevantes da API, o lint da aplicação web e os builds de produção.
3. Não inclua segredos, dados financeiros privados, credenciais geradas ou arquivos de ambiente.
4. Atualize este README ou os READMEs específicos das aplicações quando o comportamento ou a configuração mudar.

Antes de abrir um pull request, leia o [CONTRIBUTING.md](CONTRIBUTING.md).

## Segurança

Consulte o [SECURITY.md](SECURITY.md) para instruções de reporte privado de vulnerabilidades.

## Licença

Copyright (C) 2026 João Marcos Bueno Silva.

Kharify é software livre licenciado exclusivamente sob a GNU Affero General Public License v3.0 (AGPL-3.0-only); consulte [LICENSE](LICENSE). Você pode executá-lo, estudá-lo, modificá-lo e redistribuí-lo. Se oferecer uma versão modificada a outras pessoas pela rede, deverá disponibilizar o código-fonte correspondente dessa versão sob a mesma licença.

Os arquivos da fonte Lora incluídos no projeto são licenciados separadamente sob a SIL Open Font License 1.1; consulte apps/web/src/app/fonts/OFL.txt.

## Aviso legal

Kharify é uma ferramenta para registrar e analisar informações financeiras. Não constitui aconselhamento financeiro, tributário, jurídico, contábil ou de investimentos. Verifique os dados importados e os cálculos antes de tomar decisões com base neles e mantenha backups independentes das informações importantes.
