import type { EntryType } from "../generated/prisma/enums";

/**
 * مدة التنبيه قبل انتهاء الإعفاء المؤقت بالأيام. القيم هنا افتراضية فقط،
 * وتصبح إعداداً يعدّله المشرف من لوحة الإدارة (المهمة 9) فتُمرَّر للدالة.
 */
export type ExemptionSettings = {
  /** يبدأ التنبيه قبل هذا العدد من الأيام */
  noticeDays: number;
  /** ويصبح عاجلاً قبل هذا العدد */
  urgentDays: number;
};

export const DEFAULT_EXEMPTION_SETTINGS: ExemptionSettings = { noticeDays: 30, urgentDays: 7 };

/**
 * - active: الإعفاء سارٍ ولم يبدأ التنبيه بعد.
 * - notice: داخل مدة التنبيه، والمسافر يرى «هذا الإعفاء ينتهي في [التاريخ]».
 * - urgent: داخل التنبيه العاجل (يهم لوحة الإدارة، والمسافر يرى التنبيه نفسه).
 * - expired: انتهى الإعفاء.
 */
export type ExemptionPhase = "active" | "notice" | "urgent" | "expired";

export type EntryRuleValidity = {
  entryType: EntryType;
  entryTypeAfter: EntryType | null;
  /** YYYY-MM-DD، آخر يوم تصح فيه الحالة الحالية */
  validUntil: string | null;
  needsVerification: boolean;
};

export type ResolvedEntry = {
  /** الحالة المعروضة الآن. null = انتهى الإعفاء ولا تُعرف الحالة الجديدة، فهي «قيد التحقق». */
  entryType: EntryType | null;
  needsVerification: boolean;
  /** null = لا يوجد إعفاء مؤقت على هذه القاعدة */
  exemption: {
    phase: ExemptionPhase;
    /** YYYY-MM-DD */
    validUntil: string;
    /** 0 = آخر يوم، وسالب بعد الانتهاء */
    daysLeft: number;
  } | null;
};

const DAY_MS = 86_400_000;

function dayNumber(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS;
}

/** تاريخ اليوم في المملكة (YYYY-MM-DD)، لأن الإعفاء ينتهي بنهاية يومه بتوقيت الرياض لا UTC. */
export function todayInRiyadh(now: Date = new Date()): string {
  // en-CA يكتب التاريخ بصيغة YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * الحالة الصحيحة لقاعدة دخول في يوم معين (docs/spec.md القسم 4.2).
 * بعد validUntil تتحول الحالة إلى entryTypeAfter إن كانت معروفة، وإلا تصبح «قيد التحقق»،
 * وفي الحالتين تظهر شارة «تحتاج تحقق» حتى يُحدَّث السجل.
 */
export function resolveEntryRule(
  rule: EntryRuleValidity,
  today: string,
  settings: ExemptionSettings = DEFAULT_EXEMPTION_SETTINGS,
): ResolvedEntry {
  if (rule.validUntil === null) {
    return { entryType: rule.entryType, needsVerification: rule.needsVerification, exemption: null };
  }

  const daysLeft = dayNumber(rule.validUntil) - dayNumber(today);
  const exemption = { validUntil: rule.validUntil, daysLeft };

  if (daysLeft < 0) {
    return {
      entryType: rule.entryTypeAfter,
      needsVerification: true,
      exemption: { ...exemption, phase: "expired" },
    };
  }

  const phase: ExemptionPhase =
    daysLeft <= settings.urgentDays ? "urgent" : daysLeft <= settings.noticeDays ? "notice" : "active";
  return {
    entryType: rule.entryType,
    needsVerification: rule.needsVerification,
    exemption: { ...exemption, phase },
  };
}
