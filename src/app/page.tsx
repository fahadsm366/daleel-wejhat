import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/Logo";
import styles from "./page.module.css";

// صفحة مؤقتة للمهمة 1: تتحقق من الهوية والخطوط والاتجاه.
// تُستبدل بالصفحة الرئيسية الفعلية في المهمة 5.

const SWATCHES = [
  "brand",
  "brand-deep",
  "accent",
  "accent-ink",
  "surface-100",
  "surface-200",
  "ink",
  "muted",
  "line",
  "entry-free",
  "entry-eta",
  "entry-visa",
] as const;

export default async function HomePage() {
  const tSite = await getTranslations("site");
  const t = await getTranslations("home");

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <Logo variant="mono" size={40} />
            <span className={styles.brandName}>{tSite("name")}</span>
          </div>
        </div>
      </header>

      <main id="main" className={styles.container}>
        <section className={styles.hero}>
          <Logo size={96} label={tSite("name")} />
          <h1 className={styles.title}>{tSite("tagline")}</h1>
          <p className={styles.intro}>{t("intro")}</p>
          <p className={styles.muted}>{t("comingSoon")}</p>
        </section>

        <section className={styles.section} aria-labelledby="preview-title">
          <h2 id="preview-title" className={styles.h2}>
            {t("previewTitle")}
          </h2>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t("fontsTitle")}</h3>
            <p className={styles.sampleDisplay}>{t("fontDisplay")}</p>
            <p>{t("fontSans")}</p>
            <p>
              {t.rich("fontMono", {
                date: "2026-09-29",
                data: (chunks) => (
                  <span dir="ltr" className={styles.sampleMono}>
                    {chunks}
                  </span>
                ),
              })}
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t("colorsTitle")}</h3>
            <ul className={styles.swatches}>
              {SWATCHES.map((name) => (
                <li key={name} className={styles.swatch}>
                  <span
                    className={styles.chip}
                    style={{ background: `var(--${name})` }}
                    aria-hidden="true"
                  />
                  <code className={styles.sampleMono}>{name}</code>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
