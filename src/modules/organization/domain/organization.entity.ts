export type UserRole = 'owner' | 'gestor' | 'membro';
export type OrganizationType = 'familia' | 'mei' | 'pme';

export class Organization {
    constructor(
        public readonly id: string,
        public name: string,
        public type: OrganizationType,
        public readonly createdAt?: Date,
    ) {}
}
