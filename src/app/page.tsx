import { getTranslations } from "next-intl/server";

import { CountryExplorer } from "@/components/CountryExplorer";
import { getCountryList } from "@/lib/countries";
import styles from "./page.module.css";

// تُولَّد الصفحة ثابتة وتُعاد كل ساعة، فيظهر أي تعديل في بيانات الدول دون إعادة بناء.
export const revalidate = 3600;

export default async function HomePage() {
  const tSite = await getTranslations("site");
  const t = await getTranslations("home");
  const countries = await getCountryList();

  return (
    <main id="main" className="container">
      <section className={styles.hero}>
        <h1 className={styles.title}>{tSite("tagline")}</h1>
        <p className={styles.intro}>{t("intro")}</p>
      </section>

      <section className={styles.section} aria-labelledby="countries-title">
        <h2 id="countries-title" className={styles.h2}>
          {t("countriesTitle")}
        </h2>
        <CountryExplorer countries={countries} />
      </section>
    </main>
  );
}
