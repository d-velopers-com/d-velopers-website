import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Prisma Client generation does not connect to the database. A placeholder
    // keeps clean installs deterministic when DATABASE_URL is injected later.
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/dvelopers",
  },
});
