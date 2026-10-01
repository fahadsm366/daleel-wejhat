import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  CountriesFileError,
  EXPECTED_COUNTRY_COUNT,
  parseCountriesFile,
  SAUDI_NATIONALITY,
} from "./countries";

const realFile = JSON.parse(readFileSync("data/countries.json", "utf8")) as {
  source: string;
  count: number;
  countries: Record<string, unknown>[];
};

/** نسخة من الملف الحقيقي يمكن تعديلها في كل اختبار دون التأثير على غيره. */
function copyOfFile() {
  return structuredClone(realFile);
}

function problemsOf(json: unknown): string[] {
  try {
    parseCountriesFile(json);
  } catch (error) {
    assert.ok(error instanceof CountriesFileError);
    return error.problems;
  }
  assert.fail("كان يجب أن يُرفض الملف");
}

describe("data/countries.json", () => {
  const rows = parseCountriesFile(realFile);

  it("فيه 199 دولة بالضبط", () => {
    assert.equal(EXPECTED_COUNTRY_COUNT, 199);
    assert.equal(rows.length, 199);
  });

  it("لا يوجد slug مكرر", () => {
    const slugs = rows.map((r) => r.country.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("كل سجل دخول للمواطن السعودي وله مصدر وتاريخ تحقق", () => {
    for (const { entryRule } of rows) {
      assert.equal(entryRule.audience, "saudi_citizen");
      assert.equal(entryRule.nationality, SAUDI_NATIONALITY);
      assert.ok(entryRule.sourceName.length > 0);
      assert.ok(entryRule.verifiedAt instanceof Date);
    }
  });

  it("يحوّل النص الفارغ والقيم الفارغة إلى null", () => {
    const withoutStay = rows.find((r) => r.entryRule.stay === null);
    assert.ok(withoutStay, "يوجد في الملف دول بلا مدة إقامة");
    assert.ok(rows.every((r) => r.entryRule.notes !== ""));
  });

  it("أبرز الوجهات ثماني دول بلا تحذير سفر بالترتيب المعتمد", () => {
    const featured = rows
      .map((r) => r.country)
      .filter((c) => c.featuredOrder !== null)
      .sort((a, b) => a.featuredOrder! - b.featuredOrder!);
    assert.deepEqual(
      featured.map((c) => c.slug),
      ["georgia", "turkey", "azerbaijan", "malaysia", "thailand", "maldives", "egypt", "jordan"],
    );
    assert.deepEqual(
      featured.map((c) => c.featuredOrder),
      [1, 2, 3, 4, 5, 6, 7, 8],
    );
    assert.ok(featured.every((c) => !c.travelAdvisory));
  });

  it("إعفاء الجبل الأسود ينتهي 2026-10-31 وبعده تأشيرة مسبقة", () => {
    const montenegro = rows.find((r) => r.country.slug === "montenegro")!.entryRule;
    assert.equal(montenegro.entryType, "visa_free");
    assert.equal(montenegro.validUntil?.toISOString().slice(0, 10), "2026-10-31");
    assert.equal(montenegro.entryTypeAfter, "visa_required");
  });
});

describe("رفض الملفات غير الصالحة", () => {
  it("يرفض slug مكرراً ويذكر رقم الدولة الأولى", () => {
    const file = copyOfFile();
    file.countries[5]!.slug = file.countries[0]!.slug;
    const problems = problemsOf(file);
    assert.ok(problems.some((p) => p.includes("مكرر") && p.includes("رقم 1")));
  });

  it("يرفض عدداً غير 199", () => {
    const file = copyOfFile();
    file.countries.pop();
    file.count = file.countries.length;
    assert.ok(problemsOf(file).some((p) => p.includes("198")));
  });

  it("يرفض اختلاف الحقل count عن طول القائمة", () => {
    const file = copyOfFile();
    file.count = 200;
    assert.ok(problemsOf(file).some((p) => p.includes("count")));
  });

  it("يرفض قيماً خارج الأنواع المحددة", () => {
    const file = copyOfFile();
    file.countries[0]!.entryType = "visa_maybe";
    file.countries[1]!.region = "antarctica";
    file.countries[2]!.insurance = "optional";
    file.countries[3]!.audience = "resident";
    assert.equal(problemsOf(file).length, 4);
  });

  it("يرفض تاريخ تحقق غير صالح", () => {
    const file = copyOfFile();
    file.countries[0]!.verifiedAt = "2026-02-30";
    assert.ok(problemsOf(file).some((p) => p.includes("verifiedAt")));
  });

  it("يرفض slug بأحرف كبيرة أو مسافات", () => {
    const file = copyOfFile();
    file.countries[0]!.slug = "United Arab Emirates";
    assert.ok(problemsOf(file).some((p) => p.includes("slug غير صالح")));
  });

  it("يرفض entryTypeAfter بلا validUntil أو بنوع غير معروف", () => {
    const file = copyOfFile();
    file.countries[0]!.entryTypeAfter = "visa_required";
    file.countries[1]!.validUntil = "2026-12-01";
    file.countries[1]!.entryTypeAfter = "visa_maybe";
    const problems = problemsOf(file);
    assert.ok(problems.some((p) => p.includes("رقم 1") && p.includes("بلا validUntil")));
    assert.ok(problems.some((p) => p.includes("رقم 2") && p.includes("entryTypeAfter غير معروف")));
  });

  it("يرفض validUntil بتاريخ غير صالح", () => {
    const file = copyOfFile();
    file.countries[0]!.validUntil = "31-10-2026";
    assert.ok(problemsOf(file).some((p) => p.includes("validUntil")));
  });

  it("يرفض featuredOrder غير صحيح أو أقل من 1", () => {
    const file = copyOfFile();
    file.countries[0]!.featuredOrder = "1";
    file.countries[1]!.featuredOrder = 0;
    file.countries[2]!.featuredOrder = 2.5;
    const problems = problemsOf(file).filter((p) => p.includes("featuredOrder"));
    assert.equal(problems.length, 3);
  });

  it("يرفض featuredOrder مكرراً ويذكر الدولة الأولى", () => {
    const file = copyOfFile();
    // جورجيا ترتيبها 1، ونعطي الترتيب نفسه لدولة بعدها في الملف.
    const georgia = file.countries.findIndex((c) => c.slug === "georgia");
    file.countries[georgia + 1]!.featuredOrder = 1;
    assert.ok(
      problemsOf(file).some(
        (p) => p.includes(`رقم ${georgia + 2}`) && p.includes(`featuredOrder مكرر مع الدولة رقم ${georgia + 1}`),
      ),
    );
  });

  it("يرفض الملف بلا اسم مصدر", () => {
    const file = copyOfFile();
    file.source = "";
    assert.ok(problemsOf(file).some((p) => p.includes("source")));
  });
});
