import styles from "./Logo.module.css";

type LogoProps = {
  /** color: المسار واللون الكحلي. mono: بلون النص المحيط (currentColor). نقطة الانطلاق ذهبية في الحالتين. */
  variant?: "color" | "mono";
  size?: number;
  /** نص بديل. إن لم يُمرَّر يُعامل الشعار كزخرفة ويُخفى عن قارئ الشاشة. */
  label?: string;
  className?: string;
};

// الشعار مرسوم من design/logo/mark-color.svg، وألوانه من متغيرات tokens.css
// حتى يتبدّل تلقائياً في الوضع الداكن. ثقب الدبوس مقطوع (evenodd) فتظهر الخلفية من خلاله
// على أي سطح، بدل دائرة بلون ثابت.
export function Logo({ variant = "color", size = 48, label, className }: LogoProps) {
  const cls = [styles.logo, variant === "mono" ? styles.mono : styles.color, className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={cls}
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path
        className={styles.path}
        d="M5 31 Q14 8 29.5 20.5"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className={styles.pin}
        fillRule="evenodd"
        d="M31 23 C27.2 18.6 25 15.6 25 12.6 A6 6 0 1 1 37 12.6 C37 15.6 34.8 18.6 31 23 Z M28.7 12.6 A2.3 2.3 0 1 0 33.3 12.6 A2.3 2.3 0 1 0 28.7 12.6 Z"
      />
      <circle className={styles.origin} cx="5" cy="31" r="3.4" />
    </svg>
  );
}
