import 'dotenv/config';

// ensure binary engine is used by default to avoid adapter requirement
process.env.PRISMA_CLIENT_ENGINE_TYPE =
  process.env.PRISMA_CLIENT_ENGINE_TYPE || 'binary';

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // diagnostic
    console.log(
      'PRISMA_CLIENT_ENGINE_TYPE at PrismaService ctor ->',
      process.env.PRISMA_CLIENT_ENGINE_TYPE,
    );

    // Prisma 7 requires adapter or accelerateUrl when using engine type "client".
    // Build a pool configuration that always has a password string to satisfy
    // pg's SASL check. If the DATABASE_URL is set it will take precedence via
    // connectionString; otherwise the pool just uses an empty password and no
    // connection.
    const poolConfig: Record<string, any> = {};
    if (process.env.DATABASE_URL) {
      const url = process.env.DATABASE_URL;
      poolConfig.connectionString = url;
      try {
        const parsed = new URL(url);
        // ensure password is always a string (empty if absent)
        poolConfig.password = parsed.password || '';
      } catch {
        poolConfig.password = '';
      }
    } else {
      // no URL -> supply empty password so pool doesn't complain
      poolConfig.password = '';
    }

    super({
      adapter: new PrismaPg(poolConfig),
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
