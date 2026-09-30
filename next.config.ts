import path from "node:path";
import type { NextConfig } from "next";

// نربط next-intl بملف الإعداد يدوياً بدل next-intl/plugin، لأن الإضافة تحمّل
// @swc/core عند بدء التشغيل وهو يتعطل على بعض أجهزة Windows بسبب صلاحيات مجلد الكاش.
// هذا ما تفعله الإضافة نفسها لـ next-intl/config، دون ميزات الاستخراج التجريبية.
const I18N_REQUEST_CONFIG = "./src/i18n/request.ts";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    resolveAlias: {
      "next-intl/config": I18N_REQUEST_CONFIG,
    },
  },
  webpack(config: { resolve: { alias: Record<string, string> } }) {
    config.resolve.alias["next-intl/config"] = path.resolve(I18N_REQUEST_CONFIG);
    return config;
  },
};

export default nextConfig;
