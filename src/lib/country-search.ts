import { EntryType, Region } from "../generated/prisma/enums";

/** ما يحتاجه البحث والتصفية من كل دولة. */
export type SearchableCountry = {
  nameAr: string;
  nameEn: string;
  /** null = انتهى إعفاء مؤقت والحالة الجديدة قيد التحقق، فلا تطابق أي مرشح نوع */
  entryType: EntryType | null;
  region: Region;
  travelAdvisory: boolean;
};

export type CountryFilters = {
  query: string;
  /** null = كل الأنواع */
  entryType: EntryType | null;
  /** null = كل المناطق */
  region: Region | null;
};

// التشكيل والألف الخنجرية والتطويل، ثم علامات الحروف اللاتينية (é → e).
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const LATIN_MARKS = /[̀-ͯ]/g;
const NOT_LETTER_OR_DIGIT = /[^\p{L}\p{N}]/gu;

/**
 * يوحّد النص للمقارنة: الهمزات على الألف (أ إ آ ٱ) ألفاً، والتاء المربوطة هاءً،
 * والألف المقصورة ياءً، ويحذف التشكيل والمسافات وعلامات الترقيم، ويصغّر اللاتيني.
 * مثال: «اسبانيا» تطابق «إسبانيا»، و«كوريا الجنوبيه» تطابق «كوريا الجنوبية»،
 * و«cote divoire» تطابق «Côte d'Ivoire».
 */
export function normalizeSearchText(text: string): string {
  return (
    text
      // NFD يفصل الهمزة والمدة عن الألف (أ → ا + همزة)، ثم تُحذف العلامة.
      .normalize("NFD")
      .replace(ARABIC_MARKS, "")
      .replace(LATIN_MARKS, "")
      .replace(/ٱ/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/[ىی]/g, "ي")
      .replace(/ک/g, "ك")
      .toLowerCase()
      .replace(NOT_LETTER_OR_DIGIT, "")
  );
}

/** هل الدولة تطابق نص البحث (المُوحَّد مسبقاً) بالاسم العربي أو الإنجليزي؟ */
function matchesName(country: SearchableCountry, normalizedQuery: string): boolean {
  return (
    normalizeSearchText(country.nameAr).includes(normalizedQuery) ||
    normalizeSearchText(country.nameEn).includes(normalizedQuery)
  );
}

/**
 * القائمة الافتراضية (بلا نص بحث) تستبعد الدول التي عليها تحذير سفر.
 * عند كتابة اسم الدولة تظهر في النتائج حتى لو كان عليها تحذير (docs/spec.md القسم 4.1).
 * مرشحا نوع الدخول والمنطقة لا يغيّران هذه القاعدة.
 */
export function filterCountries<T extends SearchableCountry>(
  countries: readonly T[],
  { query, entryType, region }: CountryFilters,
): T[] {
  const q = normalizeSearchText(query);

  return countries.filter(
    (c) =>
      (entryType === null || c.entryType === entryType) &&
      (region === null || c.region === region) &&
      (q === "" ? !c.travelAdvisory : matchesName(c, q)),
  );
}

/**
 * دول «أبرز الوجهات» بالترتيب الذي وصلت به، دون الدول التي عليها تحذير سفر
 * حتى لو كانت مميزة في البيانات (docs/spec.md القسم 4.1).
 */
export function featuredCountries<T extends { featured: boolean; travelAdvisory: boolean }>(
  countries: readonly T[],
): T[] {
  return countries.filter((c) => c.featured && !c.travelAdvisory);
}

// ───────────── حفظ البحث والمرشحات في رابط الصفحة ─────────────

/** أسماء المعاملات في الرابط، مثل /?q=جورجيا&type=visa_free&region=europe */
export const FILTER_PARAMS = { query: "q", entryType: "type", region: "region" } as const;

export const EMPTY_FILTERS: CountryFilters = { query: "", entryType: null, region: null };

function enumParam<T extends string>(e: Record<string, T>, value: string | null): T | null {
  return value !== null && (Object.values(e) as string[]).includes(value) ? (value as T) : null;
}

/** يقرأ المرشحات من الرابط. القيم غير المعروفة تُهمل بدل أن تُفرغ النتائج. */
export function filtersFromSearchParams(params: Pick<URLSearchParams, "get">): CountryFilters {
  return {
    query: params.get(FILTER_PARAMS.query) ?? "",
    entryType: enumParam(EntryType, params.get(FILTER_PARAMS.entryType)),
    region: enumParam(Region, params.get(FILTER_PARAMS.region)),
  };
}

/**
 * يكتب المرشحات في معاملات الرابط ويحافظ على أي معاملات أخرى موجودة.
 * المرشح الفارغ يُحذف من الرابط، فالصفحة بلا بحث رابطها نظيف.
 */
export function filtersToSearchParams(
  filters: CountryFilters,
  current: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = new URLSearchParams(current);
  const values: Record<keyof CountryFilters, string | null> = {
    query: filters.query.trim() === "" ? null : filters.query,
    entryType: filters.entryType,
    region: filters.region,
  };
  for (const key of Object.keys(FILTER_PARAMS) as (keyof CountryFilters)[]) {
    const value = values[key];
    if (value === null) params.delete(FILTER_PARAMS[key]);
    else params.set(FILTER_PARAMS[key], value);
  }
  return params;
}
