import Link from "next/link";
import { useTranslations } from "next-intl";

import { EntryTypeBadge, NeedsVerificationBadge, TravelAdvisoryBadge } from "@/components/Badge";
import type { EntryType } from "@/generated/prisma/enums";
import styles from "./CountryCard.module.css";

/** ما تحتاجه البطاقة فقط، بقيم قابلة للتمرير من الخادم إلى مكون عميل. */
export type CountryCardData = {
  slug: string;
  nameAr: string;
  nameEn: string;
  /** null = انتهى إعفاء مؤقت والحالة الجديدة قيد التحقق */
  entryType: EntryType | null;
  stay: string | null;
  /** إعفاء مؤقت داخل مدة التنبيه أو منتهٍ (docs/spec.md القسم 4.2)، وإلا null */
  exemption: { expired: boolean; /** YYYY-MM-DD */ validUntil: string } | null;
  travelAdvisory: boolean;
  needsVerification: boolean;
  sourceName: string;
  /** YYYY-MM-DD */
  verifiedAt: string;
};

export function CountryCard({ country }: { country: CountryCardData }) {
  const t = useTranslations("countryCard");

  return (
    <article className={styles.card}>
      <div className={styles.names}>
        <h3 className={styles.name}>
          <Link href={`/countries/${country.slug}`} className={styles.link}>
            {country.nameAr}
          </Link>
        </h3>
        <span className={styles.nameEn} dir="ltr" lang="en">
          {country.nameEn}
        </span>
      </div>

      <div className={styles.badges}>
        {country.travelAdvisory && <TravelAdvisoryBadge />}
        {country.entryType && <EntryTypeBadge type={country.entryType} />}
        {country.needsVerification && <NeedsVerificationBadge />}
      </div>

      {country.exemption && (
        <p className={styles.exemption}>
          {t.rich(exemptionMessage(country), {
            date: country.exemption.validUntil,
            data: (chunks) => (
              <span dir="ltr" className={styles.data}>
                {chunks}
              </span>
            ),
          })}
        </p>
      )}

      {country.stay && <p>{t("stay", { stay: country.stay })}</p>}

      <div className={styles.meta}>
        <span>
          {t.rich("source", {
            source: country.sourceName,
            data: (chunks) => (
              <span dir="ltr" lang="en">
                {chunks}
              </span>
            ),
          })}
        </span>
        <span>
          {t.rich("verifiedAt", {
            date: country.verifiedAt,
            data: (chunks) => (
              <span dir="ltr" className={styles.data}>
                {chunks}
              </span>
            ),
          })}
        </span>
      </div>
    </article>
  );
}

function exemptionMessage({ entryType, exemption }: CountryCardData) {
  if (!exemption?.expired) return "exemptionEnds";
  return entryType ? "exemptionEnded" : "exemptionEndedUnknown";
}
