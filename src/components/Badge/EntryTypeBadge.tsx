import { useTranslations } from "next-intl";

import type { EntryType } from "@/generated/prisma/enums";
import { entryTone } from "@/lib/entry-tone";
import styles from "./Badge.module.css";

/** نوع الدخول: لون الحالة مع كلمتها دائماً. */
export function EntryTypeBadge({ type }: { type: EntryType }) {
  const t = useTranslations("entryType");

  return (
    <span className={`${styles.badge} ${styles[entryTone(type)]}`} data-entry-type={type}>
      <span className={styles.dot} aria-hidden="true" />
      {t(type)}
    </span>
  );
}
