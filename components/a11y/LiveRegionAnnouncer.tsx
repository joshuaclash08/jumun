// The DOM target for lib/services/A11yFeedbackService.ts's announce() function.
// Mount exactly once, near the root of the app shell.
export function LiveRegionAnnouncer() {
  return (
    <div id="jumun-live-region" role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
  );
}
