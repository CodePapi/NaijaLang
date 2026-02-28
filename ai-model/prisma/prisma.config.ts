// configuration file for Prisma 7+

const config = {
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgresql://prisma:prisma@localhost:5432/ai_model',
  },
};

export default config;
