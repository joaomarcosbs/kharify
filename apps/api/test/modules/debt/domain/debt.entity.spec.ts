import { DebtEntity } from '../../../../src/modules/debt/domain/debt.entity';

describe('DebtEntity - Domain Math', () => {
  describe('simulateByTargetMonths', () => {
    it('deve simular uma quitação de R$10.000 em 10 meses a 1%', () => {
      const balance = 10000;
      const rate = 0.01;
      const targetMonths = 10;

      const table = DebtEntity.simulateByTargetMonths(
        balance,
        rate,
        targetMonths,
      );

      expect(table).toHaveLength(10);
      expect(table[0].paymentAmount).toBeCloseTo(1055.82, 2); // PMT price table
      expect(table[9].remainingBalance).toBeCloseTo(0, 2);
    });

    it('deve lidar amigavelmente com taxa de 0%', () => {
      const table = DebtEntity.simulateByTargetMonths(1000, 0, 10);
      expect(table).toHaveLength(10);
      expect(table[0].paymentAmount).toBe(100);
      expect(table[0].interestPaid).toBe(0);
      expect(table[9].remainingBalance).toBe(0);
    });
  });

  describe('simulateByBonusPayment', () => {
    it('deve encurtar o prazo quando um pagamento extra é adicionado', () => {
      // Sem extra daria em aprox 10 meses a 1055.82/mês. Com extra 1000/mes vai para metade.
      const table = DebtEntity.simulateByBonusPayment(
        10000,
        0.01,
        1055.82,
        1000,
      );

      expect(table.length).toBeLessThan(10); // Quitou antes dos 10 originais
      expect(table[table.length - 1].remainingBalance).toBeCloseTo(0, 1);
    });

    it('deve lançar erro se o PMT não cobre os juros (Loop Break Limit)', () => {
      // Saldo 1000, taxa 10%. Juros 1º mes = 100.
      // Pagamento de 50 nunca abaterá principal.
      expect(() => {
        DebtEntity.simulateByBonusPayment(1000, 0.1, 50, 0);
      }).toThrow(
        'Payment amount covers less than initial interest. Debt will never be paid off.',
      );
    });
  });
});
