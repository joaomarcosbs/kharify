# **Kharify: Blueprint de Engenharia e Gestão Financeira**

### **Etimologia e Significado**
O nome **Kharify** deriva da raiz grega **Kharis** ($\chi\acute{\alpha}\rho\iota\varsigma$), que evoca graça, gratidão e benevolência. Unindo ao sufixo *-fy* ("tornar"), o projeto foca na **"Gratidão em Ação"**: transformar a gestão financeira em um processo fluido e leve, aplicando a essência da **Oikonomia** (gestão do lar) para gerar prosperidade familiar e empresarial.

---

## **1. Visão Geral e Objetivos**
O Kharify é um ecossistema SaaS desenhado para famílias detalhistas e MEIs. O objetivo é centralizar o controle de fluxo de caixa, quitação de dívidas e planejamento de investimentos em uma única fonte de verdade, eliminando planilhas manuais e a fragmentação de dados.

## **2. Diferencial de Mercado e Público-Alvo**
* **Diferencial**: O projeto atua na interseção entre apps de controle (Mobills) e consolidadores de investimentos (Kinvo), com o diferencial exclusivo do **Simulador de Quitação de Dívidas** baseado em algoritmos de juros reais.
* **Público**: Famílias que buscam clareza financeira e MEIs/PMEs que precisam de controle profissional sem a complexidade de um ERP pesado.

## **3. Análise Funcional (Benchmark Finidesk)**
Utilizamos o Finidesk como referência por sua robustez em centros de custo e categorias:
* **Pontos Fortes Herdados**: Centros de custo (por pessoa/projeto), categorias personalizadas (essencial/necessário/supérfluo) e foco central em dívidas.
* **Melhorias Kharify**: Automação via **Open Finance** (API Pluggy com suporte ao modelo "Meu Pluggy" e Pluggy Connect), projeções com taxas oficiais do BCB e **IA** para categorização e insights, eliminando a dependência exclusiva da disciplina do usuário.

## **4. Escopo Detalhado do MVP (Fase 1)**
* **Core**: Autenticação, gestão de Organizações e convite de membros com papéis (Owner, Gestor, Membro).
* **Estrutura**: Cadastro de Contas/Carteiras, Categorias e Centros de Custo.
* **Movimentações**: Transações manuais, transferências entre contas, contas a pagar/receber (Bills) e recorrências.
* **Dívidas**: Cadastro detalhado e acompanhamento de saldo devedor.

## **5. Funcionalidades Avançadas, Open Finance e IA**
* **Open Finance (Pluggy)**: Integração via Pluggy Connect (widget frontend Next.js) e Pluggy REST API + Webhooks no backend NestJS. Utilização do modelo "Meu Pluggy" para ambiente de desenvolvimento/sandbox e consentimento de dados bancários (Itaú, Nubank, Bradesco, Inter, Santander, XP, etc.).
* **Investimentos**: Cadastro de ativos indexados (Selic/CDI/IPCA) e integração com o Sistema de Gerenciamento de Séries Temporais (SGS) do BCB.
* **IA Nível 1 & 2**: Categorização automática de transações vindas do Open Finance, detecção de anomalias, assistente conversacional e o **Kharify Health Score** para medir a saúde financeira.

## **6. Modelo de Negócio e Planos**
* **Plano Free**: Controle manual de fluxo e dívidas básicas.
* **Plano Plus**: Open Finance Pluggy (sincronização de contas e extratos), categorização por IA e alertas inteligentes.
* **Plano Pro**: Módulo de investimentos completo, assistente conversacional e Webhooks para MEIs.

## **7. Arquitetura Técnica (Clean Arch & Antigravity)**
Estruturado em **Clean Architecture** para garantir a portabilidade entre NestJS e Go:
* **Domain**: Entidades e regras de juros puras (TypeScript/Go futuramente).
* **Application**: Casos de uso como `CalculateDebtPayoff`, `RegisterTransaction` ou `SyncPluggyAccount`.
* **Infrastructure**: Adaptadores para NestJS, Prisma ORM, Pluggy API (Open Finance Integration) e APIs externas.
* **Motor de Simulação**: Serviço de alta performance em Go para cálculos matemáticos complexos (Fases futuras).

## **8. Persistência, Segurança e Auditoria**
* **PostgreSQL**: Base de dados principal com transações ACID.
* **RLS (Row Level Security)**: Isolamento físico de dados por `organization_id` no nível do banco.
* **Audit Log (Immutable Ledger)**: Tabela `audit_logs` para registrar quem alterou qualquer transação, garantindo integridade absoluta.

## **9. Regras de Negócio e Algoritmos Financeiros**
* **Cálculo de Saldo**: $Saldo = SaldoInicial + \sum(entradas) - \sum(saidas)$.
* **Simulador de Dívida**: Algoritmo que projeta a quitação em tempo real ao adicionar aportes extras: $Saldo = Saldo \times (1 + juros) - (parcela + extra)$.
* **Status de Bill**: Cálculo dinâmico (Aberta, Parcial, Paga, Atrasada) baseado na soma das transações vinculadas.

## **10. Roadmap de Desenvolvimento (11 Fases)**
1.  **Fundamentos**: Auth, RLS e Auditoria.
2.  **Estrutura**: APIs de Contas, Categorias e Centros de Custo.
3.  **Fluxo de Caixa**: Motor de transações e saldos (NestJS).
4.  **Contas (Bills)**: Automação de status e agendamentos.
5.  **Dívidas**: Lançamento do simulador (Início com NestJS, futura migração Go).
6.  **Dashboard**: KPIs agregados e visão mensal.
7.  **Web**: Frontend Next.js.
8.  **Mobile**: App React Native/Expo.
9.  **QA**: Testes de integração e stress.
10. **Escala & Open Finance**: Integração com Pluggy API (modelo "Meu Pluggy" e Pluggy Connect), Webhooks de sincronização bancária em tempo real e enriquecimento de extratos via IA.
11. **Pós-MVP**: Módulo de Investimentos e Webhooks MEI.