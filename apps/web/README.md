# Kharify Web

> *"Gerencie com graça o que foi graciosamente confiado a você."*

Interface web do **Kharify** — plataforma **open source e self-hosted** de gestão financeira pessoal, familiar e para pequenos negócios. O app se conecta à [Kharify API](../kharify-api) para autenticação, organizações, contas, transações, contas recorrentes, dívidas, dashboard e Open Finance.

## Funcionalidades

| Área | Status | Observações |
|---|---|---|
| **Login e cadastro** | ✅ Conectado à API | JWT em cookie HttpOnly; suporte a **login com Google** quando `NEXT_PUBLIC_GOOGLE_CLIENT_ID` estiver configurado. |
| **Organizações** | ✅ Parcialmente conectado | Organização ativa persistida e enviada via `X-Organization-Id`. Tela de membros em desenvolvimento. |
| **Dashboard** | ✅ Conectado à API | KPIs, Health Score, fluxo mensal e despesas por grupo. |
| **Contas** | ✅ Conectado à API | CRUD completo e conexão/sincronização Pluggy. |
| **Transações** | ✅ Conectado à API | Criação, edição, exclusão, filtros e busca global. |
| **Entradas e saídas fixas** | ✅ Conectado à API | Contas a receber/pagar (`bills`) com CRUD e recorrência. |
| **Dívidas** | ✅ Conectado à API | CRUD e simulação Price/SAC no dashboard. |
| **Categorias** | ✅ Conectado à API | CRUD de suporte a formulários e lançamentos. |
| **Open Finance** | ✅ Conectado à API | Pluggy Connect, cadastro manual de item, sincronização e desconexão. Sandbox incluso sem credenciais. |
| **Preferências e aparência** | 🔧 Local | Salvas em `localStorage` via Zustand. |
| **Perfil e organização** | 🔧 Parcial | Gerenciamento de perfil e dados da organização. |
| **Recuperação de senha** | 🔜 Planejado | Ainda não implementado. |

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript + React 19 |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Formulários | React Hook Form + Zod |
| Estado global | Zustand |
| HTTP | Axios |
| Gráficos | Recharts |
| Notificações | Sonner |
| Google OAuth | `@react-oauth/google` |
| Open Finance | Pluggy Connect |

## Rotas

| Rota | Finalidade |
|---|---|
| `/login` | Login com e-mail/senha ou Google |
| `/register` | Cadastro com e-mail/senha ou Google |
| `/home` | Visão geral financeira |
| `/accounts`, `/accounts/[id]` | Contas e detalhe |
| `/transactions` | Lançamentos financeiros |
| `/fixed-income`, `/fixed-expenses` | Contas a receber e a pagar |
| `/debts` | Dívidas e simulador |
| `/settings/*` | Perfil, organização, membros e preferências |

## Login com Google

O botão "Continuar com Google" aparece automaticamente na tela de login e de cadastro **somente** quando a variável `NEXT_PUBLIC_GOOGLE_CLIENT_ID` estiver definida. Se não estiver configurada, o fluxo de e-mail/senha continua funcionando normalmente sem nenhum erro.

Isso permite que instâncias self-hosted decidam se querem ou não integrar com o Google OAuth, sem forçar nenhuma dependência de serviços externos.

## Integração com a API

`src/lib/api.ts` configura o Axios para:

- Enviar o cookie de sessão HttpOnly nas requisições (`withCredentials: true`).
- Adicionar a organização ativa como `X-Organization-Id`.
- Desfazer o envelope `{ data: ... }` das respostas NestJS.
- Exibir o overlay global de carregamento durante as requisições.
- Redirecionar ao `/login` após uma resposta `401`.

Os serviços estão em `src/services/`. As server actions de autenticação (login, register, Google OAuth e logout) ficam em `src/app/actions/auth.ts` e rodam exclusivamente no servidor, nunca expondo tokens ao JavaScript do cliente.

## Como executar localmente

### Pré-requisitos

- Node.js 20+
- [Kharify API](../kharify-api) em execução — por padrão em `http://localhost:3080/v1`

### Instalação

```bash
cd kharify-web
npm install
cp .env.example .env.local
```

Edite o `.env.local` com os valores do seu ambiente:

```env
# URL pública da API (acessada pelo navegador)
NEXT_PUBLIC_API_URL=http://localhost:3080/v1

# URL interna da API (usada pelas server actions no servidor Next.js)
INTERNAL_API_URL=http://localhost:3080/v1

# Opcional — habilita o botão "Continuar com Google"
# Crie um Client ID em https://console.cloud.google.com
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Comandos

```bash
npm run dev    # servidor de desenvolvimento
npm run build  # build de produção
npm run start  # serve o build de produção
npm run lint   # lint
```

## Docker

O Dockerfile gera um build standalone do Next.js. Para iniciar toda a stack — API, PostgreSQL, Mailpit e Nginx — execute a partir da raiz do repositório:

```bash
docker compose up --build
```

Para habilitar o Google Login no ambiente Docker, edite o [`docker-compose.yml`](../docker-compose.yml) e descomente as linhas com `NEXT_PUBLIC_GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_ID`.

Veja também o [README da API](../kharify-api/README.md) para configuração de JWT, banco, migrações e Pluggy.

## Próximos incrementos

- Persistir perfil, preferências e membros nas telas que hoje usam dados locais.
- Implementar fluxo de recuperação de senha.
- Login com Apple (Sign in with Apple).
- Conectar o histórico de saldo por conta a dados reais.
- Importação de extratos OFX/CSV.

## Tipografia

A fonte Lora é distribuída com o projeto em `src/app/fonts/` e carregada por `next/font/local`, eliminando a dependência de rede com o Google Fonts durante o build. Os pesos incluídos são 400, 500, 600 e 700. A licença está em `src/app/fonts/OFL.txt`.
