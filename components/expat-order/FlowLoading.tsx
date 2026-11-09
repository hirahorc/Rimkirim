import { Loader2 } from "lucide-react";

/** held while the saved draft loads, so a returning customer never sees an
 *  empty form flash before their answers */
export function FlowLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted">
      <Loader2 aria-hidden className="size-5 animate-spin" />
    </div>
  );
}
