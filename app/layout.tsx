import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "에어컨 설치·수리·중고 | 빠른 견적 문의",
  description: "대전·세종·충청권 중심 에어컨 설치, 이전설치, 수리, 철거, 중고 매입·판매 상담",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
