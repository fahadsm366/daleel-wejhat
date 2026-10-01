import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EntryType } from "../generated/prisma/enums";
import { type EntryRuleValidity, resolveEntryRule, todayInRiyadh } from "./entry-validity";

// الجبل الأسود كما في data/countries.json: بدون تأشيرة حتى 2026-10-31، ثم تأشيرة مسبقة.
const montenegro: EntryRuleValidity = {
  entryType: EntryType.visa_free,
  entryTypeAfter: EntryType.visa_required,
  validUntil: "2026-10-31",
  needsVerification: false,
};

const unknownAfter: EntryRuleValidity = { ...montenegro, entryTypeAfter: null };

describe("resolveEntryRule", () => {
  it("قاعدة بلا إعفاء مؤقت تبقى كما هي", () => {
    const rule = { ...montenegro, validUntil: null, entryTypeAfter: null };
    assert.deepEqual(resolveEntryRule(rule, "2030-01-01"), {
      entryType: EntryType.visa_free,
      needsVerification: false,
      exemption: null,
    });
  });

  it("قبل مدة التنبيه: الحالة الحالية بلا تنبيه", () => {
    const r = resolveEntryRule(montenegro, "2026-09-30");
    assert.equal(r.entryType, EntryType.visa_free);
    assert.equal(r.needsVerification, false);
    assert.equal(r.exemption?.phase, "active");
    assert.equal(r.exemption?.daysLeft, 31);
  });

  it("داخل مدة التنبيه (30 يوماً): الحالة الحالية مع التنبيه", () => {
    const r = resolveEntryRule(montenegro, "2026-10-01");
    assert.equal(r.entryType, EntryType.visa_free);
    assert.equal(r.exemption?.phase, "notice");
    assert.equal(r.exemption?.daysLeft, 30);
    assert.equal(resolveEntryRule(montenegro, "2026-10-23").exemption?.phase, "notice");
  });

  it("داخل التنبيه العاجل (7 أيام) حتى آخر يوم", () => {
    assert.equal(resolveEntryRule(montenegro, "2026-10-24").exemption?.phase, "urgent");
    const lastDay = resolveEntryRule(montenegro, "2026-10-31");
    assert.equal(lastDay.entryType, EntryType.visa_free, "آخر يوم ما زال الإعفاء سارياً");
    assert.equal(lastDay.exemption?.phase, "urgent");
    assert.equal(lastDay.exemption?.daysLeft, 0);
  });

  it("الجبل الأسود بعد 2026-10-31: تأشيرة مسبقة مع شارة «تحتاج تحقق»", () => {
    for (const day of ["2026-11-01", "2026-12-15", "2027-06-01"]) {
      const r = resolveEntryRule(montenegro, day);
      assert.equal(r.entryType, EntryType.visa_required, day);
      assert.equal(r.needsVerification, true, day);
      assert.equal(r.exemption?.phase, "expired", day);
      assert.equal(r.exemption?.validUntil, "2026-10-31");
    }
    assert.equal(resolveEntryRule(montenegro, "2026-11-01").exemption?.daysLeft, -1);
  });

  it("بعد الانتهاء بلا حالة معروفة: الحالة قيد التحقق (null) مع الشارة", () => {
    const r = resolveEntryRule(unknownAfter, "2026-11-01");
    assert.equal(r.entryType, null);
    assert.equal(r.needsVerification, true);
    assert.equal(r.exemption?.phase, "expired");
  });

  it("الشارة تبقى إن كانت القاعدة تحتاج تحقق أصلاً قبل الانتهاء", () => {
    const r = resolveEntryRule({ ...montenegro, needsVerification: true }, "2026-10-01");
    assert.equal(r.needsVerification, true);
  });

  it("مدة التنبيه إعداد يُمرَّر للدالة", () => {
    const settings = { noticeDays: 60, urgentDays: 14 };
    assert.equal(resolveEntryRule(montenegro, "2026-09-10", settings).exemption?.phase, "notice");
    assert.equal(resolveEntryRule(montenegro, "2026-10-17", settings).exemption?.phase, "urgent");
  });

  it("يحسب الأيام صحيحاً عبر نهاية الشهر والسنة", () => {
    const rule = { ...montenegro, validUntil: "2027-01-02" };
    assert.equal(resolveEntryRule(rule, "2026-12-31").exemption?.daysLeft, 2);
  });
});

describe("todayInRiyadh", () => {
  it("يتقدّم اليوم في الرياض قبل UTC بثلاث ساعات", () => {
    // 21:30 UTC يوم 31 أكتوبر = 00:30 يوم 1 نوفمبر في الرياض، فينتهي إعفاء الجبل الأسود.
    const now = new Date("2026-10-31T21:30:00Z");
    assert.equal(todayInRiyadh(now), "2026-11-01");
    assert.equal(resolveEntryRule(montenegro, todayInRiyadh(now)).entryType, EntryType.visa_required);
  });

  it("قبل منتصف الليل في الرياض يبقى اليوم نفسه", () => {
    assert.equal(todayInRiyadh(new Date("2026-10-31T20:59:00Z")), "2026-10-31");
  });
});
