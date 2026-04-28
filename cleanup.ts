import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");
  
  // Delete all movies that have ZERO reviews AND ZERO collections AND ZERO favoritedBy
  const result = await db.movie.deleteMany({
    where: {
      reviews: { none: {} },
      collections: { none: {} },
      favoritedBy: { none: {} },
      topFourUsers: { none: {} }
    }
  });

  console.log(`Successfully deleted ${result.count} ghost movies!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await db.$disconnect());