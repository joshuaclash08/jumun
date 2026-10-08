import "@/lib/polyfills";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { LiveRegionAnnouncer } from "@/components/a11y/LiveRegionAnnouncer";
import { SkipLink } from "@/components/a11y/SkipLink";
import { A11yToastContainer } from "@/components/flow/A11yToastContainer";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JUMUN",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#17171c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('jumun:accessibility-settings');if(raw){var p=JSON.parse(raw);if(p&&p.state&&p.state.theme==='dark'){document.documentElement.classList.add('dark');}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-background font-sans text-foreground antialiased selection:bg-primary/20 flex justify-center">
        <div className="w-full max-w-[840px] min-h-[100dvh] bg-background text-foreground relative flex flex-col">
          <Providers>
            <SkipLink targetId="main-content" />
            {children}
            <LiveRegionAnnouncer />
            <A11yToastContainer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
