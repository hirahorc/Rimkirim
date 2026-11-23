"use client";

import * as React from "react";
import Link from "next/link";
import { BOARDS, boardScenes, findBoard, findScene, sceneSeed } from "@/lib/canvas/registry";
import { DEVICES, isGap, type Device, type Gap, type Lane, type Scene, type SceneKind } from "@/lib/canvas/types";
import type { SceneMessage } from "./SceneRunner";
import "./canvas.css";

/**
 * One board of the canvas: a page of the prototype with every state its
 * stories ask for, as frames on a surface that pans and zooms the way a
 * design tool's does. Each frame is the live page in an iframe, opened as a
 * scene (`?scene=`, lib/canvas), so a change to the flow shows here without
 * anything being redrawn. Lanes are the brief's stories; a lane's rows are
 * its positive path, its negative ones and its edge data; arrows follow a
 * state to the one an action leads to.
 *
 * Harness chrome, plain on purpose, like the dataset toggle: it isn't part
 * of the design it shows, and it never ships to production (app/canvas).
 */

/** frames that may be loading at once: each is the whole app starting up */
const LOADING_AT_ONCE = 4;
/** a frame that never reports is called failed, so it can't hold the queue */
const LOAD_TIMEOUT_MS = 45000;
const MAX_PAGE_HEIGHT = 14000;
const ZOOM_MIN = 0.03;
const ZOOM_MAX = 2;
/** each page frame's height as it was last seen, so a board opens laid out as it was left */
const HEIGHTS = "rimkirim:canvas:heights";

