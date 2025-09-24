import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

console.log('Database URL from env:', env.DATABASE_URL);

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
