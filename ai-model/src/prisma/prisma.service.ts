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
    // We'll pass minimal options; environment or prisma.config.ts supplies URL.
    // Provide a Postgres adapter so PrismaClient initialization succeeds regardless
    // of the engine type. The adapter factory takes an optional connection string,
    // but PrismaClient will override it using the datasource URL.
    super({
      // create a Postgres adapter instance; actual connection string will come
      // from the Prisma datasource URL, so we can pass an empty config.
      adapter: new PrismaPg({}),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
