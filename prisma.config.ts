import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// أوامر Prisma لا تقرأ .env.local تلقائياً كما يفعل Next.js، فنحمّله هنا.
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
