# Kharify - Backend API

*"Gerencie com graça o que foi graciosamente confiado a você."*

Repositório central do backend do **Kharify**, uma plataforma SaaS de planejamento e gestão financeira com profundidade, voltada para famílias detalhistas e pequenos negócios (MEIs/PMEs) que buscam sair das dívidas, organizar o fluxo de caixa e construir patrimônio.

---

## 🛠 Stack Tecnológica (Oficial)

*   **Backend Core:** NestJS + TypeScript
*   **ORM:** Prisma
*   **Banco de Dados:** PostgreSQL (com transações ACID)
*   **Microserviços (Futuro/Performance):** Go (ideal para cálculos de juros compostos, simulações pesadas e pipelines de Open Finance)

## 🏗 Arquitetura e Padrões

A aplicação segue a arquitetura de **Monolito Modular**, servindo clientes web e mobile através de uma API REST única, preparada para futura extração de microserviços em Go. Toda a lógica de negócio crítica vive exclusivamente no backend.

### Segurança e Integridade de Dados
*   **Isolamento de Tenant (RLS):** Utilização de *Row Level Security* (RLS) nativo no PostgreSQL para garantir o isolamento absoluto por `organization_id`, prevenindo vazamento de dados entre diferentes famílias/empresas.
*   **Immutable Ledger / Audit Logs:** Implementação de log de auditoria e *soft delete* para rastrear quem modificou as transações e quais eram os valores anteriores, garantindo total transparência e integridade financeira.

### Módulos Internos Separados
A base de código deve respeitar a divisão estrita dos seguintes módulos desde o dia zero:
*   `auth` (Autenticação e autorização)
*   `organizations` (Gestão de famílias/MEIs)
*   `accounts` (Carteiras, contas bancárias, cartões)
*   `transactions` (Fluxo de caixa, categorias, centros de custo)
*   `debts` (Gestão e acompanhamento de dívidas)
*   `simulations` (Motor de cálculo para quitação e investimentos)
*   `integrations` (Open Finance e APIs do BCB)
*   `notifications` (Webhooks e colaboração familiar ativa)

---

## 📡 Padrões da API REST

A API do MVP 1 atende sob o endereço base `https://api.kharify.com.br/v1`.

### Autenticação e Escopo
*   **Headers:** Requer autenticação via token JWT no formato `Authorization: Bearer <token>`.
*   **Rotas:** Todas as rotas de domínio são estritamente escopadas por organização no padrão `/organizations/{orgId}/...`.

### Padrão de Resposta JSON
Todas as respostas da API seguem um formato uniforme, facilitando o tratamento pelo frontend:
```json
{
  "data": { ... }, 
  "meta": { ... }, 
  "error": null 
}
```
*   **Sucesso (200/201):** `data` preenchido com o payload, `error` nulo.
*   **Falha (400/401/403/404/500):** `data` como `null`. O campo `error` conterá um código técnico identificador e uma mensagem amigável formatada para a UI.

---

## 🗄️ Modelo de Dados (MVP 1)

O banco de dados PostgreSQL foi modelado para suportar:
1.  **Núcleo:** `users`, `organizations`, `user_organization_roles` (suporta convites multiusuário com papéis de owner, gestor ou membro).
2.  **Estrutura Base:** `accounts` (com saldo inicial), `categories` (com classificação essencial/necessário/supérfluo) e `cost_centers` (pessoa/projeto/área).
3.  **Fluxo de Caixa:** `bills` (contas a pagar/receber com cálculo dinâmico de status) e `transactions` (movimentações reais que alimentam os saldos).
4.  **Dívidas:** `debts` e `debt_schedules`, centralizando taxas de juros e parcelas.

---

## 🚀 Próximos Passos (Roadmap de Desenvolvimento)

1.  **Fase 1:** Implementar estrutura base do banco de dados (Prisma schema), autenticação (signup, login) e autorização com RLS escopado por `organization_id`.
2.  **Fase 2:** Endpoints CRUD (Accounts, Categories, Cost Centers).
3.  **Fase 3 & 4:** Regras vitais de fluxo de caixa (cálculo dinâmico de saldo de contas) e Contas a Pagar/Receber (`bills`).
4.  **Fase 5:** Módulo de dívidas e isolamento do motor do Simulador (Valor extra → Prazo / Data alvo → Parcela), evidenciando o "Lucro da Quitação" (juros economizados).
5.  **Fase Futura:** Extração de simulações pesadas e pipelines de conciliação do Open Finance para microserviços em Go.
