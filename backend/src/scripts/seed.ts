import { initDatabase } from "../infrastructure/db";
import { seedDatabase } from "../infrastructure/seed";

async function main() {
  await initDatabase();
  await seedDatabase();
  console.log("Seed command finished");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
