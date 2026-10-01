import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EntryType } from "../generated/prisma/enums";
import { entryTone } from "./entry-tone";

// المرجع: وصف entry-free و entry-eta و entry-visa في design/tokens.json.
describe("entryTone", () => {
  it("حرية التنقل والدخول بدون تأشيرة باللون الأخضر", () => {
    assert.equal(entryTone(EntryType.gcc), "free");
    assert.equal(entryTone(EntryType.visa_free), "free");
  });

  it("التصريح الإلكتروني والتأشيرة الإلكترونية أو عند الوصول باللون الأزرق", () => {
    assert.equal(entryTone(EntryType.eta), "eta");
    assert.equal(entryTone(EntryType.visa_on_arrival), "eta");
    assert.equal(entryTone(EntryType.evisa_or_voa), "eta");
    assert.equal(entryTone(EntryType.evisa), "eta");
  });

  it("التأشيرة المسبقة من السفارة باللون الأحمر", () => {
    assert.equal(entryTone(EntryType.visa_required), "visa");
  });

  it("كل أنواع الدخول لها درجة لون", () => {
    for (const type of Object.values(EntryType)) {
      assert.ok(["free", "eta", "visa"].includes(entryTone(type)), type);
    }
  });
});
