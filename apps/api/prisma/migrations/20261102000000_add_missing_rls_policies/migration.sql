-- RLS was enabled for these tables in the previous migration, but policies
-- were only created for transactions. Without a policy PostgreSQL denies all
-- reads and writes to a table protected by RLS.

CREATE POLICY organization_isolation_policy ON accounts
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY organization_isolation_policy ON categories
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY organization_isolation_policy ON cost_centers
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY organization_isolation_policy ON bills
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY organization_isolation_policy ON debts
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY organization_isolation_policy ON audit_logs
  FOR ALL
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());
