import Link from "next/link";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import styles from "./SiteHeader.module.css";

// روابط التنقل تُضاف مع صفحاتها (الدول، قبل السفر) في المهام التالية.
export function SiteHeader() {
  const t = useTranslations("site");

  return (
    <header className={styles.header}>
      <div className="container">
        <Link href="/" className={styles.home}>
          <Logo size={40} />
          <span className={styles.names}>
            <span className={styles.name}>{t("name")}</span>
            <span className={styles.nameEn} lang="en" dir="ltr">
              {t("nameEn")}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
