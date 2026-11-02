"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * An iPhone 18 Pro drawn from its real geometry, ported from the stageshow
 * kit's Phone (its `pro` frame only): the screen 402 × 874 points as Apple's
 * iOS 27 UI kit lays it out, the status bar 62 tall, the Dynamic Island
 * 95 × 37 sitting 14 from the top, the home indicator 144 × 5 sitting 8 from
 * the bottom, and the screen's corner a superellipse 71pt across (exponent
 * 2.31) traced from Apple's own bezel. The frame is a brushed titanium band
 * around black glass, drawn as strokes of the screen's own outline so every
 * band stays parallel to it, corners included.
 *
 * The screen is laid out at true points and scaled as a whole, so type inside
 * it renders at the size iOS uses (17pt, not 8px): inside the screen 1px is
 * 1pt. The status bar and the home indicator are the phone's, never drawn by
 * the app inside it (globals.css, .iphone).
 */

const SCREEN = { w: 402, h: 874, r: 64 };
const CORNER = { a: 71, n: 2.31 };
/** the band and the glass around the screen, in points */
const BAND = 3;
const GLASS = 10;
/** the band's strokes, widest first: [reach from the screen's edge, paint] */
const BANDS: [number, string][] = [
  [13, "band"],
  [10, "#2c2c2d"],
  [9.25, "#0b0b0c"],
];
const BAND_STOPS = ["#e3e3e6", "#9a9ba0", "#cfd0d4", "#85868b", "#c9cacd"];

/** a rounded rectangle with continuous (superellipse) corners, `a` across
 *  with exponent `n`, as an SVG path */
function superellipsePath(w: number, h: number, a: number, n: number) {
  const steps = 32;
  const e = 2 / n;
  const pts: string[] = [];
  const corners: [number, number, number, number][] = [
    [w - a, a, 1, -1],
    [w - a, h - a, 1, 1],
    [a, h - a, -1, 1],
    [a, a, -1, -1],
  ];
  corners.forEach(([cx, cy, sx, sy], c) => {
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (Math.PI / 2);
      const u = c % 2 === 0 ? Math.sin(t) : Math.cos(t);
      const v = c % 2 === 0 ? Math.cos(t) : Math.sin(t);
      pts.push(`${(cx + sx * a * Math.pow(u, e)).toFixed(2)} ${(cy + sy * a * Math.pow(v, e)).toFixed(2)}`);
    }
  });
  return `M${pts.join("L")}Z`;
}

