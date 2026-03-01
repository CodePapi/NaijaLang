import 'dotenv/config';

// ensure binary engine is used by default to avoid adapter requirement
process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'binary';

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7 requires adapter or accelerateUrl when using engine type "client".
    // Provide a Postgres adapter unconditionally so instantiation succeeds.
    super({
      // use empty config; actual connection string will be provided via
      // datasource URL at query execution time.
      adapter: new PrismaPg({}),
    });
  }

  async onModuleInit() {
    if (process.env.DATABASE_URL) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
