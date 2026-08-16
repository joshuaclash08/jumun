import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import { Providers } from "./providers";
import { LiveRegionAnnouncer } from "@/components/a11y/LiveRegionAnnouncer";
import { SkipLink } from "@/components/a11y/SkipLink";
import "./globals.css";

// Self-hosted from public/fonts/ (the official Pretendard 1.3.9 release
// distribution, not the npm package) -- see docs/tech-stack.md. weight is
// required: omitting it renders the wrong weight specifically in
// WebKit/Safari, and iOS Safari is an explicit target browser for this
// product. Byte-identical to the npm package's copy (verified via md5),
// hosted directly so the font source isn't tied to a node_modules path.
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jumun — 바리어프리 셀프오더",
  description: "QR/NFC로 바로 열리는, 모두를 위한 접근성 기본값 셀프오더 플랫폼.",
  manifest: "/manifest.json",
};

// No maximumScale/userScalable here, unlike legacy -- disabling pinch-zoom is
// a direct accessibility regression for the low-vision users this product
// targets. See docs/architecture.md's "fixes versus legacy".
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${notoSansKR.variable} bg-background`} suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background font-sans text-foreground antialiased selection:bg-primary/20 flex justify-center">
        <div className="w-full max-w-[768px] min-h-[100dvh] bg-background text-foreground relative flex flex-col">
          <Providers>
            <SkipLink targetId="main-content">본문으로 바로가기</SkipLink>
            {children}
            <LiveRegionAnnouncer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
