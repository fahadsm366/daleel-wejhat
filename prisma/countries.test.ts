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

  it("يرفض الملف بلا اسم مصدر", () => {
    const file = copyOfFile();
    file.source = "";
    assert.ok(problemsOf(file).some((p) => p.includes("source")));
  });
});
