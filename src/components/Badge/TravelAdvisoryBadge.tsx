import { useTranslations } from "next-intl";

import styles from "./Badge.module.css";

/** تحذير السفر الرسمي (travelAdvisory). انظر docs/spec.md القسم 4.1. */
export function TravelAdvisoryBadge() {
  const t = useTranslations("badge");

  return (
    <span className={`${styles.badge} ${styles.advisory}`}>
      <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8" cy="11.6" r="0.9" fill="currentColor" />
      </svg>
      {t("travelAdvisory")}
    </span>
  );
}
