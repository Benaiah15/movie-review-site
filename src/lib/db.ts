import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Create the connection adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

// Pass it into Prisma
const prisma = new PrismaClient({ adapter });

export default prisma;