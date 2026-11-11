"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { BREAK_SETS, breakBookingNumber, breakState, type BreakSet } from "./break-fixtures";

const DRAFT_KEY = "rimkirim:expat-order";
/** the developer's own draft, set aside while a dataset stands in for it */
const OWN_KEY = "rimkirim:expat-order:own";
/** which dataset the stored draft currently is */
const LOADED_KEY = "rimkirim:expat-order:break";

const LABEL: Record<BreakSet, string> = {
  demo: "Demo data",
  worst: "Worst case",
  empty: "Empty",
  one: "One",
  many: "40 packages",
};

const isSet = (v: string | null): v is BreakSet => !!v && (BREAK_SETS as readonly string[]).includes(v);

/**
 * The break-ui toggle for the expat order flow, in development only
 * (app/layout.tsx mounts it nowhere else): swaps the order every screen of
 * the flow renders between the kind data it was designed against and the
 * realistic worst (break-fixtures). The swap happens where real data enters,
 * the stored draft and its booking, so the screens are never touched; the
 * page then loads afresh, since each screen takes its first state from the
 * draft it mounts on. `?data=` keeps the choice across a reload, and "Off"
 * puts the developer's own draft back. Plain on purpose: harness chrome, not
 * part of the design under test.
 */
/** where this screen lives for a dataset: each has its own booking number */
const urlFor = (set: BreakSet | null) => {
  const url = new URL(window.location.href);
  if (set) url.searchParams.set("data", set);
  else url.searchParams.delete("data");
  if (url.pathname.startsWith("/expat-relocation/booking/")) {
    url.pathname = set ? `/expat-relocation/booking/${breakBookingNumber(set)}` : "/expat-relocation/rates";
  }
  return url.toString();
};

function load(set: BreakSet) {
  if (!window.sessionStorage.getItem(LOADED_KEY)) {
    const own = window.localStorage.getItem(DRAFT_KEY);
    if (own) window.localStorage.setItem(OWN_KEY, own);
  }
  // persisted as it's set, so the reload mounts every screen on it
  useExpatOrderStore.setState(breakState(set));
  window.sessionStorage.setItem(LOADED_KEY, set);
  window.location.assign(urlFor(set));
}

function off() {
  const own = window.localStorage.getItem(OWN_KEY);
  if (own) window.localStorage.setItem(DRAFT_KEY, own);
  else window.localStorage.removeItem(DRAFT_KEY);
  window.localStorage.removeItem(OWN_KEY);
  window.sessionStorage.removeItem(LOADED_KEY);
  window.location.assign(urlFor(null));
}

/** the dataset in force: the one the URL asks for, once the draft is it */
function readActive(): BreakSet | null {
  const asked = new URLSearchParams(window.location.search).get("data");
  return isSet(asked) && window.sessionStorage.getItem(LOADED_KEY) === asked ? asked : null;
}
const never = () => () => {};

export function BreakData() {
  const pathname = usePathname();
  const inFlow = pathname.startsWith("/expat-relocation/");
  // every switch is a page load, so this never changes under a mounted page
  const active = React.useSyncExternalStore(never, readActive, () => null);

  React.useEffect(() => {
    if (!inFlow) return;
    const asked = new URLSearchParams(window.location.search).get("data");
    // a link opened cold: the draft isn't this dataset yet
    if (isSet(asked) && window.sessionStorage.getItem(LOADED_KEY) !== asked) load(asked);
  }, [inFlow]);

  if (!inFlow) return null;

  const segment = (on: boolean): React.CSSProperties => ({
    border: 0,
    borderRadius: 6,
    padding: "5px 9px",
    font: "inherit",
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: on ? "#111" : "#555",
    background: on ? "#fff" : "transparent",
    boxShadow: on ? "0 1px 2px rgba(0,0,0,.18)" : "none",
  });

  return (
    <div
      role="group"
      aria-label="Break UI: order data"
      // over the plan's bar where there is one (below lg), clear of its button
      className={pathname === "/expat-relocation/plan" ? "bottom-4 max-lg:bottom-[148px]" : "bottom-4"}
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        display: "flex",
        gap: 2,
        maxWidth: "calc(100vw - 16px)",
        overflowX: "auto",
        padding: 3,
        borderRadius: 9,
        background: "#e4e4e4",
        boxShadow: "0 2px 10px rgba(0,0,0,.18)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 12,
        lineHeight: 1.2,
      }}
    >
      <button type="button" style={segment(active === null)} aria-pressed={active === null} onClick={() => active && off()}>
        Off
      </button>
      {BREAK_SETS.map((set) => (
        <button
          key={set}
          type="button"
          style={segment(active === set)}
          aria-pressed={active === set}
          onClick={() => active !== set && load(set)}
        >
          {LABEL[set]}
        </button>
      ))}
    </div>
  );
}
