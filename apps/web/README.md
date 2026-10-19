# Kharify Web

> *"Gerencie com graça o que foi graciosamente confiado a você."*

Interface web do Kharify: uma aplicação de gestão financeira para famílias e pequenos negócios. O app se conecta à [Kharify API](../kharify-api) para autenticação, organizações, contas, transações, contas recorrentes, dívidas, dashboard e Open Finance.

## Status atual

O núcleo de gestão financeira está conectado à API. Algumas áreas de configurações ainda são locais ou demonstrativas; elas estão discriminadas abaixo para não serem confundidas com funcionalidades já persistidas no backend.

| Área | Status | Observações |
| --- | --- | --- |
| Login e cadastro | Conectado à API | O JWT é mantido em cookie HttpOnly; recuperação de senha ainda não existe. |
| Organizações | Parcialmente conectado | A organização ativa é persistida no navegador e enviada no header `X-Organization-Id`. A API suporta membros; a tela de membros ainda exibe dados mockados. |
| Dashboard | Conectado à API | KPIs, Health Score, fluxo mensal e despesas por grupo consultam os endpoints de dashboard. |
| Contas | Conectado à API | CRUD, detalhe da conta e conexão/sincronização Pluggy. O gráfico histórico do detalhe usa dados de demonstração. |
| Transações | Conectado à API | Criação, edição, exclusão, filtros e busca global. |
| Entradas e saídas fixas | Conectado à API | São contas a receber/pagar (`bills`) filtradas por tipo, com CRUD e recorrência. |
| Dívidas | Conectado à API | CRUD e simulação Price/SAC exibida no dashboard. |
| Categorias | Conectado à API | CRUD disponível como suporte aos formulários e lançamentos. |
| Open Finance | Conectado à API | Pluggy Connect, cadastro manual de item, sincronização e desconexão. Sem credenciais Pluggy, a API disponibiliza sandbox. |
| Preferências e aparência | Local | Salvas em `localStorage` sob `kharify_settings`. |
| Perfil e cobrança | Demonstrativo | Perfil não tem persistência; assinatura, faturas, upgrade e cancelamento usam dados/ações mockadas. |

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript e React 19 |
| Estilos | Tailwind CSS 4 e shadcn/ui |
| Formulários | React Hook Form e Zod |
| Estado | Zustand |
| HTTP | Axios |
| Gráficos | Recharts |
| Notificações | Sonner |
| Open Finance | Pluggy Connect |

## Rotas principais

| Rota | Finalidade |
| --- | --- |
| `/login`, `/register` | Autenticação |
| `/home` | Visão geral financeira |
| `/accounts`, `/accounts/[id]` | Contas e detalhe |
| `/transactions` | Lançamentos financeiros |
| `/fixed-income`, `/fixed-expenses` | Contas a receber e a pagar |
| `/debts` | Dívidas e simulador |
| `/settings/*` | Perfil, organização, membros, preferências, aparência e cobrança |

## Integração com a API

`src/lib/api.ts` configura o Axios para:

- enviar o cookie de sessão HttpOnly nas requisições (`withCredentials: true`);
- adicionar a organização ativa como `X-Organization-Id`;
- desfazer o envelope `{ data: ... }` das respostas NestJS;
- exibir o overlay global de carregamento durante as requisições;
- redirecionar ao login após uma resposta `401`.

Os serviços que chamam a API ficam em `src/services/`. Arquivos em `src/mocks/` são referências/dados de demonstração e não são a fonte dos fluxos financeiros conectados.

## Como executar localmente

### Pré-requisitos

- Node.js 20+
- A API em execução — por padrão, `http://localhost:3080/v1`

### Instalação

```bash
cd kharify-web
npm install
```

Crie o arquivo local a partir do template:

```bash
cp .env.example .env.local
```

Depois, ajuste os valores de `.env.local` para seu ambiente:

```env
NEXT_PUBLIC_API_URL=http://localhost:3080/v1

# Usada pelas server actions de autenticação; no Docker aponta para o serviço api.
INTERNAL_API_URL=http://localhost:3080/v1
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Comandos

```bash
npm run dev    # desenvolvimento
npm run build  # build de produção
npm run start  # serve o build de produção
npm run lint   # lint
```

## Docker

O Dockerfile gera um build standalone do Next.js. Para iniciar toda a aplicação — incluindo API, PostgreSQL, Mailpit e Nginx — execute a partir da raiz do repositório:

```bash
docker compose up --build
```

Veja também [o README da API](../kharify-api/README.md) para a configuração de banco, JWT, migrações e Pluggy.

## Próximos incrementos

- Persistir perfil, preferências e membros nas telas que hoje usam dados locais ou mockados.
- Implementar recuperação de senha e cobrança real.
- Conectar o histórico de saldo por conta a dados reais.
- Ampliar as ações contextuais e a categorização inteligente de lançamentos.

## Fonte local

A Lora é distribuída com o projeto em `src/app/fonts/` e carregada por `next/font/local`. Isso elimina a dependência de rede com o Google Fonts durante o build. Os pesos incluídos são 400, 500, 600 e 700; a licença da fonte está em `src/app/fonts/OFL.txt`.
