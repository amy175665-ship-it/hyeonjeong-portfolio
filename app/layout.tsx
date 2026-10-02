import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import SiteNav from "@/components/layout/SiteNav";
import CustomCursor from "@/components/ui/CustomCursor";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "백현정 | 포트폴리오",
  description: "6개월 부트캠프를 수료하고 웹 퍼블리셔로 첫 시작을 준비하고 있습니다. HTML·CSS·JavaScript로 화면을 만들고, React와 Next.js를 활용한 컴포넌트 구성과 접근성 있는 반응형 구현을 학습하고 있습니다.",
  openGraph: {
    title: "백현정 | 포트폴리오",
    description: "6개월 부트캠프를 수료하고 웹 퍼블리셔로 첫 시작을 준비하고 있습니다.",
    type: "website",
  },
};

const editorial = localFont({
  src: [
    { path: "../public/fonts/DMSerifDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/DMSerifDisplay-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-editorial",
  display: "swap",
});

// Korean serif (본명조) for short editorial phrases; pairs with DM Serif Display (Latin glyphs come from it first).
// Google serves Hangul in unicode-range chunks, so only the characters on screen are downloaded.
const hangulSerif = Noto_Serif_KR({
  weight: "600",
  variable: "--font-hangul-serif",
  display: "swap",
  preload: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} ${editorial.variable} ${hangulSerif.variable} font-sans font-normal`}>
        <SmoothScroll>
          <SiteNav />
          {children}
        </SmoothScroll>
        <CustomCursor />
      </body>
    </html>
  );
}
