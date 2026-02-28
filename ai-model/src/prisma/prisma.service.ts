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
    // We'll provide an adapter only if we actually have a DATABASE_URL defined.
    // Otherwise, let the client start with default options (no db).
    const url = process.env.DATABASE_URL;
    if (typeof url === 'string' && url.length > 0) {
      super({
        adapter: new PrismaPg({ connectionString: url }),
      });
    } else {
      super({});
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
