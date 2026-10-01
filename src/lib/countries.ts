import "server-only";

import type { ExplorerCountry } from "@/components/CountryExplorer";
import { Audience } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveEntryRule, todayInRiyadh } from "@/lib/entry-validity";
import { SAUDI_NATIONALITY } from "../../prisma/countries";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/**
 * كل الدول مع قاعدة دخول المواطن السعودي، مرتبة بالاسم العربي.
 * الإعفاءات المؤقتة تُحسم هنا بتاريخ اليوم في الرياض (docs/spec.md القسم 4.2)،
 * فما يصل للواجهة هو الحالة الصحيحة الآن، لا المخزنة.
 */
export async function getCountryList(): Promise<ExplorerCountry[]> {
  const today = todayInRiyadh();
  const countries = await db.country.findMany({
    select: {
      slug: true,
      nameAr: true,
      nameEn: true,
      region: true,
      travelAdvisory: true,
      featured: true,
      entryRules: {
        where: { audience: Audience.saudi_citizen, nationality: SAUDI_NATIONALITY },
        select: {
          entryType: true,
          entryTypeAfter: true,
          validUntil: true,
          stay: true,
          needsVerification: true,
          sourceName: true,
          verifiedAt: true,
        },
      },
    },
  });

  return countries
    .flatMap(({ entryRules, ...country }) => {
      // قيد التفرد (countryId, audience, nationality) يضمن قاعدة واحدة على الأكثر.
      const rule = entryRules[0];
      if (!rule) return [];
      const { entryType, needsVerification, exemption } = resolveEntryRule(
        {
          entryType: rule.entryType,
          entryTypeAfter: rule.entryTypeAfter,
          validUntil: rule.validUntil && isoDate(rule.validUntil),
          needsVerification: rule.needsVerification,
        },
        today,
      );
      const expired = exemption?.phase === "expired";
      return [
        {
          ...country,
          entryType,
          needsVerification,
          // مدة الإقامة المخزنة تخص الحالة السابقة، فلا تُعرض بعد انتهاء الإعفاء.
          stay: expired ? null : rule.stay,
          exemption: exemption && exemption.phase !== "active"
            ? { expired, validUntil: exemption.validUntil }
            : null,
          sourceName: rule.sourceName,
          verifiedAt: isoDate(rule.verifiedAt),
        },
      ];
    })
    .sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}
