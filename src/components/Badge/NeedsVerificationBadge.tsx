import { useTranslations } from "next-intl";

import styles from "./Badge.module.css";

/** تظهر بجانب أي معلومة needsVerification = true. */
export function NeedsVerificationBadge() {
  const t = useTranslations("badge");

  return (
    <span className={`${styles.badge} ${styles.verify}`}>
      <span className={styles.dot} aria-hidden="true" />
      {t("needsVerification")}
    </span>
  );
}
