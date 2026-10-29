-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('familia', 'mei', 'pme');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'gestor', 'membro');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('conta', 'carteira', 'cartao', 'corretora');

-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('receita', 'despesa');

-- CreateEnum
CREATE TYPE "CategoryGroupType" AS ENUM ('essencial', 'necessario', 'superfluo');

-- CreateEnum
CREATE TYPE "CostCenterType" AS ENUM ('pessoa', 'projeto', 'area');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('pagar', 'receber');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('aberta', 'parcial', 'paga', 'atrasada');

-- CreateEnum
CREATE TYPE "BillRecurrence" AS ENUM ('nenhuma', 'mensal', 'anual');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('entrada', 'saida', 'transferencia');

-- CreateEnum
CREATE TYPE "TransactionOrigin" AS ENUM ('manual', 'open_finance', 'recorrente');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('ativa', 'quitada');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_organization_roles" (
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "user_organization_roles_pkey" PRIMARY KEY ("user_id","organization_id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "initial_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "initial_balance_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "CategoryKind" NOT NULL,
    "group_type" "CategoryGroupType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CostCenterType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "BillType" NOT NULL,
    "account_id" UUID,
    "category_id" UUID,
    "cost_center_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "BillStatus" NOT NULL,
    "recurrence" "BillRecurrence" NOT NULL DEFAULT 'nenhuma',
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "account_id" UUID NOT NULL,
    "account_id_dest" UUID,
    "category_id" UUID,
    "cost_center_id" UUID,
    "bill_id" UUID,
    "debt_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "origin" "TransactionOrigin" NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debts" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "account_id" UUID,
    "original_amount" DECIMAL(18,2) NOT NULL,
    "interest_rate_month" DECIMAL(9,6),
    "total_installments" INTEGER,
    "installment_amount" DECIMAL(18,2),
    "start_date" DATE NOT NULL,
    "status" "DebtStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "table_name" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_organization_id_idx" ON "accounts"("organization_id");

-- CreateIndex
CREATE INDEX "categories_organization_id_idx" ON "categories"("organization_id");

-- CreateIndex
CREATE INDEX "cost_centers_organization_id_idx" ON "cost_centers"("organization_id");

-- CreateIndex
CREATE INDEX "bills_organization_id_due_date_idx" ON "bills"("organization_id", "due_date");

-- CreateIndex
CREATE INDEX "bills_organization_id_status_idx" ON "bills"("organization_id", "status");

-- CreateIndex
CREATE INDEX "transactions_organization_id_date_idx" ON "transactions"("organization_id", "date");

-- CreateIndex
CREATE INDEX "transactions_account_id_date_idx" ON "transactions"("account_id", "date");

-- CreateIndex
CREATE INDEX "transactions_bill_id_idx" ON "transactions"("bill_id");

-- CreateIndex
CREATE INDEX "transactions_debt_id_idx" ON "transactions"("debt_id");

-- CreateIndex
CREATE INDEX "debts_organization_id_status_idx" ON "debts"("organization_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_created_at_idx" ON "audit_logs"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_created_at_idx" ON "audit_logs"("table_name", "created_at");

-- AddForeignKey
ALTER TABLE "user_organization_roles" ADD CONSTRAINT "user_organization_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organization_roles" ADD CONSTRAINT "user_organization_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_dest_fkey" FOREIGN KEY ("account_id_dest") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
