-- 1. Habilitar RLS em todas as tabelas financeiras
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Criar função para obter a Org atual da sessão
CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_organization_id', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;

-- 3. Criar Políticas de Segurança (Exemplo para Transactions)
CREATE POLICY organization_isolation_policy ON transactions
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

-- Repita a política acima para todas as outras tabelas (accounts, bills, etc)
-- Dica: O proprietário (postgres) e roles de serviço podem ignorar o RLS se necessário.