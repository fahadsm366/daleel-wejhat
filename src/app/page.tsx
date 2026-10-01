import { getTranslations } from "next-intl/server";

import countriesFile from "@data/countries.json";

import { EntryTypeBadge, NeedsVerificationBadge, TravelAdvisoryBadge } from "@/components/Badge";
import { CountryCard, type CountryCardData } from "@/components/CountryCard";
import { Logo } from "@/components/Logo";
import { EntryType } from "@/generated/prisma/enums";
import { entryTone } from "@/lib/entry-tone";
import { parseCountriesFile } from "../../prisma/countries";
import styles from "./page.module.css";

// صفحة مؤقتة لمعاينة المكونات الأساسية (المهمة 4) ببيانات حقيقية من data/countries.json.
// تُستبدل بالصفحة الرئيسية الفعلية في المهمة 5.

function toCards(): CountryCardData[] {
  return parseCountriesFile(countriesFile).map(({ country, entryRule }) => ({
    slug: country.slug,
    nameAr: country.nameAr,
    nameEn: country.nameEn,
    entryType: entryRule.entryType,
    stay: entryRule.stay,
    travelAdvisory: country.travelAdvisory,
    needsVerification: entryRule.needsVerification,
    sourceName: entryRule.sourceName,
    verifiedAt: entryRule.verifiedAt.toISOString().slice(0, 10),
  }));
}

/** دولة واحدة لكل حالة تظهر في البطاقة، حتى تُراجع كل الحالات في مكان واحد. */
function pickSamples(cards: CountryCardData[]): CountryCardData[] {
  const normal = cards.filter((c) => !c.travelAdvisory && !c.needsVerification);
  const picks = [
    normal.find((c) => entryTone(c.entryType) === "free"),
    normal.find((c) => entryTone(c.entryType) === "eta"),
    normal.find((c) => entryTone(c.entryType) === "visa"),
    cards.find((c) => c.needsVerification),
    cards.find((c) => c.travelAdvisory),
  ];
  return picks.filter((c): c is CountryCardData => c !== undefined);
}

export default async function HomePage() {
  const tSite = await getTranslations("site");
  const t = await getTranslations("home");
  const samples = pickSamples(toCards());

  return (
    <main id="main" className="container">
      <section className={styles.hero}>
        <Logo size={96} label={tSite("name")} />
        <h1 className={styles.title}>{tSite("tagline")}</h1>
        <p className={styles.intro}>{t("intro")}</p>
        <p className={styles.muted}>{t("comingSoon")}</p>
      </section>

      <section className={styles.section} aria-labelledby="preview-title">
        <div>
          <h2 id="preview-title" className={styles.h2}>
            {t("previewTitle")}
          </h2>
          <p className={styles.muted}>{t("previewNote")}</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t("badgesTitle")}</h3>
          <div className={styles.badges}>
            {Object.values(EntryType).map((type) => (
              <EntryTypeBadge key={type} type={type} />
            ))}
            <NeedsVerificationBadge />
            <TravelAdvisoryBadge />
          </div>
        </div>

        <p className={styles.cardTitle}>{t("cardsTitle")}</p>
        <div className={styles.grid}>
          {samples.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      </section>
    </main>
  );
}
