"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const migrate_1 = require("./infrastructure/migrate");
const seed_1 = require("./infrastructure/seed");
const db_1 = require("./infrastructure/db");
const PORT = Number(process.env.PORT) || 3000;
const start = async () => {
    await (0, migrate_1.runMigrations)();
    await (0, seed_1.seedDatabase)();
    app_1.default.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`SQLite database: ${db_1.dbPath}`);
    });
};
start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
