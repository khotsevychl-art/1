import { app } from "./app";
import { dbPath, initDatabase } from "./infrastructure/db";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    console.log(`SQLite database: ${dbPath}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
