"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { DetailsScene, DoorScene, FlightScene, QuoteScene } from "./JourneyScenes";
import { alreadyThere } from "./useSectionReveal";

const SCENES = [DetailsScene, QuoteScene, FlightScene, DoorScene];

/** how long each step holds before the next, while the steps play: the
 *  scene builds in about two seconds, and the rest is reading time */
const DWELL_MS = 5200;
/** how long a scene leaving the stage takes to travel out (the .jr-slot transition) */
const LEAVE_MS = 650;
/** the beat between a step coming up (its tile flips and pulses) and the
 *  run setting off toward the next; the run takes the rest of the hold */
const RUN_DELAY_MS = 650;

/**
 * idle: not on screen yet · auto: playing 1 to 4 · paused: by the button ·
 * manual: a step was chosen, so the reader leads · done: played through
 */
type Mode = "idle" | "auto" | "paused" | "manual" | "done";

/** a scene in its frame: the frame is the size query, and the scene's em is
 *  a share of the frame's width, so the whole illustration scales as one */
function Frame({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div aria-hidden className={cn("@container relative overflow-hidden rounded-lg bg-(--tone-wash)", className)} style={style}>
      {children}
    </div>
  );
}

const order = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * The expat "How it works" as the trip it describes. When the section
 * scrolls into view it reveals itself, then the steps play from 1 to 4 on
 * their own: the active step's tile fills and flips like the hero's
 * departure board, a highlight glides down to it, the rail fills to it and
 * runs on toward the next step while it holds, and the stage cross-fades to
 * its scene, which builds itself piece by piece. One pass, then it rests
 * on the doorstep.
 *
 * A click (or Enter) on a step takes over: that step comes up and the
 * playing stops. A step chosen by hand is a question, so it is answered at
 * once: the stage turns to it on the hover scale's clock and its scene
 * stands built, where the tour's builds itself over two seconds and more;
 * chosen from the keyboard, nothing moves at all (PRODUCT.md). The round
 * control on the stage pauses, resumes and replays (playing on from a step
 * chosen by hand builds its scene, as the tour would have), and the
 * playing also holds while a mouse rests on the stage
 * (only the stage: the section fills the screen, so a pointer parked
 * anywhere on it would stop the playing for good), while the section is off
 * screen and while the tab is hidden. Under
 * reduced motion nothing plays or moves: the first step stands, built, and
 * a click switches instantly. DESIGN.md, Motion: "The journey".
 */
