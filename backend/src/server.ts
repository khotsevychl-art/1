import app from "./app";
import { runMigrations } from "./infrastructure/migrate";
import { seedDatabase } from "./infrastructure/seed";

const PORT = 3000;

const start = async () => {
  await runMigrations();

  seedDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();