function readHeights(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(HEIGHTS) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

const KIND_LABEL: Record<SceneKind, string> = { positive: "Positive", negative: "Negative", edge: "Edge" };

interface Cell {
  /** unique on the board: a scene can stand in more than one lane */
  key: string;
  id: string;
  kind: SceneKind;
  scene?: Scene;
  gap?: Gap;
  via?: string;
  /** the cell an arrow comes from, when it's in this lane */
  fromKey?: string;
  /** where it comes from when that's elsewhere: said on the card, no arrow */
  fromTitle?: string;
}
interface LaneModel {
  lane: Lane;
  rows: { kind: SceneKind; cells: Cell[] }[];
}

function model(boardId: string): LaneModel[] {
  const board = findBoard(boardId);
  if (!board) return [];
  return board.lanes.map((lane) => {
    const rows = lane.rows.map((row, r) => ({
      kind: row.kind,
      cells: row.cells.map((c): Cell => {
        const gap = isGap(c) ? c : undefined;
        const scene = isGap(c) ? undefined : findScene(c);
        const id = gap?.id ?? (c as string);
        return { key: `${lane.id}/${r}/${id}`, id, kind: row.kind, scene, gap, via: gap?.via ?? scene?.via };
      }),
    }));
    // each cell's source: the one named, else the one before it in its row
    const inLane = rows.flatMap((row) => row.cells);
    for (const row of rows) {
      row.cells.forEach((cell, i) => {
        const named = cell.gap ? cell.gap.from : cell.scene?.from;
        if (named === null) return;
        if (named === undefined) {
          if (i > 0) cell.fromKey = row.cells[i - 1].key;
          return;
        }
        const here = inLane.find((x) => x.id === named);
        if (here) cell.fromKey = here.key;
        else cell.fromTitle = findScene(named)?.title;
      });
    }
    return { lane, rows };
  });
}

interface FrameState {
  status: "loading" | "ready" | "failed";
  detail?: string;
  height?: number;
}

interface Edge {
  key: string;
  d: string;
  kind: SceneKind;
}

/** an element's box inside the world, in the world's own pixels (no zoom in it) */
function boxIn(el: HTMLElement, world: HTMLElement) {
  let x = 0;
  let y = 0;
  let at: HTMLElement | null = el;
  while (at && at !== world) {
    x += at.offsetLeft;
    y += at.offsetTop;
    at = at.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** a path through points, its corners rounded */
function route(points: [number, number][], r = 28): string {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    const a = Math.min(r, Math.hypot(x - px, y - py) / 2);
    const b = Math.min(r, Math.hypot(nx - x, ny - y) / 2);
    const ax = x - (Math.sign(x - px) || 0) * a;
    const ay = y - (Math.sign(y - py) || 0) * a;
    const bx = x + (Math.sign(nx - x) || 0) * b;
    const by = y + (Math.sign(ny - y) || 0) * b;
    d += ` L ${ax} ${ay} Q ${x} ${y} ${bx} ${by}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

export function CanvasBoard({ boardId }: { boardId: string }) {
  const board = findBoard(boardId);
  const lanes = React.useMemo(() => model(boardId), [boardId]);
  const cells = React.useMemo(() => lanes.flatMap((l) => l.rows.flatMap((r) => r.cells)), [lanes]);

  const [device, setDevice] = React.useState<Device>("desktop");
  const dev = DEVICES[device];
  const [frames, setFrames] = React.useState<Record<string, FrameState>>({});
  /** the cells that have come near the screen, in the order they did */
  const [seen, setSeen] = React.useState<string[]>([]);
  const [nonce, setNonce] = React.useState<Record<string, number>>({});
  const [selected, setSelected] = React.useState<string | null>(null);
  const [interacting, setInteracting] = React.useState<string | null>(null);
  const [edges, setEdges] = React.useState<Edge[]>([]);
  const [zoom, setZoom] = React.useState(1);
  /** the board is laid out (its stylesheet is in) and has its first view */
  const [laid, setLaid] = React.useState(false);
  // read once the page is up (the server has no storage, and must render the same)
  const [known, setKnown] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    const id = window.setTimeout(() => setKnown(readHeights()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const viewport = React.useRef<HTMLDivElement>(null);
  const world = React.useRef<HTMLDivElement>(null);
  const view = React.useRef({ x: 0, y: 0, k: 1 });
  const fitted = React.useRef(false);
  /** the card the view holds on to while the board is still settling: none once it's moved by hand */
  const follow = React.useRef<string | null>(null);

  /* ------------------------------------------------------------ pan and zoom */

  const apply = React.useCallback(() => {
    const { x, y, k } = view.current;
    if (world.current) world.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`;
    setZoom(k);
  }, []);

  const zoomAt = React.useCallback(
    (cx: number, cy: number, to: number) => {
      const v = view.current;
      const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, to));
      const at = viewport.current?.getBoundingClientRect();
      const px = cx - (at?.left ?? 0);
      const py = cy - (at?.top ?? 0);
      // the point under the pointer stays under it
      v.x = px - ((px - v.x) / v.k) * k;
      v.y = py - ((py - v.y) / v.k) * k;
      v.k = k;
      apply();
    },
    [apply],
  );

  /** bring a box of the world into view, with room around it */
  const frameBox = React.useCallback(
    (box: { x: number; y: number; w: number; h: number }, pad = 64, most = 1) => {
      const at = viewport.current;
      if (!at) return;
      const k = Math.min(most, (at.clientWidth - pad * 2) / box.w, (at.clientHeight - pad * 2) / box.h);
      view.current = {
        k: Math.max(ZOOM_MIN, k),
        x: (at.clientWidth - box.w * k) / 2 - box.x * k,
        y: Math.max(pad, (at.clientHeight - box.h * k) / 2) - box.y * k,
      };
      apply();
    },
    [apply],
  );

  const fit = React.useCallback(() => {
    const w = world.current;
    if (!w) return;
    frameBox({ x: 0, y: 0, w: w.offsetWidth, h: w.offsetHeight }, 48, 0.6);
  }, [frameBox]);

  /** the board at its width, from its top: how it opens */
  const fitWidth = React.useCallback(() => {
    const w = world.current;
    const at = viewport.current;
    if (!w || !at) return;
    const k = Math.max(ZOOM_MIN, Math.min(0.6, at.clientWidth / w.offsetWidth));
    view.current = { k, x: (at.clientWidth - w.offsetWidth * k) / 2, y: 0 };
    apply();
  }, [apply]);

  const goTo = React.useCallback(
    (key: string) => {
      const w = world.current;
      const card = w?.querySelector<HTMLElement>(`[data-card="${CSS.escape(key)}"]`);
      if (!w || !card) return;
      frameBox(boxIn(card, w), 72, 1);
    },
    [frameBox],
  );

  React.useEffect(() => {
    const at = viewport.current;
    if (!at) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      follow.current = null;
      const v = view.current;
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, v.k * Math.exp(-e.deltaY * 0.01));
      } else {
        v.x -= e.deltaX;
        v.y -= e.deltaY;
        apply();
      }
    };
    at.addEventListener("wheel", onWheel, { passive: false });
    return () => at.removeEventListener("wheel", onWheel);
  }, [apply, zoomAt]);

  // a drag pans; a press that didn't move picks what's under it
  const drag = React.useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) < 4) return;
    g.moved = true;
    follow.current = null;
    g.x = e.clientX;
    g.y = e.clientY;
    view.current.x += dx;
    view.current.y += dy;
    apply();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = drag.current;
    drag.current = null;
    if (!g || g.moved) return;
    const card = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-card]");
    const key = card?.dataset.card ?? null;
    setSelected(key);
    if (interacting && interacting !== key) setInteracting(null);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest("input, textarea, select")) return;
      const at = viewport.current?.getBoundingClientRect();
      const cx = (at?.left ?? 0) + (at?.width ?? 0) / 2;
      const cy = (at?.top ?? 0) + (at?.height ?? 0) / 2;
      if (e.key === "Escape") {
        if (interacting) setInteracting(null);
        else setSelected(null);
      } else if (e.key === "1" || e.key === "f") fit();
      else if (e.key === "=" || e.key === "+") zoomAt(cx, cy, view.current.k * 1.25);
      else if (e.key === "-") zoomAt(cx, cy, view.current.k / 1.25);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fit, interacting, zoomAt]);

  /* ------------------------------------------------------------------ frames */

  // the seeds wait on this window: each frame's boot script reads its own.
  // In place before any frame is: a frame only mounts once its cell was seen
  React.useLayoutEffect(() => {
    if (!board) return;
    const seeds: NonNullable<Window["__RK_SEEDS__"]> = {};
    for (const s of boardScenes(board)) seeds[s.id] = sceneSeed(s);
    window.__RK_SEEDS__ = seeds;
  }, [board]);

  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as SceneMessage | undefined;
      if (m?.rk !== "scene" || !m.frame) return;
      const key = m.frame;
      setFrames((all) => {
        const was = all[key];
        const height = Math.max(was?.height ?? 0, m.height);
        // a frame that failed stays failed, whatever its page says after
        const status = was?.status === "failed" ? "failed" : m.status === "running" ? (was?.status ?? "loading") : m.status;
        const detail = was?.status === "failed" ? was.detail : m.detail;
        if (was && was.status === status && was.height === height && was.detail === detail) return all;
        return { ...all, [key]: { status, detail, height } };
      });
      if (m.status === "ready") {
        // `cell@device@n` is remembered as `scene@device`
        const [, dv] = key.split("@");
        try {
          const all = readHeights();
          const k = `${m.id}@${dv}`;
          if (all[k] !== m.height) window.localStorage.setItem(HEIGHTS, JSON.stringify({ ...all, [k]: m.height }));
        } catch {
          /* nowhere to remember it: the board settles afresh next time */
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const frameKey = React.useCallback((cell: Cell) => `${cell.key}@${device}@${nonce[cell.key] ?? 0}`, [device, nonce]);

  // frames near the screen are the ones that load (watched only once the
  // board is laid out: before that, every frame is "on screen")
  React.useEffect(() => {
    const at = viewport.current;
    const w = world.current;
    if (!at || !w || !laid) return;
    const io = new IntersectionObserver(
      (entries) => {
        setSeen((was) => {
          let next = was;
          for (const en of entries) {
            const key = (en.target as HTMLElement).dataset.view;
            if (!key || !en.isIntersecting || next.includes(key)) continue;
            next = [...next, key];
          }
          return next;
        });
      },
      { root: at, rootMargin: "300px" },
    );
    w.querySelectorAll<HTMLElement>("[data-view]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lanes, device, laid]);

  // A few at a time, in the order they were seen: a frame is live once it
  // has settled (ready or failed), or while it's one of the first few that
  // haven't. The order never changes under a frame that's loading
  const live = React.useMemo(() => {
    const on = new Set<string>();
    let loading = 0;
    for (const key of seen) {
      const cell = cells.find((c) => c.key === key);
      if (!cell?.scene) continue;
      const fk = frameKey(cell);
      const status = frames[fk]?.status;
      if (status === "ready" || status === "failed") on.add(fk);
      else if (loading < LOADING_AT_ONCE) {
        on.add(fk);
        loading += 1;
      }
    }
    return on;
  }, [cells, frameKey, frames, seen]);

  // one that never answers: said, and out of the queue's way
  const waiting = [...live].filter((k) => !frames[k]).join("|");
  React.useEffect(() => {
    if (!waiting) return;
    const id = window.setTimeout(() => {
      setFrames((all) => {
        const next = { ...all };
        for (const k of waiting.split("|")) if (!next[k]) next[k] = { status: "failed", detail: "the page didn't answer in time" };
        return next;
      });
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [waiting]);

  /* ------------------------------------------------------------------ arrows */

  const draw = React.useCallback(() => {
    const w = world.current;
    if (!w) return;
    const card = (key: string) => w.querySelector<HTMLElement>(`[data-card="${CSS.escape(key)}"]`);
    const shown = (key: string) => w.querySelector<HTMLElement>(`[data-view="${CSS.escape(key)}"]`);
    const next: Edge[] = [];
    for (const { rows } of lanes) {
      // edges that leave their row share the space between rows: each gets a level of its own
      let level = 0;
      rows.forEach((row, r) => {
        row.cells.forEach((cell, i) => {
          if (!cell.fromKey) return;
          const toCard = card(cell.key);
          const toView = shown(cell.key);
          const fromView = shown(cell.fromKey);
          if (!toCard || !toView || !fromView) return;
          const a = boxIn(fromView, w);
          const b = boxIn(toView, w);
          const c = boxIn(toCard, w);
          const before = i > 0 && row.cells[i - 1].key === cell.fromKey;
          if (before) {
            // side by side: straight across, a little below the frames' tops
            const y = Math.min(a.y + a.h, b.y + b.h, Math.max(a.y, b.y) + 140);
            next.push({ key: cell.key, kind: cell.kind, d: route([[a.x + a.w + 10, y], [b.x - 14, y]]) });
            return;
          }
          const sameRow = rows[r].cells.some((x) => x.key === cell.fromKey);
          const lift = 46 + level * 26;
          level += 1;
          const tx = c.x + c.w / 2;
          if (sameRow) {
            // further along its own row: over the frames between
            const fromCard = card(cell.fromKey);
            const top = Math.min(c.y, fromCard ? boxIn(fromCard, w).y : a.y) - lift;
            const sx = a.x + a.w / 2;
            next.push({ key: cell.key, kind: cell.kind, d: route([[sx, (fromCard ? boxIn(fromCard, w).y : a.y) - 10], [sx, top], [tx, top], [tx, c.y - 14]]) });
          } else {
            // from a row above: down from under its card, across over the target, down into it
            const fromCard = card(cell.fromKey);
            const foot = fromCard ? boxIn(fromCard, w) : a;
            const sx = a.x + a.w / 2 + (level - 1) * 18;
            const over = c.y - lift;
            next.push({ key: cell.key, kind: cell.kind, d: route([[sx, foot.y + foot.h + 12], [sx, over], [tx, over], [tx, c.y - 14]]) });
          }
        });
      });
    }
    setEdges(next);
  }, [lanes]);

  React.useLayoutEffect(() => {
    const w = world.current;
    if (!w) return;
    draw();
    const ro = new ResizeObserver(() => {
      draw();
      // the first view, once the board is laid out (its stylesheet is in:
      // in development that's a moment after the markup)
      if (!fitted.current && w.offsetWidth > 0 && window.getComputedStyle(w).position === "absolute") {
        fitted.current = true;
        setLaid(true);
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const asked = hash && cells.find((c) => c.id === hash);
        if (asked) {
          setSelected(asked.key);
          follow.current = asked.key;
          goTo(asked.key);
        } else fitWidth();
      } else if (follow.current) {
        // a frame asked for by link stays in view while the ones above it grow
        goTo(follow.current);
      }
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, [cells, draw, fitWidth, goTo, device]);

  /* ----------------------------------------------------------------- actions */

  const pick = (cell: Cell) => {
    setSelected(cell.key);
    window.history.replaceState(null, "", `#${cell.id}`);
    follow.current = cell.key;
    goTo(cell.key);
  };
  const reload = (cell: Cell) => {
    setNonce((n) => ({ ...n, [cell.key]: (n[cell.key] ?? 0) + 1 }));
  };
  const switchDevice = (next: Device) => {
    if (next === device) return;
    setDevice(next);
    setSeen([]);
    setInteracting(null);
    fitted.current = false;
  };

  if (!board) return null;
  const current = cells.find((c) => c.key === selected) ?? null;
  const failed = cells.filter((c) => c.scene && frames[frameKey(c)]?.status === "failed");
  const total = cells.filter((c) => c.scene).length;
  const ready = cells.filter((c) => c.scene && frames[frameKey(c)]?.status === "ready").length;
  const srcOf = (cell: Cell) =>
    `${cell.scene!.path}?scene=${encodeURIComponent(cell.id)}&frame=${encodeURIComponent(frameKey(cell))}`;

  return (
    <div className="rk-canvas" data-device={device}>
      <aside className="rk-side" aria-label="Boards and scenes">
        <Link href="/canvas" className="rk-home">
          Canvas
        </Link>
        <nav className="rk-boards" aria-label="Boards">
          {BOARDS.map((b) => (
            <Link key={b.id} href={`/canvas/${b.id}`} aria-current={b.id === board.id ? "page" : undefined}>
              {b.title}
            </Link>
          ))}
        </nav>
        <div className="rk-outline">
          {lanes.map(({ lane, rows }) => (
            <section key={lane.id}>
              <h2>
                <span>{lane.ticket}</span>
                {lane.title}
              </h2>
              <ul>
                {rows.flatMap((row) =>
                  row.cells.map((cell) => {
                    const state = cell.scene ? frames[frameKey(cell)]?.status : undefined;
                    return (
                      <li key={cell.key}>
                        <button
                          type="button"
                          data-kind={cell.gap ? "gap" : cell.kind}
                          aria-current={cell.key === selected ? "true" : undefined}
                          onClick={() => pick(cell)}
                        >
                          <i aria-hidden />
                          <span>{cell.gap?.title ?? cell.scene?.title ?? cell.id}</span>
                          {state === "failed" && <b>gagal</b>}
                        </button>
                      </li>
                    );
                  }),
                )}
              </ul>
            </section>
          ))}
        </div>
      </aside>

      <div className="rk-main">
        <header className="rk-bar">
          <div className="rk-title">
            <h1>{board.title}</h1>
            <code>{board.route}</code>
          </div>
          <div className="rk-seg" role="group" aria-label="Viewport">
            {(Object.keys(DEVICES) as Device[]).map((dv) => (
              <button key={dv} type="button" aria-pressed={dv === device} onClick={() => switchDevice(dv)}>
                {DEVICES[dv].label}
              </button>
            ))}
          </div>
          <p className="rk-count" aria-live="polite">
            {ready}/{total} frame siap{failed.length ? ` · ${failed.length} gagal` : ""}
          </p>
          <div className="rk-zoom">
            <button type="button" aria-label="Zoom out" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, view.current.k / 1.25)}>
              −
            </button>
            <output>{Math.round(zoom * 100)}%</output>
            <button type="button" aria-label="Zoom in" onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, view.current.k * 1.25)}>
              +
            </button>
            <button type="button" onClick={fitWidth}>
              Lebar
            </button>
            <button type="button" onClick={fit}>
              Semua
            </button>
          </div>
        </header>

        <div
          ref={viewport}
          className="rk-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={(e) => {
            // by where the pointer is: the surface holds the pointer while it's
            // down, so the event's own target is the surface, not the card
            const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
            const key = under?.closest<HTMLElement>("[data-card]")?.dataset.card;
            const cell = cells.find((c) => c.key === key);
            if (cell?.scene) {
              setSelected(cell.key);
              setInteracting(cell.key);
            }
          }}
        >
          <div ref={world} className="rk-world">
            <p className="rk-lead">{board.lead}</p>
            {lanes.map(({ lane, rows }) => (
              <section key={lane.id} className="rk-lane">
                <header className="rk-lane-head">
                  <div>
                    <p className="rk-ticket">{lane.ticket}</p>
                    <h2>{lane.title}</h2>
                    {lane.story && <p className="rk-story">{lane.story}</p>}
                  </div>
                  {lane.differs && (
                    <div className="rk-differs">
                      <p>Beda dari brief</p>
                      <ul>
                        {lane.differs.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </header>
                {rows.map((row, r) => (
                  <div key={r} className="rk-row" data-kind={row.kind}>
                    <p className="rk-row-name">{KIND_LABEL[row.kind]}</p>
                    <div className="rk-cells">
                      {row.cells.map((cell) => {
                        const fk = frameKey(cell);
                        const state = frames[fk];
                        const screen = cell.scene?.view === "screen";
                        // The frame itself starts a screen tall and grows to what its page
                        // reports, so the height is always measured, never assumed. Until
                        // it has settled, its place is held at the height it had last time
                        const height = screen ? dev.h : Math.min(MAX_PAGE_HEIGHT, Math.max(dev.h, state?.height ?? 0));
                        const settled = state?.status === "ready" || state?.status === "failed";
                        const held = screen || settled ? height : Math.min(MAX_PAGE_HEIGHT, Math.max(height, known[`${cell.id}@${device}`] ?? 0));
                        const on = !!cell.scene && live.has(fk);
                        return (
                          <article
                            key={cell.key}
                            className="rk-card"
                            data-card={cell.key}
                            data-kind={cell.gap ? "gap" : cell.kind}
                            data-selected={cell.key === selected || undefined}
                            data-interacting={cell.key === interacting || undefined}
                            style={{ width: dev.w }}
                          >
                            {cell.via && (
                              <p className="rk-via">
                                <span aria-hidden>{cell.fromKey ? "→" : "↳"}</span>
                                {cell.fromTitle ? `Dari “${cell.fromTitle}”: ${cell.via}` : cell.via}
                              </p>
                            )}
                            <h3>
                              <i aria-hidden />
                              {cell.gap?.title ?? cell.scene?.title}
                              {screen && <em>layar {dev.w}×{dev.h}</em>}
                            </h3>
                            {cell.gap ? (
                              <div className="rk-gap" data-view={cell.key} style={{ width: dev.w }}>
                                <p>Belum ada di prototype</p>
                                <p>{cell.gap.note}</p>
                              </div>
                            ) : (
                              <div className="rk-view" data-view={cell.key} style={{ width: dev.w, height: held }}>
                                {on && (
                                  <iframe
                                    key={fk}
                                    title={cell.scene!.title}
                                    src={srcOf(cell)}
                                    width={dev.w}
                                    height={height}
                                    // a frame is looked at until it's entered (double-click)
                                    tabIndex={cell.key === interacting ? 0 : -1}
                                  />
                                )}
                                {state?.status !== "ready" && state?.status !== "failed" && (
                                  <div className="rk-veil">{on ? "Memuat…" : "Belum dimuat"}</div>
                                )}
                                {state?.status === "failed" && (
                                  <div className="rk-failed">
                                    <strong>Scene gagal</strong>
                                    {state.detail}
                                  </div>
                                )}
                                <div className="rk-shield" />
                              </div>
                            )}
                            {cell.scene?.note && <p className="rk-note">{cell.scene.note}</p>}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            ))}
            <svg className="rk-edges" aria-hidden>
              <defs>
                {(["positive", "negative", "edge"] as const).map((k) => (
                  <marker key={k} id={`rk-head-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className={`rk-head-${k}`} />
                  </marker>
                ))}
              </defs>
              {edges.map((e) => (
                <path key={e.key} d={e.d} data-kind={e.kind} markerEnd={`url(#rk-head-${e.kind})`} />
              ))}
            </svg>
          </div>
        </div>

        {current && (
          <div className="rk-inspect" role="toolbar" aria-label="Selected frame">
            <span data-kind={current.gap ? "gap" : current.kind}>
              <i aria-hidden />
              {current.gap?.title ?? current.scene?.title}
            </span>
            {current.scene && (
              <>
                <button type="button" aria-pressed={interacting === current.key} onClick={() => setInteracting(interacting === current.key ? null : current.key)}>
                  {interacting === current.key ? "Selesai" : "Interaksi"}
                </button>
                <button type="button" onClick={() => reload(current)}>
                  Muat ulang
                </button>
                <a href={`${current.scene.path}?scene=${encodeURIComponent(current.id)}`} target="_blank" rel="noreferrer">
                  Buka di tab baru
                </a>
              </>
            )}
            <button type="button" onClick={() => goTo(current.key)}>
              Zoom ke frame
            </button>
          </div>
        )}

        <ul className="rk-legend" aria-label="Legend">
          <li data-kind="positive">
            <i aria-hidden />
            Positive
          </li>
          <li data-kind="negative">
            <i aria-hidden />
            Negative
          </li>
          <li data-kind="edge">
            <i aria-hidden />
            Edge
          </li>
          <li data-kind="gap">
            <i aria-hidden />
            Belum ada
          </li>
          <li className="rk-hint">Geser: drag atau scroll · Zoom: pinch atau ⌘ + scroll · Klik dua kali frame untuk berinteraksi</li>
        </ul>
      </div>
    </div>
  );
}
