import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "냉난방기설치매입 | 에어컨 이전설치·철거 · 김대곤",
  description: "대전·세종·충청권 중심. 집·사무실·식당·카페 에어컨·냉난방기 이전설치, 철거, 무료수거, 중고 매입·구매 상담. 김대곤 대표 직접 상담 010-9183-2200.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><head><link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" /><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" /><script src="/analytics.js" defer /></head><body>{children}</body></html>;
}
