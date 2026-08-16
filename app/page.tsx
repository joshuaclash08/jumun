import { LandingClientView } from "@/components/flow/LandingClientView";

// Root entry point for direct visitors / QA testers.
// Provides interactive NFC & QR code visual, live QR camera scanner modal,
// feature guide, and 1-tap entry to sample cafe store.
export default function Home() {
  return <LandingClientView />;
}
