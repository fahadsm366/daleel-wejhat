import type messages from "../../messages/ar.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: "ar";
    Messages: typeof messages;
  }
}
