# Status de Desenvolvimento: Kharify API (MVP)

Este documento registra todas as engrenagens de arquitetura, banco, e regras de negócio resolvidas até o encerramento do MVP de Backend (abrangendo Fases 1 à 4).

## 1. Clean Architecture e Estrutura Refatorada
Para mitigar manutenções dolorosas e suportar a eventual migração para um microsserviço no futuro (em linguagem Go, por exemplo), o repositório foi migrado e mantido rigidamente na convenção Clean Arch.
Todos os módulos em `src/modules` obedecem as subdivisões rígidas separando as camadas:
- **`domain`**: Entidades lógicas (sem uso do framework) onde residem as regras matemáticas, de domínio e formatações pesadas.
- **`application`**: Casos de usos lógicos, DTOs de validação das payloads.
- **`infrastructure`**: Exclusivamente controladoras REST e Guardas.

## 2. Row Level Security (Isolamento por Família/MEI)
Base estrutural imutável do sistema.
- **Como funciona:** Injetamos o uso do `nestjs-cls` direto no módulo principal. A partir dali, toda e qualquer rota do sistema expuserá o UUID da conta logada. 
- **Integração com Prisma:** Foi estruturado um Prisma Extension Singleton customizado `PrismaService.rls`. O sistema aplica silenciosamente dentro do context o código Postgres de RLS, garantindo que usuários jamais tenham chance teórica de encostar ou "engavetar" saldos que pertençam à conta de terceiros (o banco oculta as tuplas como mágica, ignorando injeções por software). 

## 3. Fluxos Implementados

### Módulo de Organização (Gestão e Autenticação)
- Casos de `Register` e `Login`.
- Ao bater no Register, a API automaticamente transaciona a criação de um novo `User`, a nova Instância de `Organization` e acopla a hierarquia `Owner` no contexto do *Role*.
- Todo endpoint foi blindado com a emissão e validação nativa de Token Base do *Passport* JWT Strategy.

### Módulo Core Finance (O Fluxo de Caixa Oikonomia)
- **Contas, Categorias e Custos**: Motor CRUD sem coluna estática de saldo.
  - O Saldo é **Dinâmico**. Sempre que uma listagem ocorre, o Prisma é invocado com `aggregate _sum` de entradas, decaindo as saídas e adicionando transferências destinadas a ela, resolvendo dados de saldo limpos em frações de centavos.
- **Transações (`Transactions`)**: 
  - Regra dura contra inserção de transferências com mesma C/C destino, e obrigatoriedade de dois dados de vínculos.
- **Gestão de Contas a Pagar (`Bills`)**: 
  - Status gerenciado atomicamente sem CRONs assíncronas falhas.
  - Via de duas mãos: caso vincule um lançamento e o valor pago complete o preço do painel, o sistema automaticamente vira a flag local de Status da Bill para `PAGA`. Caso seja removido ou reduzido, retornará à `PARCIAL`.

### Módulo Debt Motor ("Inteligência Financeira das Dívidas")
- **Simulador via Tabela Price**: Em `DebtEntity`, foram codificadas duas lógicas pesadas que usaram a convenção real da matemática de juros compostos com Amortização de Prestações Fixas Francesas (`Tabela Price`).
- **Função 1 (Encurtar por Parcela Extra Mensal)**: Projeta em quantas parcelas o débito acabará caso a família invista $X a mais;
- **Função 2 (Encurtar por Meta Alvo)**: Recebe o número de meses, projeta o custo final do PMT para alcançar àquela meta em base zero do principal de juros;
- A API retorna as estruturas em objetos detalhados `Array<AmortizationRow>`, ou seja, devolvendo parcela por parcela do plano do simulador para que possa ser exibida graficamente em dashboars na UI.

O MVP do Backend encerra por aqui estável, tipado nos testes, sem erros de compilação!
