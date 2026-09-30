import styles from "./Logo.module.css";

type LogoProps = {
  /** color: الأخضر والذهبي. mono: بلون النص المحيط (currentColor). */
  variant?: "color" | "mono";
  size?: number;
  /** نص بديل. إن لم يُمرَّر يُعامل الشعار كزخرفة ويُخفى عن قارئ الشاشة. */
  label?: string;
  className?: string;
};

// الشعار مرسوم من design/logo/mark-*.svg، وألوانه من متغيرات tokens.css
// حتى يتبدّل تلقائياً في الوضع الداكن.
export function Logo({ variant = "color", size = 48, label, className }: LogoProps) {
  const cls = [styles.logo, variant === "mono" ? styles.mono : styles.color, className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={cls}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <circle className={styles.ring} cx="60" cy="60" r="50" fill="none" strokeWidth="8" />
      <circle
        className={styles.ring}
        cx="60"
        cy="60"
        r="38"
        fill="none"
        strokeWidth="2.5"
        strokeDasharray="4 5"
      />
      <path
        className={styles.path}
        d="M36 84 C 44 58, 60 70, 80 42"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle className={styles.origin} cx="36" cy="84" r="6" />
      <circle className={styles.pin} cx="82" cy="39" r="10" />
      <circle className={styles.pinCore} cx="82" cy="39" r="4" />
    </svg>
  );
}
