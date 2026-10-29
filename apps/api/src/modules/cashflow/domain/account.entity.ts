export type AccountType = 'conta' | 'carteira' | 'cartao' | 'corretora';

export class Account {
  constructor(
    public readonly id: string,
    public name: string,
    public type: AccountType,
    public readonly initialBalance: number,
    public readonly initialBalanceDate: Date,
    public runtimeBalance?: number, // Calculated explicitly by the service
    public readonly createdAt?: Date,
  ) {}

  public setRuntimeBalance(balance: number) {
    this.runtimeBalance = balance;
  }
}
