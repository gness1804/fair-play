import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

// Card definition shape for the full deck (Phase 3)
interface CardDefinition {
  slug: string;
  title: string;
  description?: string;
  suit: "HOME" | "OUT" | "CAREGIVING" | "MAGIC" | "WILD" | "UNICORN";
  isKidRelated: boolean;
  isDailyGrind: boolean;
  defaultWeight: number;
}

// Full deck will be populated in Phase 3.
// Each card is upserted by slug to ensure idempotency.
const cards: CardDefinition[] = [
  // Example structure — deck added in Phase 3
  // {
  //   slug: "laundry",
  //   title: "Laundry",
  //   description: "Washing, drying, folding, and putting away clothes.",
  //   suit: "HOME",
  //   isKidRelated: false,
  //   isDailyGrind: true,
  //   defaultWeight: 3,
  // },
];

async function main() {
  console.log("Seeding database...");

  for (const card of cards) {
    await prisma.card.upsert({
      where: { slug: card.slug },
      update: card,
      create: card,
    });
  }

  console.log(`Seeded ${cards.length} cards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
