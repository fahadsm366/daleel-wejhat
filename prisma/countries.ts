// قراءة data/countries.json والتحقق منه وتحويله إلى صيغة قاعدة البيانات.
// دوال خالصة بلا اتصال بقاعدة البيانات، حتى تُختبر وحدها (countries.test.ts).

import {
  Audience,
  EntryType,
  InsuranceRequirement,
  Region,
} from "../src/generated/prisma/enums";

/** عدد الدول المتوقع في الملف. أي اختلاف يوقف الاستيراد. */
export const EXPECTED_COUNTRY_COUNT = 199;

/** جنسية المواطن السعودي في EntryRule (انظر docs/spec.md القسم 7). */
export const SAUDI_NATIONALITY = "SA";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type CountryRow = {
  country: {
    slug: string;
    nameAr: string;
    nameEn: string;
    region: Region;
    arabCountry: boolean;
    schengen: boolean;
    travelAdvisory: boolean;
  };
  entryRule: {
    audience: Audience;
    nationality: string;
    entryType: EntryType;
    stay: string | null;
    notes: string | null;
    vaccination: string | null;
    insurance: InsuranceRequirement;
    needsVerification: boolean;
    sourceName: string;
    sourceUrl: null;
    verifiedAt: Date;
  };
};

export class CountriesFileError extends Error {
  constructor(readonly problems: string[]) {
    super(`data/countries.json غير صالح:\n- ${problems.join("\n- ")}`);
    this.name = "CountriesFileError";
  }
}

type Raw = Record<string, unknown>;

function isEnumValue<T extends string>(e: Record<string, T>, v: unknown): v is T {
  return typeof v === "string" && Object.values(e).includes(v as T);
}

function optionalText(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== "string" || !DATE_PATTERN.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : d;
}

/**
 * يتحقق من الملف كاملاً ويجمع كل الأخطاء قبل أن يرمي، حتى تُصلح دفعة واحدة.
 * لا يُكتب شيء في قاعدة البيانات إذا وُجد أي خطأ.
 */
export function parseCountriesFile(json: unknown): CountryRow[] {
  const problems: string[] = [];
  const file = (json ?? {}) as Raw;

  const sourceName = optionalText(file.source);
  if (!sourceName) problems.push("الحقل source (اسم المصدر) مفقود في أعلى الملف");

  if (!Array.isArray(file.countries)) {
    throw new CountriesFileError([...problems, "الحقل countries ليس قائمة"]);
  }
  const list = file.countries as unknown[];

  if (file.count !== list.length) {
    problems.push(`الحقل count = ${String(file.count)} لكن القائمة فيها ${list.length}`);
  }
  if (list.length !== EXPECTED_COUNTRY_COUNT) {
    problems.push(`عدد الدول ${list.length} والمتوقع ${EXPECTED_COUNTRY_COUNT}`);
  }

  const seenSlugs = new Map<string, number>();
  const rows: CountryRow[] = [];

  list.forEach((item, i) => {
    const c = (item ?? {}) as Raw;
    const at = `الدولة رقم ${i + 1}${typeof c.slug === "string" ? ` (${c.slug})` : ""}`;
    const err = (msg: string) => problems.push(`${at}: ${msg}`);

    const slug = typeof c.slug === "string" ? c.slug : "";
    if (!SLUG_PATTERN.test(slug)) err("slug غير صالح");
    const firstIndex = seenSlugs.get(slug);
    if (slug && firstIndex !== undefined) err(`slug مكرر مع الدولة رقم ${firstIndex + 1}`);
    else seenSlugs.set(slug, i);

    const nameAr = optionalText(c.nameAr);
    const nameEn = optionalText(c.nameEn);
    if (!nameAr) err("nameAr مفقود");
    if (!nameEn) err("nameEn مفقود");

    if (!isEnumValue(Region, c.region)) err(`region غير معروف: ${String(c.region)}`);
    if (!isEnumValue(EntryType, c.entryType)) err(`entryType غير معروف: ${String(c.entryType)}`);
    if (!isEnumValue(InsuranceRequirement, c.insurance)) {
      err(`insurance غير معروف: ${String(c.insurance)}`);
    }
    if (c.audience !== Audience.saudi_citizen) {
      err(`audience يجب أن يكون saudi_citizen، والموجود: ${String(c.audience)}`);
    }

    for (const key of ["arabCountry", "schengen", "travelAdvisory", "needsVerification"]) {
      if (typeof c[key] !== "boolean") err(`${key} يجب أن يكون true أو false`);
    }

    const verifiedAt = parseDate(c.verifiedAt);
    if (!verifiedAt) err(`verifiedAt ليس تاريخاً بصيغة YYYY-MM-DD: ${String(c.verifiedAt)}`);

    if (problems.length > 0) return;

    rows.push({
      country: {
        slug,
        nameAr: nameAr!,
        nameEn: nameEn!,
        region: c.region as Region,
        arabCountry: c.arabCountry as boolean,
        schengen: c.schengen as boolean,
        travelAdvisory: c.travelAdvisory as boolean,
      },
      entryRule: {
        audience: Audience.saudi_citizen,
        nationality: SAUDI_NATIONALITY,
        entryType: c.entryType as EntryType,
        stay: optionalText(c.stay),
        notes: optionalText(c.notes),
        vaccination: optionalText(c.vaccination),
        insurance: c.insurance as InsuranceRequirement,
        needsVerification: c.needsVerification as boolean,
        sourceName: sourceName!,
        // الملف لا يحوي روابط رسمية؛ هذه السجلات تظهر لاحقاً في قائمة «يحتاج مصدراً رسمياً».
        sourceUrl: null,
        verifiedAt: verifiedAt!,
      },
    });
  });

  if (problems.length > 0) throw new CountriesFileError(problems);
  return rows;
}