export function JourneySteps({
  steps,
  head,
  footer,
}: {
  steps: { title: string; body: string }[];
  head: React.ReactNode;
  footer: React.ReactNode;
}) {
  const t = useT();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLOListElement>(null);
  const [mode, setMode] = React.useState<Mode>("idle");
  const [active, setActive] = React.useState(-1);
  /** the scenes built right now: the shown one, and the one leaving */
  const [built, setBuilt] = React.useState<number[]>([]);
  /** restarts the hold timer when a step is replayed or resumed from manual */
  const [run, setRun] = React.useState(0);
  const [layout, setLayout] = React.useState<{
    tiles: number[];
    /** half a tile's height: the run toward the next step ends at its edge */
    half: number;
    rows: { top: number; height: number }[];
  } | null>(null);
  const leaveRef = React.useRef(0);
  const activeRef = React.useRef(-1);
  /** the step was reached by its run, not by a jump: the rail's fill takes
   *  the run's place at once instead of growing again over what the run
   *  just drew */
  const [snap, setSnap] = React.useState(false);
  /** the step was chosen from the keyboard: it comes up without motion */
  const [instant, setInstant] = React.useState(false);

  const go = React.useCallback((i: number) => {
    const prev = activeRef.current;
    activeRef.current = i;
    setActive(i);
    setBuilt(prev >= 0 && prev !== i ? [prev, i] : [i]);
    window.clearTimeout(leaveRef.current);
    leaveRef.current = window.setTimeout(() => setBuilt([i]), LEAVE_MS);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;
    // a reader already on the section as the page comes up finds it
    // standing; the steps still play once it is in view
    if (alreadyThere(root)) root.dataset.revealed = "instant";
    root.dataset.journeyReady = "";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let started = false;
    let startTimer = 0;
    const hold = { view: true, tab: document.hidden };
    const applyHold = () => {
      if (hold.view || hold.tab) root.dataset.hold = "";
      else delete root.dataset.hold;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        hold.view = !e.isIntersecting;
        applyHold();
        if (!started && e.intersectionRatio >= 0.3) {
          started = true;
          if (!("revealed" in root.dataset)) root.dataset.revealed = "";
          if (reduce) {
            go(0);
            setMode("manual");
          } else {
            // let the reveal land before the first step plays; a reader who
            // chose a step in that beat keeps it, and the tour stands down
            startTimer = window.setTimeout(() => {
              if (activeRef.current >= 0) return;
              go(0);
              setMode((m) => (m === "idle" ? "auto" : m));
            }, 650);
          }
        }
      },
      { threshold: [0, 0.3] },
    );
    io.observe(root);
    const onVisibility = () => {
      hold.tab = document.hidden;
      applyHold();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(() => {
      const top = list.getBoundingClientRect().top;
      const rows = (Array.from(list.children) as HTMLElement[]).filter((el) => el.tagName === "LI");
      const rects = rows.map((li) => li.querySelector<HTMLElement>("[data-tile]")!.getBoundingClientRect());
      setLayout({
        tiles: rects.map((r) => r.top + r.height / 2 - top),
        half: rects[0] ? rects[0].height / 2 : 0,
        rows: rows.map((li) => ({ top: li.offsetTop, height: li.offsetHeight })),
      });
    });
    ro.observe(list);
    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(startTimer);
      window.clearTimeout(leaveRef.current);
    };
  }, [go]);

  /** the hold ran out: on to the next step, or rest after the last */
  const next = () => {
    if (active < steps.length - 1) {
      setSnap(true);
      go(active + 1);
    } else setMode("done");
  };
  const choose = (i: number, fromKeyboard: boolean) => {
    setSnap(false);
    setInstant(fromKeyboard);
    go(i);
    setMode("manual");
  };
  const control = () => {
    setInstant(false);
    if (mode === "auto") setMode("paused");
    else if (mode === "paused") setMode("auto");
    else {
      setSnap(false);
      if (mode === "done" || active < 0) go(0);
      setRun((r) => r + 1);
      setMode("auto");
    }
  };

  const timing = mode === "auto" || mode === "paused";
  const last = steps.length - 1;
  const railTop = layout?.tiles[0] ?? 0;
  const railSpan = layout ? layout.tiles[last] - railTop : 0;
  const at = (i: number) => (layout && railSpan > 0 ? (layout.tiles[i] - railTop) / railSpan : 0);
  /** the run toward the next step, in px down the rail: from the active
   *  tile's lower edge to the next tile's upper edge, so the step moves on
   *  the moment the run touches it */
  const runFrom = layout && active >= 0 && active < last ? layout.tiles[active] - railTop + layout.half : 0;
  const runLength = layout && active >= 0 && active < last ? layout.tiles[active + 1] - layout.tiles[active] - 2 * layout.half : 0;
  const shown = Math.max(active, 0);
  const row = layout && active >= 0 ? layout.rows[active] : null;

  return (
    <div
      ref={rootRef}
      className="jr-root"
      data-timing={timing || undefined}
      data-paused={mode === "paused" || undefined}
      // a step chosen by hand: the stage answers at once (globals.css,
      // .jr-root[data-manual]), without any motion from the keyboard
      data-manual={mode === "manual" || undefined}
      data-instant={instant || undefined}
      style={{ "--dwell": `${DWELL_MS}ms`, "--run-delay": `${RUN_DELAY_MS}ms` } as React.CSSProperties}
    >
      <div className="jr-reveal" style={order(0)}>
        {head}
      </div>

      <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        {/* the stage: on top on a phone, beside the steps from lg */}
        <div className="jr-stage jr-reveal relative lg:col-start-2 lg:row-start-1" style={order(1)}>
          {/* portrait on a phone, where the scenes take their compact layout */}
          <Frame className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[5/4]">
            {/* the ground travels with the steps: daylight at 01, dusk by 04 */}
            <div className="jr-sky absolute inset-0" />
            <div className="jr-dusk absolute inset-0" style={{ opacity: shown / last }} />
            <div className="jr-grain absolute inset-0" />
            <div className="relative grid size-full">
              {SCENES.map((Illustration, i) => (
                <div
                  key={i}
                  className="jr-slot relative [grid-area:1/1]"
                  data-place={i === shown ? "shown" : i < shown ? "after" : "before"}
                >
                  {/* the scene's em is a share of the stage's width, so it
                      scales as one picture; a compact stage gets a bigger
                      share and a compact layout, so its type stays legible */}
                  <div
                    className="jr-scene absolute inset-0 text-[length:2.85cqw] @max-[30rem]:text-[length:3.9cqw]"
                    data-built={built.includes(i) || undefined}
                  >
                    <Illustration />
                  </div>
                </div>
              ))}
            </div>
          </Frame>
          {/* below lg the steps sit under the stage, out of sight while the
              scene plays, so the stage carries the progress itself: one
              segment per step, level with the control, the past ones full,
              the active one filling over its hold (paused with it), as a
              story's bars do */}
          {mode !== "idle" && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-3 right-[3.75rem] top-[1.75rem] flex gap-1 sm:left-4 sm:right-[4.5rem] sm:top-[2.125rem] lg:hidden"
            >
              {steps.map((s, i) => (
                <span key={s.title} className="relative h-1 flex-1 overflow-hidden rounded-full bg-background/75">
                  {(i < active || (i === active && !timing) || mode === "done") && (
                    <span className="absolute inset-0 rounded-full bg-tone-ink" />
                  )}
                  {i === active && timing && (
                    <span key={`${run}-${active}`} className="jr-seg-run absolute inset-0 rounded-full bg-tone-ink" />
                  )}
                </span>
              ))}
            </div>
          )}
          {/* pause, play, replay; its ring is the active step's hold running out */}
          {mode !== "idle" && (
            <button
              type="button"
              onClick={control}
              aria-label={t(mode === "auto" ? "expat.steps.pause" : mode === "done" ? "expat.steps.replay" : "expat.steps.play")}
              className="jr-control tap-target absolute right-3 top-3 grid size-9 place-items-center rounded-full sm:size-10 bg-background text-foreground transition-colors hover:text-tone-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 sm:right-4 sm:top-4"
            >
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="20" cy="20" r="18.5" fill="none" stroke="var(--border)" strokeWidth="2" />
                {timing && (
                  <circle
                    key={`${run}-${active}`}
                    className="jr-timer"
                    cx="20"
                    cy="20"
                    r="18.5"
                    fill="none"
                    stroke="var(--tone-ink)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    pathLength={100}
                    onAnimationEnd={next}
                  />
                )}
              </svg>
              {mode === "auto" ? (
                <Pause className="size-3.5 fill-current" />
              ) : mode === "done" ? (
                <RotateCcw className="size-4" />
              ) : (
                <Play className="ml-0.5 size-3.5 fill-current" />
              )}
            </button>
          )}
        </div>

        <ol ref={listRef} className="relative -mx-2 sm:-mx-3 lg:col-start-1 lg:row-start-1">
          {/* the highlight, gliding to the active step; on a phone it reaches
              8px past the text, not 12, so it keeps clear of the screen edge */}
          {row && (
            <span
              aria-hidden
              className="jr-glide pointer-events-none absolute inset-x-0 top-0 rounded-md bg-surface-2"
              style={{ transform: `translateY(${row.top}px)`, height: row.height }}
            />
          )}
          {/* the rail: 2px, filled to the active step, and while the step
              holds a run grows from its tile toward the next with a head at
              its tip, reaching the next tile's edge as the hold runs out, so
              the step moves on the moment the run touches it. The run sets
              off a beat after the step comes up (--run-delay), once its tile
              has flipped and pulsed, its head fading in at the tile's foot */}
          {layout && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-[calc(1.375rem-1px)] w-[2px] rounded-full bg-border-strong sm:left-[calc(1.625rem-1px)]"
              style={{ top: railTop, height: railSpan }}
            >
              <span
                className="jr-rail-fill absolute inset-0 origin-top rounded-full bg-tone-ink"
                data-snap={snap || undefined}
                style={{ transform: `scaleY(${active >= 0 ? at(active) : 0})` }}
              />
              {timing && runLength > 0 && (
                <span key={`${run}-${active}`} className="absolute inset-x-0" style={{ top: runFrom, height: runLength }}>
                  <span className="jr-rail-run absolute inset-0 origin-top rounded-full bg-tone-ink" />
                  {/* the head: a box as long as the run, its dot at the
                      bottom, carried from the run's start to its end */}
                  <span className="jr-rail-head absolute inset-0">
                    <span className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-tone-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--tone-ink)_18%,transparent)]" />
                  </span>
                </span>
              )}
            </span>
          )}
          {steps.map((s, i) => {
            const isActive = i === active;
            return (
              <li
                key={s.title}
                className="jr-reveal group/step relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 p-2 sm:p-3"
                style={order(2 + i)}
              >
                {/* the whole row is the button, laid over it, so the title
                    stays a heading */}
                <button
                  type="button"
                  // a keyboard press has no pointer behind it (detail 0)
                  onClick={(e) => choose(i, e.detail === 0)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={s.title}
                  className="absolute inset-0 z-20 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 pointer-fine:cursor-pointer"
                />
                {/* remounted when its step turns active, so it flips in on
                      the departure board's move (without the board's seam,
                      which reads as a strike-through at this size) */}
                  <span
                    key={isActive ? "on" : "off"}
                    data-tile
                    aria-hidden
                    className={cn(
                      "relative z-10 grid h-8 w-7 place-items-center rounded-2xs font-mono text-sm font-medium tabular-nums transition-colors duration-300",
                      isActive
                        ? "jr-tile bg-tone-ink text-background"
                        : i < active
                          ? "bg-background text-tone-ink shadow-[inset_0_0_0_1px_var(--tone-ink)]"
                          : "bg-background text-muted-2 shadow-[inset_0_0_0_1px_var(--border-strong)]",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                    {/* reached: a ring of the chapter's ink swells out of
                        the tile and fades, the arrival the run led to */}
                    {isActive && <span className="jr-pulse" />}
                  </span>
                <div className="relative z-10 min-w-0">
                  <h3
                    className={cn(
                      "font-display text-lg font-semibold leading-8 tracking-tight transition-colors duration-200",
                      isActive ? "text-tone-ink" : "pointer-fine:group-hover/step:text-tone-ink",
                    )}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="jr-reveal mt-10" style={order(6)}>
        {footer}
      </div>
    </div>
  );
}
