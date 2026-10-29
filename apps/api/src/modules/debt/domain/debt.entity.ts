export interface AmortizationRow {
  monthIndex: number;
  paymentAmount: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

export class DebtEntity {
  static simulateByTargetMonths(currentBalance: number, monthlyInterestRate: number, targetMonths: number): AmortizationRow[] {
    const table: AmortizationRow[] = [];
    
    if (currentBalance <= 0 || targetMonths <= 0) return table;

    // Se a taxa for 0, é uma divisão simples
    if (monthlyInterestRate <= 0) {
      const pmt = currentBalance / targetMonths;
      let remaining = currentBalance;
      for (let i = 1; i <= targetMonths; i++) {
        remaining = Math.max(0, remaining - pmt);
        table.push({
          monthIndex: i,
          paymentAmount: pmt,
          interestPaid: 0,
          principalPaid: pmt,
          remainingBalance: remaining
        });
      }
      return table;
    }

    // Fórmula da Tabela Price (PMT)
    const pmt = currentBalance * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -targetMonths)));
    
    let remaining = currentBalance;
    for (let i = 1; i <= targetMonths; i++) {
        const interestPaid = remaining * monthlyInterestRate;
        let principalPaid = pmt - interestPaid;
        
        // Ajuste na última parcela por questões de float
        if (i === targetMonths || remaining - principalPaid < 0.01) {
            principalPaid = remaining;
        }

        remaining -= principalPaid;
        
        table.push({
            monthIndex: i,
            paymentAmount: principalPaid + interestPaid,
            interestPaid,
            principalPaid,
            remainingBalance: Math.max(0, remaining),
        });
    }

    return table;
  }

  static simulateByBonusPayment(currentBalance: number, monthlyInterestRate: number, baseInstallment: number, extraMonthlyPayment: number): AmortizationRow[] {
    const table: AmortizationRow[] = [];
    if (currentBalance <= 0) return table;

    const totalPmt = baseInstallment + extraMonthlyPayment;
    let remaining = currentBalance;
    let monthIndex = 1;

    // Proteção de loop infinito se o PMT for menor ou igual ao banco de juros inicial
    if (totalPmt <= remaining * monthlyInterestRate) {
      throw new Error('Payment amount covers less than initial interest. Debt will never be paid off.');
    }

    while (remaining > 0.01 && monthIndex <= 1200) { // Safety cap of 100 years
        const interestPaid = remaining * monthlyInterestRate;
        let principalPaid = totalPmt - interestPaid;
        
        if (principalPaid > remaining) {
            principalPaid = remaining;
        }

        remaining -= principalPaid;

        table.push({
            monthIndex,
            paymentAmount: principalPaid + interestPaid,
            interestPaid,
            principalPaid,
            remainingBalance: Math.max(0, remaining),
        });

        monthIndex++;
    }

    return table;
  }
}
