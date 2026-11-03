import { sanitizeAuditData } from './audit-data.sanitizer';

describe('sanitizeAuditData', () => {
  it('keeps allowlisted fields and removes credentials and unknown fields', () => {
    expect(
      sanitizeAuditData({
        name: 'Ada',
        email: 'ada@example.com',
        currentPassword: 'old secret',
        newPassword: 'new secret',
        password: 'secret',
        passwordHash: 'hash',
        accessToken: 'token',
        unexpected: 'do not store',
      }),
    ).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
    });
  });

  it('sanitizes nested objects and arrays', () => {
    expect(
      sanitizeAuditData([
        { name: 'safe', newPassword: 'secret' },
        { amount: 10, token: 'secret' },
      ]),
    ).toEqual([{ name: 'safe' }, { amount: 10 }]);
  });

  it('serializes dates without exposing object internals', () => {
    expect(sanitizeAuditData({ createdAt: new Date('2026-01-01T00:00:00.000Z') }))
      .toEqual({ createdAt: '2026-01-01T00:00:00.000Z' });
  });
});
