import type { EntryType, Region } from "../generated/prisma/enums";

/** ما يحتاجه البحث والتصفية من كل دولة. */
export type SearchableCountry = {
  nameAr: string;
  nameEn: string;
  entryType: EntryType;
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
