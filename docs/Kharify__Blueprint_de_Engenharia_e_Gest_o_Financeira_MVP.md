
# **Kharify: Blueprint de Engenharia - Foco MVP 1**

### **0. Identidade e Propósito (Kharis)**

O nome **Kharify** deriva da raiz grega **Kharis** ($\chi\acute{\alpha}\rho\iota\varsigma$), significando graça e gratidão. O objetivo do MVP é aplicar a **Oikonomia** (gestão do lar) para transformar o fardo das dívidas e do descontrole financeiro em um processo fluido e transparente para famílias (como a sua com a Valeria) e MEIs.

---

## **1. Objetivos Centrais do MVP**

* **Controle de Fluxo de Caixa**: Registro granular de entradas, saídas e transferências.
* **Gestão de Dívidas**: Acompanhamento de saldo devedor e parcelas.
* **Simulação de Quitação**: Algoritmos para acelerar o fim das dívidas.
* **Isolamento e Segurança**: Garantia de privacidade total entre diferentes organizações.

## **2. Stack Tecnológica e Metodologia**

* **Linguagem & Framework**: NestJS com TypeScript para o backend (monolito modular).
* **Banco de Dados**: PostgreSQL com Prisma ORM (Query Batching nativo contra N+1).
* **Arquitetura**: **Clean Architecture** (Entidades, Casos de Uso, Adaptadores e Infraestrutura).
* **Interfaces**: React/Next.js para Web e React Native com Expo para Mobile.

## **3. Estrutura de Domínio (Clean Architecture)**

Para facilitar a futura migração de módulos para **Go**, a lógica deve ser isolada:

* **Entities**: Modelos puros (ex: `Debt`, `Transaction`) com regras de juros compostos.
* **Use Cases**: `RegisterPayment`, `SimulateExtraPayment`, `CalculateAccountBalance`.
* **Repositories (Interfaces)**: Definições de contrato para persistência sem dependência de framework.

## **4. Modelo de Dados (Schema SQL MVP)**

O schema deve suportar o isolamento por `organization_id`:

* **Core**: `Users`, `Organizations`, `UserOrganizationRoles`.
* **Financeiro**: `Accounts` (banco, cartão), `Categories` (receita/despesa; essencial/supérfluo), `CostCenters`.
* **Movimentação**: `Transactions`, `Bills` (contas a pagar/receber).
* **Dívidas**: `Debts` (taxa de juros, parcelas, original_amount).
* **Auditoria**: `Audit_Logs` (Immutable Ledger) para rastro de alterações.

## **5. Segurança e Integridade**

* **RLS (Row Level Security)**: Políticas no PostgreSQL para garantir que o usuário só acesse dados da sua `Organization`.
* **Audit Log**: Toda alteração em `Transaction` ou `Debt` gera um registro com o estado anterior e o novo.
* **Validações**: `amount > 0` e proibição de transferências para a mesma conta de origem.

## **6. Regras de Negócio: Fluxo de Caixa**

* **Cálculo de Saldo**: $SaldoAtual(A) = SaldoInicial(A) + \sum(entradas) - \sum(saidas)$.
* **Tratamento de Transferência**: Registro único que afeta duas contas (origem reduz, destino aumenta).
* **Status de Bill**: Calculado via soma de transações vinculadas (Aberta, Parcial, Paga, Atrasada).

## **7. Regras de Negócio: O Motor de Dívidas**

* **Saldo Devedor**: $Saldo = ValorOriginal - \sum(pagamentos\_vinculados)$.
* **Simulador Caso 1 (Extra)**: Redução de meses baseada em aporte extra: $Saldo = Saldo \times (1 + juros) - (parcela + extra)$.
* **Simulador Caso 2 (Data Alvo)**: Cálculo de parcela necessária para quitação em $N$ meses.

## **8. Especificação da API (V1)**

* **URL Base**: `https://api.kharify.com.br/v1`.
* **Auth**: Bearer Token (JWT com Refresh Token).
* **Escopo**: `/organizations/{orgId}/transactions`, `/organizations/{orgId}/debts`.
* **Contrato**: Objeto padrão `{ data: T | null, meta: object, error: ErrorObject | null }`.

## **9. Dashboard Mínimo**

* **KPI 1**: Balanço Entradas x Saídas do mês atual.
* **KPI 2**: Total Devido (Soma de todos os saldos devedores de dívidas ativas).
* **KPI 3**: Próximos Vencimentos (Lista de `Bills` abertas nos próximos 7 dias).
* **Engajamento**: Contador de "Juros Economizados" por aportes extras realizados.

## **10. Roadmap de Execução (Fases Iniciais)**

1. **Fundamentos**: Configuração do NestJS, Prisma e políticas de RLS no Postgres.
2. **Auth & Org**: Cadastro de usuários, organizações e sistema de convites.
3. **Core Finance**: Endpoints de Contas, Categorias e motor de Transações com saldo automático.
4. **Dívidas**: Implementação do CRUD de dívidas e os dois casos do simulador.
5. **Interface**: Dashboard Web em Next.js e Registro Rápido no Mobile.