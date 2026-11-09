"use client";

import * as React from "react";
import { MapPin, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Place } from "@/lib/data/expat-places";
import type { Pin } from "@/lib/order/expat-order";
import { useT } from "@/lib/i18n/LanguageProvider";

/** degrees per screen pixel at zoom 1 (dummy: about a street a block) */
const DEG_PER_PX = 0.00002;
const ZOOMS = [1, 1.5, 2.25] as const;
const STEP = 24; // px an arrow key moves the map

/**
 * Where exactly the courier should knock: a dummy map, drawn rather than
 * fetched (no tiles, no key), that moves under a pin fixed at its centre, as
 * ride-hailing apps do. Drag it, tap a spot to bring it under the pin, or use
 * the arrow keys; the pin's dummy coordinates come back on confirm. A centred
 * modal at every size (sheet={false}): a bottom sheet would read the map's
 * drag as a swipe to close. Production swaps in the real map.
 */
export function MapPinDialog({
  open,
  onOpenChange,
  title,
  place,
  value,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** names the side, e.g. "Origin detail address" */
  title: string;
  place: Place;
  value?: Pin;
  onConfirm: (pin: Pin) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* the picker mounts each time it opens, on the saved pin */}
      <DialogContent sheet={false} className="max-w-xl">
        <PinPicker
          title={title}
          place={place}
          value={value}
          onCancel={() => onOpenChange(false)}
          onConfirm={(pin) => {
            onConfirm(pin);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function PinPicker({
  title,
  place,
  value,
  onCancel,
  onConfirm,
}: {
  title: string;
  place: Place;
  value?: Pin;
  onCancel: () => void;
  onConfirm: (pin: Pin) => void;
}) {
  const t = useT();
  const m = (k: string) => t(`expatOrder.map.${k}`);
  const [zoom, setZoom] = React.useState(0);
  // it opens on the saved pin, or on the Address itself
  const [offset, setOffset] = React.useState(() =>
    value ? { x: -(value.lng - place.lng) / DEG_PER_PX, y: (value.lat - place.lat) / DEG_PER_PX } : { x: 0, y: 0 },
  );
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const viewRef = React.useRef<HTMLDivElement>(null);

  const scale = ZOOMS[zoom];
  const pin: Pin = {
    lat: +(place.lat + offset.y * DEG_PER_PX).toFixed(6),
    lng: +(place.lng - offset.x * DEG_PER_PX).toFixed(6),
  };

  return (
    <>
        <DialogHeader>
          <DialogTitle>{m("title")}</DialogTitle>
          <DialogDescription>
            {title} · {place.label}, {place.detail}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted">{m("lead")}</p>
          <div
            ref={viewRef}
            role="application"
            aria-roledescription="map"
            aria-label={`${m("title")}. ${m("lead")}`}
            tabIndex={0}
            onKeyDown={(e) => {
              const d: Record<string, [number, number]> = {
                ArrowLeft: [STEP, 0],
                ArrowRight: [-STEP, 0],
                ArrowUp: [0, STEP],
                ArrowDown: [0, -STEP],
              };
              const v = d[e.key];
              if (!v) return;
              e.preventDefault();
              setOffset((o) => ({ x: o.x + v[0], y: o.y + v[1] }));
            }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, moved: false };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
              setOffset({ x: d.ox + dx / scale, y: d.oy + dy / scale });
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              const box = viewRef.current?.getBoundingClientRect();
              // a tap, not a drag: bring the tapped spot under the pin
              if (d && !d.moved && box) {
                const cx = box.left + box.width / 2;
                const cy = box.top + box.height / 2;
                setOffset((o) => ({ x: o.x + (cx - e.clientX) / scale, y: o.y + (cy - e.clientY) / scale }));
              }
            }}
            className="relative mt-4 h-72 cursor-grab touch-none select-none overflow-hidden rounded-md border border-border bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 active:cursor-grabbing sm:h-80"
          >
            <DummyMap label={place.label} offset={offset} scale={scale} />
            {/* the pin stays put; its tip marks the spot */}
            <MapPin
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-full fill-background text-foreground drop-shadow-md"
              strokeWidth={2.25}
            />
            <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
            <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-sm border border-border-strong bg-background shadow-float">
              <button
                type="button"
                aria-label={m("zoomIn")}
                disabled={zoom === ZOOMS.length - 1}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setZoom((z) => Math.min(z + 1, ZOOMS.length - 1))}
                className="grid size-9 place-items-center text-foreground hover:bg-surface-2 disabled:text-muted-2"
              >
                <Plus className="size-4" />
              </button>
              <span aria-hidden className="h-px bg-border" />
              <button
                type="button"
                aria-label={m("zoomOut")}
                disabled={zoom === 0}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setZoom((z) => Math.max(z - 1, 0))}
                className="grid size-9 place-items-center text-foreground hover:bg-surface-2 disabled:text-muted-2"
              >
                <Minus className="size-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted-2">
            {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {m("cancel")}
          </Button>
          <Button type="button" onClick={() => onConfirm(pin)}>
            {m("confirm")}
          </Button>
        </DialogFooter>
    </>
  );
}

/**
 * A neighbourhood drawn once: blocks on a street grid, two main roads (the
 * one through the centre carries the Address's name), a park and a canal, in
 * the app's own panel greys so it reads as a map without pretending to
 * be one from a provider. 1600px square, centred on the viewport and moved
 * by the pan offset.
 */
function DummyMap({ label, offset, scale }: { label: string; offset: { x: number; y: number }; scale: number }) {
  const blocks: React.ReactNode[] = [];
  for (let gx = 0; gx < 16; gx++) {
    for (let gy = 0; gy < 16; gy++) {
      const x = gx * 100 + 9;
      const y = gy * 100 + 9;
      // the park and the canal take their own cells, near enough to the
      // centre to show in the first view
      if (gx >= 9 && gx <= 10 && gy >= 6 && gy <= 7) continue;
      if (gy === 9) continue;
      blocks.push(<rect key={`${gx}-${gy}`} x={x} y={y} width={82} height={82} rx={6} className="fill-surface-3" />);
    }
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 1600"
      width={1600}
      height={1600}
      className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
      style={{
        transform: `translate(-50%, -50%) scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
        transformOrigin: "center",
      }}
    >
      <rect width="1600" height="1600" className="fill-surface-2" />
      {blocks}
      {/* the park */}
      <rect x="909" y="609" width="182" height="182" rx="10" style={{ fill: "color-mix(in oklab, var(--success) 22%, var(--background))" }} />
      {/* the canal */}
      <rect x="0" y="918" width="1600" height="64" style={{ fill: "color-mix(in oklab, var(--info) 22%, var(--background))" }} />
      {/* main roads */}
      <rect x="0" y="796" width="1600" height="18" className="fill-background" />
      <rect x="696" y="0" width="18" height="1600" className="fill-background" />
      {/* the street's name clear of the pin, which stands on the centre */}
      <text x="836" y="790" className="fill-muted" style={{ font: "500 13px var(--font-sans, sans-serif)" }}>
        {label}
      </text>
    </svg>
  );
}
