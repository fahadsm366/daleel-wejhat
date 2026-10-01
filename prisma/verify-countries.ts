// يقارن الدول في قاعدة البيانات بملف data/countries.json. التشغيل: npm run db:verify
// للقراءة فقط، لا يعدّل شيئاً. يخرج برمز 1 إذا وُجد اختلاف.

import { readFileSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { PrismaClient } from "../src/generated/prisma/client";
import { parseCountriesFile } from "./countries";

config({ path: ".env.local", quiet: true });

async function main() {
  const rows = parseCountriesFile(JSON.parse(readFileSync("data/countries.json", "utf8")));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const countries = await db.country.findMany({
      select: { slug: true, entryRules: { select: { entryType: true, needsVerification: true } } },
    });
    const bySlug = new Map(countries.map((c) => [c.slug, c]));

    const missing = rows.filter((r) => !bySlug.has(r.country.slug)).map((r) => r.country.slug);
    const fileSlugs = new Set(rows.map((r) => r.country.slug));
    const extra = countries.filter((c) => !fileSlugs.has(c.slug)).map((c) => c.slug);
    const withoutRule = countries.filter((c) => c.entryRules.length === 0).map((c) => c.slug);

    const byType: Record<string, number> = {};
    for (const c of countries) {
      for (const r of c.entryRules) byType[r.entryType] = (byType[r.entryType] ?? 0) + 1;
    }
    const needsVerification = countries.filter((c) =>
      c.entryRules.some((r) => r.needsVerification),
    ).length;

    console.log(`في الملف:            ${rows.length}`);
    console.log(`في قاعدة البيانات:   ${countries.length}`);
    console.log(`ناقصة من القاعدة:    ${missing.length}${missing.length ? ` → ${missing.join(", ")}` : ""}`);
    console.log(`زائدة عن الملف:      ${extra.length}${extra.length ? ` → ${extra.join(", ")}` : ""}`);
    console.log(`دول بلا قاعدة دخول:  ${withoutRule.length}`);
    console.log(`تحتاج تحقق:          ${needsVerification}`);
    console.log("حسب نوع الدخول:");
    for (const [type, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type.padEnd(16)} ${n}`);
    }

    const ok = missing.length === 0 && extra.length === 0 && withoutRule.length === 0;
    console.log(ok ? "\nالنتيجة: مطابق" : "\nالنتيجة: غير مطابق");
    if (!ok) process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
