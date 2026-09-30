import { getRequestConfig } from "next-intl/server";

// العربية هي اللغة الوحيدة حالياً. عند إضافة الإنجليزية يُحدَّد locale من المسار.
export const defaultLocale = "ar";

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Asia/Riyadh",
  };
});
