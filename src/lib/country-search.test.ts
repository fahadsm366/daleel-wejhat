import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EntryType, Region } from "../generated/prisma/enums";
import {
  EMPTY_FILTERS,
  featuredCountries,
  filterCountries,
  filtersFromSearchParams,
  filtersToSearchParams,
  normalizeSearchText,
  type SearchableCountry,
} from "./country-search";

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

describe("filterCountries مع حالة قيد التحقق", () => {
  const expired = country({ nameAr: "الجبل الأسود", nameEn: "Montenegro", entryType: null });

  it("تظهر في القائمة الافتراضية وعند البحث باسمها", () => {
    assert.deepEqual(names(filterCountries([expired], NO_FILTERS)), ["Montenegro"]);
    assert.deepEqual(names(filterCountries([expired], { ...NO_FILTERS, query: "الجبل" })), ["Montenegro"]);
  });

  it("لا تطابق أي مرشح نوع دخول", () => {
    for (const type of Object.values(EntryType)) {
      assert.deepEqual(filterCountries([expired], { ...NO_FILTERS, entryType: type }), [], type);
    }
  });
});

describe("featuredCountries", () => {
  it("يعيد المميزة فقط مرتبة بـ featuredOrder ويستبعد المحذّر منها", () => {
    // مرتبة أبجدياً كما تصل من getCountryList، والمتوقع ترتيب featuredOrder.
    const list = [
      { slug: "egypt", featuredOrder: 7, travelAdvisory: false },
      { slug: "georgia", featuredOrder: 1, travelAdvisory: false },
      { slug: "singapore", featuredOrder: null, travelAdvisory: false },
      { slug: "turkey", featuredOrder: 2, travelAdvisory: false },
      { slug: "yemen", featuredOrder: 3, travelAdvisory: true },
    ];
    assert.deepEqual(
      featuredCountries(list).map((c) => c.slug),
      ["georgia", "turkey", "egypt"],
    );
  });

  it("لا يعدّل ترتيب القائمة الأصلية", () => {
    const list = [
      { slug: "b", featuredOrder: 2, travelAdvisory: false },
      { slug: "a", featuredOrder: 1, travelAdvisory: false },
    ];
    featuredCountries(list);
    assert.deepEqual(list.map((c) => c.slug), ["b", "a"]);
  });
});

describe("المرشحات في رابط الصفحة", () => {
  it("يقرأ البحث والمرشحات من الرابط", () => {
    const params = new URLSearchParams("q=%D8%AC%D9%88%D8%B1%D8%AC%D9%8A%D8%A7&type=visa_free&region=europe");
    assert.deepEqual(filtersFromSearchParams(params), {
      query: "جورجيا",
      entryType: EntryType.visa_free,
      region: Region.europe,
    });
  });

  it("رابط بلا معاملات = بلا مرشحات", () => {
    assert.deepEqual(filtersFromSearchParams(new URLSearchParams()), EMPTY_FILTERS);
  });

  it("يهمل القيم غير المعروفة في النوع والمنطقة", () => {
    const params = new URLSearchParams("type=visa_maybe&region=antarctica&q=x");
    assert.deepEqual(filtersFromSearchParams(params), { query: "x", entryType: null, region: null });
  });

  it("يكتب المرشحات المستخدمة فقط", () => {
    const params = filtersToSearchParams({ query: "تركيا", entryType: null, region: Region.europe });
    assert.equal(params.get("q"), "تركيا");
    assert.equal(params.has("type"), false);
    assert.equal(params.get("region"), "europe");
  });

  it("المرشحات الفارغة تعطي رابطاً نظيفاً، ونص المسافات يُعامل كفارغ", () => {
    assert.equal(filtersToSearchParams(EMPTY_FILTERS).toString(), "");
    assert.equal(filtersToSearchParams({ ...EMPTY_FILTERS, query: "  " }).toString(), "");
  });

  it("يحذف المرشح الذي أُلغي ويحافظ على المعاملات الأخرى", () => {
    const current = new URLSearchParams("q=old&type=eta&utm_source=x");
    const params = filtersToSearchParams({ ...EMPTY_FILTERS, region: Region.asia }, current);
    assert.equal(params.toString(), "utm_source=x&region=asia");
    assert.equal(current.get("q"), "old", "لا يعدّل المعاملات الأصلية");
  });

  it("القراءة بعد الكتابة تعيد المرشحات نفسها", () => {
    const filters = { query: "كوريا الجنوبية", entryType: EntryType.eta, region: Region.asia };
    assert.deepEqual(filtersFromSearchParams(filtersToSearchParams(filters)), filters);
  });
});
