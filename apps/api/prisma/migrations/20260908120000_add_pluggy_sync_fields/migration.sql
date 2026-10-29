-- CreateTable
CREATE TABLE "pluggy_items" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "pluggy_item_id" TEXT NOT NULL,
    "connector_id" INTEGER NOT NULL,
    "connector_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPDATED',
    "last_synced_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pluggy_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pluggy_items_pluggy_item_id_key" ON "pluggy_items"("pluggy_item_id");

-- CreateIndex
CREATE INDEX "pluggy_items_organization_id_idx" ON "pluggy_items"("organization_id");

-- AddForeignKey
ALTER TABLE "pluggy_items" ADD CONSTRAINT "pluggy_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "pluggy_account_id" TEXT,
ADD COLUMN "pluggy_item_id" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "pluggy_transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_pluggy_account_id_key" ON "accounts"("pluggy_account_id");

-- CreateIndex
CREATE INDEX "accounts_pluggy_item_id_idx" ON "accounts"("pluggy_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_pluggy_transaction_id_key" ON "transactions"("pluggy_transaction_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_pluggy_item_id_fkey" FOREIGN KEY ("pluggy_item_id") REFERENCES "pluggy_items"("pluggy_item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS
ALTER TABLE "pluggy_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_isolation_policy ON pluggy_items
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());
