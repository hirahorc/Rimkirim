import { Loader2 } from "lucide-react";

/** held while the saved draft loads, so a returning customer never sees an
 *  empty form flash before their answers. The draft is nearly always in
 *  within a few frames, and a spinner shown for those is a flash of its own:
 *  it stays out of sight for the first 200ms (`flow-wait`), so a quick load
 *  shows the field alone */
export function FlowLoading() {
  return (
    // on the field already, so the page doesn't flash white before its cards
    <div data-field data-flow className="flex min-h-[60vh] items-center justify-center text-muted">
      <span className="flow-wait">
        <Loader2 aria-hidden className="size-5 animate-spin" />
      </span>
    </div>
  );
}
