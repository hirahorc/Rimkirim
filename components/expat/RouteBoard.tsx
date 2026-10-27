"use client";

import * as React from "react";
import { Plane } from "lucide-react";
import { Flag } from "@/components/shared/Flag";
import { useT } from "@/lib/i18n/LanguageProvider";

/** where expats ship from, as the board cycles them; all fly to Indonesia */
const ORIGINS = [
  { iso2: "GB", iso3: "GBR" },
  { iso2: "NL", iso3: "NLD" },
  { iso2: "DE", iso3: "DEU" },
  { iso2: "AU", iso3: "AUS" },
  { iso2: "US", iso3: "USA" },
  { iso2: "FR", iso3: "FRA" },
  { iso2: "JP", iso3: "JPN" },
  { iso2: "SG", iso3: "SGP" },
] as const;
const DEST = { iso2: "ID", iso3: "IDN" } as const;

/** how long each route stays on the board before the next origin flips in */
const HOLD_MS = 3600;
/** one tile after another, like a split-flap row settling */
const FLIP_STEP_MS = 50;
/** on load the whole board flips in after the eyebrow has risen */
const ENTRANCE_MS = 150;

const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};

/** one row of split-flap tiles; remounting it (a new key) flips it in */
function Tiles({ code, delayMs }: { code: string; delayMs: number }) {
  return (
    <span className="flex gap-0.5">
      {code.split("").map((ch, k) => (
        <span
          key={k}
          className="board-tile relative grid h-8 w-6 place-items-center rounded-2xs bg-foreground font-mono text-base font-medium leading-none text-background"
          style={{ animationDelay: `${delayMs + k * FLIP_STEP_MS}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * The expat hero's eyebrow, as an airport departures board: a route from
 * wherever the visitor is moving from to Indonesia, in split-flap tiles.
 * Every few seconds the origin flips to the next country, the route redraws
 * and a plane flies it, which says "from anywhere to Indonesia, by air"
 * without a word of copy. On load the whole board flips in, in the same
 * rotateX move as the headline's words below it.
 *
 * The page's one loop (DESIGN.md, Motion: "The departure board"): it runs
 * only while the board is on screen and the tab is visible, and not at all
 * under reduced motion, where the first route simply stands. The tiles are
 * decoration for sighted readers; assistive tech gets one plain sentence.
 */
export function RouteBoard({ className }: { className?: string }) {
  const t = useT();
  const ref = React.useRef<HTMLDivElement>(null);
  const [turn, setTurn] = React.useState(0);
  const [onScreen, setOnScreen] = React.useState(false);
  const reduce = React.useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => true);
  const pageVisible = React.useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false,
  );

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = onScreen && pageVisible && !reduce;
  React.useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setTurn((n) => n + 1), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [running, turn]);

  const origin = ORIGINS[turn % ORIGINS.length];
  const entrance = turn === 0;
  // on load: origin tiles, then destination tiles, then the flight;
  // afterwards only the origin flips, and the flight follows it
  const originDelay = entrance ? ENTRANCE_MS : 0;
  const destDelay = ENTRANCE_MS + 3 * FLIP_STEP_MS;
  const flightDelay = entrance ? destDelay + 3 * FLIP_STEP_MS + 120 : 3 * FLIP_STEP_MS + 120;

  return (
    <div ref={ref} className={className}>
      <p className="sr-only">{t("expat.hero.eyebrow")}</p>
      <div aria-hidden className="route-board flex items-center">
        {/* all origin flags are stacked and crossfade, so a swap never
            waits on a network fetch */}
        <span className="relative mr-2 inline-block h-[15px] w-5 shrink-0">
          {ORIGINS.map((o) => (
            <Flag
              key={o.iso2}
              code={o.iso2}
              size={15}
              className={`board-flag absolute inset-0 ${o.iso2 === origin.iso2 ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </span>
        <Tiles key={`o-${turn}`} code={origin.iso3} delayMs={originDelay} />

        {/* the route: a dashed line drawn from origin to destination with the
            plane at its tip, redrawn for every new origin */}
        <span className="board-track relative mx-2.5 inline-block h-4 shrink-0">
          <span
            key={`l-${turn}`}
            className="board-line absolute inset-x-0 top-1/2 border-t border-dashed border-muted-2"
            style={{ animationDelay: `${flightDelay}ms` }}
          />
          {/* three layers, three jobs: travel (x), lift (y), heading (the
              glyph points north-east, so it turns 45deg to fly east) */}
          <span key={`p-${turn}`} className="board-plane absolute left-0 top-0" style={{ animationDelay: `${flightDelay}ms` }}>
            <span className="board-lift block">
              <Plane className="size-4 rotate-45 fill-foreground text-foreground" strokeWidth={1.5} />
            </span>
          </span>
        </span>

        <Tiles key="dest" code={DEST.iso3} delayMs={destDelay} />
        <Flag code={DEST.iso2} size={15} className="ml-2" />
      </div>
    </div>
  );
}
