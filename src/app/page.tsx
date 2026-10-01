import { getTranslations } from "next-intl/server";

import { CountryCard } from "@/components/CountryCard";
import { CountryExplorer } from "@/components/CountryExplorer";
import { getCountryList } from "@/lib/countries";
import { featuredCountries } from "@/lib/country-search";
import styles from "./page.module.css";

// تُولَّد الصفحة ثابتة وتُعاد كل ساعة، فيظهر أي تعديل في بيانات الدول دون إعادة بناء،
// ويتغير عرض الإعفاء المؤقت خلال ساعة من بداية يوم انتهائه بتوقيت الرياض.
export const revalidate = 3600;

export default async function HomePage() {
  const tSite = await getTranslations("site");
  const t = await getTranslations("home");
  const countries = await getCountryList();
  const featured = featuredCountries(countries);

  return (
    <main id="main" className="container">
      <section className={styles.hero}>
        <h1 className={styles.title}>{tSite("tagline")}</h1>
        <p className={styles.intro}>{t("intro")}</p>
      </section>

      {featured.length > 0 && (
        <section className={styles.section} aria-labelledby="featured-title">
          <h2 id="featured-title" className={styles.h2}>
            {t("featuredTitle")}
          </h2>
          <div className={styles.grid}>
            {featured.map((country) => (
              <CountryCard key={country.slug} country={country} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="countries-title">
        <h2 id="countries-title" className={styles.h2}>
          {t("countriesTitle")}
        </h2>
        <CountryExplorer countries={countries} />
      </section>
    </main>
  );
}