export function IPhone({
  width,
  time = "9:41",
  screen = "#fff",
  className,
  children,
}: {
  /** outer width in px; the height follows the real proportions */
  width: number;
  time?: string;
  /** the screen's background, behind the status bar and the app */
  screen?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const edge = BAND + GLASS;
  const s = width / (SCREEN.w + edge * 2);
  const pt = (n: number) => n * s;
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const outline = superellipsePath(pt(SCREEN.w), pt(SCREEN.h), pt(CORNER.a), CORNER.n);
  return (
    <div
      className={cn("iphone", className)}
      style={
        {
          width,
          height: pt(SCREEN.h + edge * 2),
          padding: pt(BAND),
          borderRadius: pt(SCREEN.r + edge),
          "--ps": `${s}px`,
        } as React.CSSProperties
      }
    >
      <svg className="iphone__bands" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={`${id}-band`} x1="0.2" y1="0" x2="0.8" y2="1">
            {BAND_STOPS.map((c, i) => (
              <stop key={c} offset={[0, 0.22, 0.48, 0.74, 1][i]} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <g transform={`translate(${pt(edge)} ${pt(edge)})`} strokeLinejoin="round">
          {BANDS.map(([d, paint]) => (
            <path
              key={d}
              d={outline}
              fill="none"
              strokeWidth={pt(d * 2)}
              stroke={paint === "band" ? `url(#${id}-band)` : paint}
            />
          ))}
        </g>
      </svg>
      <div className="relative h-full" style={{ padding: pt(GLASS), borderRadius: pt(SCREEN.r + GLASS) }}>
        <div
          className="iphone__window"
          style={{ width: pt(SCREEN.w), height: pt(SCREEN.h), clipPath: `path('${outline}')` }}
        >
          <div
            className="iphone__screen"
            style={{ width: SCREEN.w, height: SCREEN.h, transform: `scale(${s})`, background: screen }}
          >
            <div className="iphone__status">
              <span className="iphone__time">{time}</span>
              <span className="iphone__glyphs">
                <Signal />
                <Wifi />
                <Battery />
              </span>
            </div>
            <span className="iphone__island" />
            <div className="iphone__content">{children}</div>
            <span className="iphone__home" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal() {
  // four bars 3.33 wide on a 5.67 pitch, fully rounded, 6.33 to 13.67 tall
  return (
    <svg viewBox="0 0 20.33 13.67" width="20.33" height="13.67" className="mt-px block">
      {[6.33, 8.67, 11, 13.67].map((h, i) => (
        <rect key={h} x={i * 5.667} y={13.67 - h} width={3.333} height={h} rx={1.667} fill="currentColor" />
      ))}
    </svg>
  );
}

function Wifi() {
  return (
    <svg viewBox="0 0 19.33 14.33" width="19.33" height="14.33" className="block">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M0.415933 5.54283C0.902185 6.04412 1.66017 5.95818 2.27513 5.41393C4.30595 3.58064 6.83731 2.63535 9.66901 2.63535C12.5007 2.63535 15.0464 3.60928 17.0629 5.41393C17.6636 5.97251 18.4215 6.0298 18.9221 5.54283C19.4226 5.02722 19.4942 4.2538 18.9793 3.70954C16.8341 1.51819 13.3302 0 9.66901 0C6.00783 0 2.48965 1.53251 0.358727 3.72387C-0.156127 4.2538 -0.0989213 5.02722 0.415933 5.55715L0.415933 5.54283ZM3.94841 9.13779C4.50617 9.68205 5.22124 9.62476 5.85051 9.10915C6.88022 8.29276 8.25316 7.73418 9.66901 7.7485C11.0706 7.7485 12.4435 8.29276 13.4875 9.12347C14.1168 9.63908 14.8605 9.66773 15.4039 9.12347C15.9331 8.57921 16.0189 7.7485 15.4611 7.23289C14.0739 5.98683 11.9859 5.11315 9.68332 5.11315C7.38077 5.11315 5.27845 5.98683 3.9055 7.23289C3.41925 7.69121 3.31914 8.47896 3.96271 9.13779L3.94841 9.13779ZM8.72511 13.8929C9.34008 14.4801 9.98365 14.4801 10.5986 13.8929L11.757 12.7757C12.372 12.1742 12.5007 11.4151 11.7999 10.8995C11.2136 10.4841 10.4699 10.212 9.66901 10.212C8.86813 10.212 8.11015 10.4841 7.53809 10.9138C6.83731 11.4151 6.98033 12.1885 7.59529 12.7757L8.73942 13.8929L8.72511 13.8929Z"
      />
    </svg>
  );
}

function Battery() {
  // iOS 27 draws a full battery as one solid body, with a small contact
  return (
    <svg viewBox="0 0 29.33 13.67" width="29.33" height="13.67" className="mt-[0.33px] block">
      <path
        fill="currentColor"
        d="M0 6.4C0 4.15979 0 3.03969 0.435974 2.18404C0.819467 1.43139 1.43139 0.819467 2.18404 0.435974C3.03969 0 4.15979 0 6.4 0L19.933 0C22.1732 0 23.2933 0 24.149 0.435974C24.9016 0.819467 25.5135 1.43139 25.897 2.18404C26.333 3.03969 26.333 4.15979 26.333 6.4L26.333 7.26666C26.333 9.50687 26.333 10.627 25.897 11.4826C25.5135 12.2353 24.9016 12.8472 24.149 13.2307C23.2933 13.6667 22.1732 13.6667 19.933 13.6667L6.4 13.6667C4.15979 13.6667 3.03969 13.6667 2.18404 13.2307C1.43139 12.8472 0.819467 12.2353 0.435974 11.4826C0 10.627 0 9.50687 0 7.26666L0 6.4Z"
      />
      <path fillRule="evenodd" fill="currentColor" transform="translate(27.33 4.33)" d="M0 0L0 5C0.601505 4.8625 2 3.75 2 2.5C2 1.25 0.601505 0.1375 0 0Z" />
    </svg>
  );
}
