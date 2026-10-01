import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EntryType, Region } from "../generated/prisma/enums";
import { filterCountries, normalizeSearchText, type SearchableCountry } from "./country-search";

describe("normalizeSearchText", () => {
  it("يوحّد الهمزات على الألف", () => {
    for (const name of ["أرمينيا", "إيران", "آيسلندا", "ٱيسلندا"]) {
      assert.equal(normalizeSearchText(name)[0], "ا", name);
    }
    assert.equal(normalizeSearchText("إندونيسيا"), normalizeSearchText("اندونيسيا"));
  });

  it("يوحّد التاء المربوطة مع الهاء", () => {
    assert.equal(normalizeSearchText("سنغافورة"), normalizeSearchText("سنغافوره"));
  });

  it("يوحّد الألف المقصورة مع الياء", () => {
    assert.equal(normalizeSearchText("ملاوى"), normalizeSearchText("ملاوي"));
  });

  it("يحذف التشكيل والتطويل", () => {
    assert.equal(normalizeSearchText("جُورْجِيَا"), "جورجيا");
    assert.equal(normalizeSearchText("جورجـــيا"), "جورجيا");
  });

  it("يتجاهل المسافات وعلامات الترقيم", () => {
    assert.equal(normalizeSearchText(" كوريا  الجنوبية "), normalizeSearchText("كورياالجنوبيه"));
    assert.equal(normalizeSearchText("Timor-Leste"), "timorleste");
  });

  it("يصغّر اللاتيني ويحذف علاماته", () => {
    assert.equal(normalizeSearchText("Côte d'Ivoire"), "cotedivoire");
    assert.equal(normalizeSearchText("São Tomé"), "saotome");
  });

  it("النص الفارغ أو المسافات فقط يصبح فارغاً", () => {
    assert.equal(normalizeSearchText("   "), "");
  });
});

const country = (overrides: Partial<SearchableCountry> & Pick<SearchableCountry, "nameAr" | "nameEn">) => ({
  entryType: EntryType.visa_free,
  region: Region.asia,
  travelAdvisory: false,
  ...overrides,
});

const COUNTRIES = [
  country({ nameAr: "جورجيا", nameEn: "Georgia", region: Region.europe }),
  country({ nameAr: "إندونيسيا", nameEn: "Indonesia", entryType: EntryType.evisa_or_voa }),
  country({ nameAr: "سنغافورة", nameEn: "Singapore" }),
  country({ nameAr: "كوريا الجنوبية", nameEn: "South Korea", entryType: EntryType.eta }),
  country({ nameAr: "إيران", nameEn: "Iran", region: Region.middle_east, travelAdvisory: true }),
  country({ nameAr: "اليمن", nameEn: "Yemen", region: Region.middle_east, entryType: EntryType.visa_required, travelAdvisory: true }),
];

const names = (list: SearchableCountry[]) => list.map((c) => c.nameEn);
const NO_FILTERS = { query: "", entryType: null, region: null };

describe("filterCountries", () => {
  it("القائمة الافتراضية تستبعد الدول التي عليها تحذير سفر", () => {
    assert.deepEqual(names(filterCountries(COUNTRIES, NO_FILTERS)), [
      "Georgia",
      "Indonesia",
      "Singapore",
      "South Korea",
    ]);
  });

  it("الدولة المحذّر منها تظهر عند كتابة اسمها", () => {
    assert.deepEqual(names(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "ايران" })), ["Iran"]);
    assert.deepEqual(names(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "yemen" })), ["Yemen"]);
  });

  it("مرشح المنطقة وحده لا يُظهر الدول المحذّر منها", () => {
    assert.deepEqual(
      names(filterCountries(COUNTRIES, { ...NO_FILTERS, region: Region.middle_east })),
      [],
    );
  });

  it("مرشح نوع الدخول وحده لا يُظهر الدول المحذّر منها", () => {
    assert.deepEqual(
      names(filterCountries(COUNTRIES, { ...NO_FILTERS, entryType: EntryType.visa_required })),
      [],
    );
  });

  it("يبحث بالاسم العربي مع توحيد الهمزات والتاء المربوطة", () => {
    assert.deepEqual(names(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "اندونيسيا" })), ["Indonesia"]);
    assert.deepEqual(names(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "سنغافوره" })), ["Singapore"]);
  });

  it("يبحث بالاسم الإنجليزي دون اعتبار لحالة الأحرف", () => {
    assert.deepEqual(names(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "GEOR" })), ["Georgia"]);
  });

  it("يطابق جزءاً من الاسم", () => {
    assert.deepEqual(names(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "كوريا" })), ["South Korea"]);
  });

  it("يجمع البحث مع المرشحات", () => {
    assert.deepEqual(
      names(filterCountries(COUNTRIES, { query: "ا", entryType: EntryType.visa_free, region: Region.asia })),
      ["Singapore"],
    );
    assert.deepEqual(
      names(filterCountries(COUNTRIES, { query: "ايران", entryType: EntryType.eta, region: null })),
      [],
    );
  });

  it("نص بحث من مسافات فقط يعامَل كأنه فارغ", () => {
    assert.equal(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "   " }).length, 4);
  });

  it("لا نتائج لاسم غير موجود", () => {
    assert.deepEqual(filterCountries(COUNTRIES, { ...NO_FILTERS, query: "أطلانتس" }), []);
  });
});
