import { PrismaClient } from '@prisma/client';

/**
 * Client that interacts with the database
 */
export const prisma =
  global.prisma !== undefined && global.prisma !== null
    ? global.prisma
    : new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
