import app from "./app";
import { runMigrations } from "./infrastructure/migrate";
import { seedDatabase } from "./infrastructure/seed";
import { dbPath } from "./infrastructure/db";

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  await runMigrations();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`SQLite database: ${dbPath}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
