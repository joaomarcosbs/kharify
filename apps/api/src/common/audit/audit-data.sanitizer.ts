/**
 * Audit data is intentionally allowlisted. This prevents request bodies and
 * responses from becoming an accidental data-exfiltration sink when a DTO or
 * endpoint gains a new field.
 */
const SAFE_AUDIT_FIELDS = new Set([
  'id',
  'name',
  'email',
  'phone',
  'document',
  'avatarUrl',
  'provider',
  'organizationName',
  'organizationType',
  'type',
  'role',
  'kind',
  'groupType',
  'accountId',
  'accountIdDest',
  'categoryId',
  'costCenterId',
  'billId',
  'debtId',
  'amount',
  'date',
  'dueDate',
  'startDate',
  'description',
  'origin',
  'status',
  'recurrence',
  'originalAmount',
  'interestRateMonth',
  'totalInstallments',
  'installmentAmount',
  'simulationType',
  'extraPaymentAmount',
  'targetMonths',
  'connectorId',
  'connectorName',
  'createdAt',
  'updatedAt',
]);

export function sanitizeAuditData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeAuditData);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (SAFE_AUDIT_FIELDS.has(key)) {
      sanitized[key] = sanitizeAuditData(child);
    }
  }

  return sanitized;
}
