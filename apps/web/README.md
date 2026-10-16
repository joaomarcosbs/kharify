# Kharify — Web App

> *"Gerencie com graça o que foi graciosamente confiado a você."*

Interface web do **Kharify**, uma plataforma SaaS de planejamento e gestão financeira voltada para famílias detalhistas e MEIs. Desenvolvida em Next.js com App Router, integra-se à `kharify-api` via Axios com autenticação JWT e isolamento por organização.

---

## 🛠 Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Formulários | React Hook Form + Zod |
| Estado global | Zustand |
| HTTP | Axios (`src/lib/api.ts`) com interceptors JWT |
| Gráficos | Recharts (via shadcn chart) |
| Notificações | Sonner |
| Open Finance | Pluggy Connect |

---

## 🗂 Estrutura Principal

```
src/
├── app/
│   ├── (auth)/              # login, register
│   ├── (dashboard)/         # rotas autenticadas
│   │   ├── home/            # dashboard principal
│   │   ├── accounts/        # contas bancárias + detalhe [id]
│   │   ├── transactions/    # lançamentos
│   │   ├── fixed-income/    # entradas fixas
│   │   ├── fixed-expenses/  # saídas fixas
│   │   ├── debts/           # dívidas + simulador Price/SAC
│   │   └── settings/        # perfil, preferências, billing
│   └── actions/             # server actions (auth)
├── components/
│   ├── dashboard/           # tabelas, gráficos, cards
│   ├── forms/               # sheets de criação/edição
│   └── ui/                  # componentes base (shadcn)
├── services/                # camada de acesso à API
├── stores/                  # Zustand (loading, organization)
├── types/                   # entities, DTOs, enums
└── lib/                     # api.ts, format, validators
```

---

## ⚙️ Configuração

### Pré-requisitos

- Node.js ≥ 20
- `kharify-api` rodando localmente (padrão: `http://localhost:3080`)

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3080/v1
NEXT_PUBLIC_PLUGGY_CONNECT_TOKEN=seu_token_aqui   # opcional — Open Finance
```

### Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 🔐 Autenticação

O fluxo de autenticação usa **JWT Bearer Token** armazenado no `localStorage` (`kharify_token`). O interceptor de request em [`src/lib/api.ts`](src/lib/api.ts) injeta automaticamente o token e o `X-Organization-Id` em todas as requisições. Em caso de 401, o usuário é redirecionado para `/login`.

O interceptor de response faz o **unwrap automático** do envelope `{ data: payload }` retornado pelo NestJS `TransformInterceptor`, então os serviços recebem o payload direto.

---

## 🧩 Módulos Implementados

| Módulo | Funcionalidades |
|--------|----------------|
| **Contas** | CRUD, saldo dinâmico, visualização em cards/tabela, Open Finance via Pluggy |
| **Transações** | CRUD completo com edição, filtros por tipo, gráfico de top categorias |
| **Entradas/Saídas Fixas** | CRUD com recorrência, status automático (aberta/parcial/paga/atrasada), gráfico de composição |
| **Dívidas** | CRUD, simulador Price vs SAC em tempo real com tabela de amortização e gráfico comparativo |
| **Categorias** | CRUD, filtrado por tipo (receita/despesa) e grupo (essencial/necessário/supérfluo) |
| **Dashboard** | KPIs (saldo total, entradas/saídas mensais, próximos vencimentos), gráfico de despesas por grupo, top 5 categorias |
| **Configurações** | Preferências salvas em `localStorage`, página de billing com plano e faturas |
| **Busca global** | Busca em tempo real entre contas, transações, bills e dívidas |

---

## 📝 Notas de Desenvolvimento

- **Sem dados mock em produção:** todos os serviços em `src/services/` chamam a API real. Os arquivos em `src/mocks/` existem apenas como referência de tipos e podem ser removidos futuramente.
- **Edição inline:** todas as entidades (contas, transações, bills, dívidas) suportam edição via sheet com pré-preenchimento de dados.
- **Configurações:** armazenadas em `localStorage` com chave `kharify_settings` — sem endpoint de API necessário no momento.
