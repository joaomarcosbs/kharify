export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public readonly createdAt?: Date,
  ) {}

  // Validações básicas de domínio poderiam vir aqui
  changeName(newName: string) {
    if (!newName.trim()) {
      throw new Error('Name cannot be empty');
    }
    this.name = newName;
  }
}
