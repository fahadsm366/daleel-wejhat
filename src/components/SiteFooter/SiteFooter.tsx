import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import styles from "./SiteFooter.module.css";

// إخلاء المسؤولية هنا يظهر في كل صفحة، ويُضاف إليه إخلاء خاص في صفحة الدولة (المهمة 6).
export function SiteFooter() {
  const tSite = useTranslations("site");
  const t = useTranslations("footer");

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo variant="mono" size={32} />
          <span className={styles.names}>
            <span className={styles.name}>{tSite("name")}</span>
            <span className={styles.nameEn} lang="en" dir="ltr">
              {tSite("nameEn")}
            </span>
          </span>
        </div>
        <p className={styles.disclaimer}>
          <span className={styles.disclaimerTitle}>{t("disclaimerTitle")} </span>
          {t("disclaimer")}
        </p>
        <p className={`${styles.disclaimer} ${styles.small}`}>{t("intermediary")}</p>
        <p className={styles.small}>{t("copyright", { name: tSite("name") })}</p>
      </div>
    </footer>
  );
}
