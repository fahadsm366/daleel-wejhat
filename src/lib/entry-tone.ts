import { EntryType } from "../generated/prisma/enums";

/**
 * درجة اللون لكل نوع دخول، وتقابل متغيرات tokens.css:
 * free → --entry-free، eta → --entry-eta، visa → --entry-visa.
 * اللون لا يُعرض وحده أبداً؛ كلمة الحالة تُكتب بجانبه دائماً (CLAUDE.md القاعدة 3).
 */
export type EntryTone = "free" | "eta" | "visa";

export const ENTRY_TONE: Record<EntryType, EntryTone> = {
  [EntryType.gcc]: "free",
  [EntryType.visa_free]: "free",
  [EntryType.eta]: "eta",
  [EntryType.visa_on_arrival]: "eta",
  [EntryType.evisa_or_voa]: "eta",
  [EntryType.evisa]: "eta",
  [EntryType.visa_required]: "visa",
};

export function entryTone(type: EntryType): EntryTone {
  return ENTRY_TONE[type];
}
