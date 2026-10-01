import "server-only";

import type { ExplorerCountry } from "@/components/CountryExplorer";
import { Audience } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { SAUDI_NATIONALITY } from "../../prisma/countries";

/** كل الدول مع قاعدة دخول المواطن السعودي، مرتبة بالاسم العربي. */
export async function getCountryList(): Promise<ExplorerCountry[]> {
  const countries = await db.country.findMany({
    select: {
      slug: true,
      nameAr: true,
      nameEn: true,
      region: true,
      travelAdvisory: true,
      entryRules: {
        where: { audience: Audience.saudi_citizen, nationality: SAUDI_NATIONALITY },
        select: {
          entryType: true,
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
      return [
        {
          ...country,
          ...rule,
          verifiedAt: rule.verifiedAt.toISOString().slice(0, 10),
        },
      ];
    })
    .sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}
