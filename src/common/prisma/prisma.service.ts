import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly cls: ClsService) {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool as any);
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    /**
     * Returns a Prisma Client extended with Row Level Security.
     * It uses the organizationId from the current AsyncLocalStorage context.
     */
    get rls() {
        const organizationId = this.cls.get('organizationId');

        if (!organizationId) {
            return this;
        }

        const self = this;

        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ args, query }) {
                        const [, result] = await self.$transaction([
                            self.$executeRawUnsafe(`SELECT set_config('app.current_organization_id', '${organizationId}', TRUE)`),
                            query(args),
                        ]);
                        return result;
                    },
                },
            },
        }) as unknown as PrismaClient; // Cast block to keep compatible with regular types
    }
}

