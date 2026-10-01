import { Alexandria, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

// الخطوط مستضافة ذاتياً عبر next/font، وتُربط بمتغيرات design/tokens.css نفسها.
// تُطبَّق الأصناف على <body> حتى تتقدّم على قيم :root الاحتياطية في tokens.css.

export const fontDisplay = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-display",
  fallback: ["Tahoma", "sans-serif"],
});

export const fontSans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
  fallback: ["Tahoma", "Segoe UI", "sans-serif"],
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "monospace"],
});

export const fontVariables = [fontDisplay.variable, fontSans.variable, fontMono.variable].join(" ");
