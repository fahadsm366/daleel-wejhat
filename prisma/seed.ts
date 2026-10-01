// استيراد الدول من data/countries.json. التشغيل: npm run db:seed
//
// يضيف الناقص فقط ولا يعدّل سجلاً موجوداً، فإعادة التشغيل آمنة ولا تمسح
// تعديلات الإدارة اللاحقة. لتحديث دولة موجودة عدّلها من لوحة الإدارة (المهمة 9).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { PrismaClient } from "../src/generated/prisma/client";
import { CountriesFileError, parseCountriesFile } from "./countries";

config({ path: ".env.local", quiet: true });

async function main() {
  const file = resolve(process.cwd(), "data/countries.json");
  const rows = parseCountriesFile(JSON.parse(readFileSync(file, "utf8")));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const existing = new Set(
      (await db.country.findMany({ select: { slug: true } })).map((c) => c.slug),
    );

    await db.$transaction(
      async (tx) => {
        for (const { country, entryRule } of rows) {
          const saved = await tx.country.upsert({
            where: { slug: country.slug },
            create: country,
            update: {},
          });
          await tx.entryRule.upsert({
            where: {
              countryId_audience_nationality: {
                countryId: saved.id,
                audience: entryRule.audience,
                nationality: entryRule.nationality,
              },
            },
            create: { ...entryRule, countryId: saved.id },
            update: {},
          });
        }
      },
      { timeout: 60_000 },
    );

    const added = rows.filter((r) => !existing.has(r.country.slug)).length;
    const total = await db.country.count();
    console.log(`الملف: ${rows.length} دولة. أُضيفت ${added}، وكانت موجودة ${rows.length - added}.`);
    console.log(`إجمالي الدول في قاعدة البيانات الآن: ${total}.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof CountriesFileError ? error.message : error);
  process.exit(1);
});
