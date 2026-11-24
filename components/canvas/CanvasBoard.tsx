"use client";

import * as React from "react";
import Link from "next/link";
import { BOARDS, boardCount, boardHome, boardScenes, findBoard, findScene, sceneSeed } from "@/lib/canvas/registry";
import { DEVICES, isGap, type Device, type Gap, type Lane, type Scene, type SceneKind, type View } from "@/lib/canvas/types";
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
 * Three parts, in the order they're read: the side list (which board, then
 * its lanes and their frames), the surface, and the inspector, which is
 * there only while a frame or a lane is in hand and holds everything said
 * about it: what it shows, how it's reached, where the lane differs from
 * the brief, and what to do with it. The surface itself carries names and
 * nothing longer, and its names keep their size whatever the zoom.
 *
 * Harness chrome, plain on purpose, like the dataset toggle: it isn't part
 * of the design it shows.
 * Its look is canvas.css's tokens and nothing else; the few numbers below
 * are those tokens again, where a length has to be worked out in script.
 */

/** canvas.css's spacing scale, by step */
const S = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64, 9: 96 } as const;
/** world px per scale px (`--rk-w`): a frame is 1440 wide, so the room around it is scaled up to match */
const WORLD: Record<Device, number> = { desktop: 6, mobile: 3 };
/** what stands over a frame, in screen px: its action and its title, or its title alone */
const LABELS = { near: 44, far: 28 } as const;
/** a label's size in a lane's picture (`--rk-p` under `data-print`): one and a half times the chrome's, once the picture is scaled by LANE_SCALE */
const PRINT_LABEL: Record<Device, number> = { desktop: 2.5, mobile: 1.5 };
/** `--rk-stroke-2` */
const STROKE = 2;
/** how far Shift with an arrow key moves the board, in screen px */
const PAN_STEP = S[8];

/** frames that may be loading at once: each is the whole app starting up */
const LOADING_AT_ONCE = 4;
/**
 * How many frames may be live at once, in page-frame units. Each live frame
 * is the whole app running, so a board with every frame up took gigabytes;
 * past this, the frames furthest down the queue are let go and say so.
 */
const LIVE_BUDGET = 16;
/** a section frame runs the whole long page it's cut from, so it costs more */
const COST: Record<View, number> = { page: 1, screen: 1, section: 3 };
/** a frame that never reports is called failed, so it can't hold the queue */
const LOAD_TIMEOUT_MS = 45000;
const MAX_PAGE_HEIGHT = 14000;
const MIN_SECTION_HEIGHT = 240;
const ZOOM_MIN = 0.03;
const ZOOM_MAX = 2;
/** the surface's own grey (`--rk-surface`), behind a lane's picture too */
const SURFACE = "#ebebed";
/** a lane's picture: how much of full size, and the most it may be wide */
const LANE_SCALE: Record<Device, number> = { desktop: 0.6, mobile: 1 };
const LANE_MAX_WIDTH = 5600;
/** `--rk-positive`, `--rk-negative`, `--rk-edge`: a lane's picture draws its arrows by hand */
const KIND_COLOR: Record<SceneKind, string> = { positive: "#166534", negative: "#b91c1c", edge: "#4338ca" };
/** each page frame's height as it was last seen, so a board opens laid out as it was left */
const HEIGHTS = "rimkirim:canvas:heights";

function readHeights(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(HEIGHTS) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

const KIND_LABEL: Record<SceneKind | "gap", string> = { positive: "Positive", negative: "Negative", edge: "Edge", gap: "Not built" };
const VIEW_SAYS: Record<View, string> = { page: "The whole page", screen: "One screen", section: "One section, whole" };

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
  /** where it comes from when that's elsewhere: said with the action, no arrow */
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

const titleOf = (cell: Cell) => cell.gap?.title ?? cell.scene?.title ?? cell.id;
const noteOf = (cell: Cell) => cell.gap?.note ?? cell.scene?.note;
const viaOf = (cell: Cell) => (cell.via && cell.fromTitle ? `From “${cell.fromTitle}”: ${cell.via}` : cell.via);
const viewOf = (cell: Cell): View => cell.scene?.view ?? "page";
/** a cell's key starts with its lane's id */
const laneIdOf = (key: string) => key.slice(0, key.indexOf("/"));

interface FrameState {
  /** "idle": it came up, then was let go to save memory; it loads again when it's back near the screen */
  status: "loading" | "ready" | "failed" | "idle";
  detail?: string;
  height?: number;
  /** it has been ready at least once: counted as loaded, and not queued ahead of those that haven't */
  up?: boolean;
}

interface Edge {
  key: string;
  d: string;
  kind: SceneKind;
  /** where its arrowhead is and which way it points: a lane's picture draws it by hand */
  end: [number, number];
  dir: "right" | "down";
}

/** what a copy button is doing, by its key (`image:<cell>`, `link:<cell>`, `lane:<lane>`) */
interface Copying {
  key: string;
  state: "busy" | "copied" | "saved" | "failed";
}
const COPY_SAYS: Record<Copying["state"], string> = {
  busy: "Copying…",
  copied: "Copied",
  saved: "Saved as a file",
  failed: "Couldn't copy",
};

const paint = () => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())));
const today = () => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
const fileName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const toPng = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((done, fail) => canvas.toBlob((b) => (b ? done(b) : fail(new Error("the picture couldn't be made"))), "image/png"));

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
function route(points: [number, number][], r: number): string {
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

/**
 * The arrows of some lanes, from where their frames stand now. An arrow to
 * the next frame of its row runs straight across. One to a frame further
 * along, or from a row above, runs through the gutter over the target's row
 * (canvas.css, .rk-row), each at a level of its own, and comes down onto the
 * target's card. `u` is the world's unit (`--rk-w`).
 */
function arrows(w: HTMLElement, lanes: LaneModel[], u: number): Edge[] {
  const card = (key: string) => w.querySelector<HTMLElement>(`[data-card="${CSS.escape(key)}"]`);
  const shown = (key: string) => w.querySelector<HTMLElement>(`[data-view="${CSS.escape(key)}"]`);
  const pad = S[1] * u;
  const corner = S[2] * u;
  const out: Edge[] = [];
  for (const { rows } of lanes) {
    rows.forEach((row) => {
      // the arrows that arrive through this row's gutter share it: each gets a level of its own
      let level = 0;
      row.cells.forEach((cell, i) => {
        if (!cell.fromKey) return;
        const toCard = card(cell.key);
        const toView = shown(cell.key);
        const fromCard = card(cell.fromKey);
        const fromView = shown(cell.fromKey);
        if (!toCard || !toView || !fromCard || !fromView) return;
        const a = boxIn(fromView, w);
        const b = boxIn(toView, w);
        const from = boxIn(fromCard, w);
        const to = boxIn(toCard, w);
        if (i > 0 && row.cells[i - 1].key === cell.fromKey) {
          const y = Math.min(a.y + a.h, b.y + b.h, Math.max(a.y, b.y) + S[5] * u);
          out.push({ key: cell.key, kind: cell.kind, d: route([[a.x + a.w + pad, y], [b.x - pad, y]], corner), end: [b.x - pad, y], dir: "right" });
          return;
        }
        level += 1;
        // from the gutter's top down, a step each: as far from the names under it as the gutter allows
        const over = to.y - S[5] * u + level * S[1] * u;
        const tx = to.x + to.w / 2;
        const end: [number, number] = [tx, to.y];
        if (row.cells.some((x) => x.key === cell.fromKey)) {
          const sx = a.x + a.w / 2;
          out.push({ key: cell.key, kind: cell.kind, d: route([[sx, from.y], [sx, over], [tx, over], end], corner), end, dir: "down" });
        } else {
          const sx = a.x + a.w / 2 + (level - 1) * S[1] * u;
          out.push({ key: cell.key, kind: cell.kind, d: route([[sx, from.y + from.h + pad], [sx, over], [tx, over], end], corner), end, dir: "down" });
        }
      });
    });
  }
  return out;
}

export function CanvasBoard({ boardId }: { boardId: string }) {
  const board = findBoard(boardId);
  const lanes = React.useMemo(() => model(boardId), [boardId]);
  const cells = React.useMemo(() => lanes.flatMap((l) => l.rows.flatMap((r) => r.cells)), [lanes]);

  const [device, setDevice] = React.useState<Device>("desktop");
  const dev = DEVICES[device];
  const unit = WORLD[device];
  const [frames, setFrames] = React.useState<Record<string, FrameState>>({});
  /** the cells that have come near the screen, in the order they did */
  const [seen, setSeen] = React.useState<string[]>([]);
  /** the cells near the screen now: only these (and what's pinned) stay live */
  const [near, setNear] = React.useState<ReadonlySet<string>>(() => new Set());
  /** frames a lane's picture needs live while it's drawn, wherever they are */
  const [pins, setPins] = React.useState<readonly string[]>([]);
  const [nonce, setNonce] = React.useState<Record<string, number>>({});
  /** what's in hand: a frame, or failing that a lane */
  const [selected, setSelected] = React.useState<string | null>(null);
  const [laneSel, setLaneSel] = React.useState<string | null>(null);
  /** said aloud by a screen reader, not shown: what was picked on the board, what a copy came to */
  const [said, setSaid] = React.useState("");
  /** a narrow window: the side list, opened over the surface from the bar */
  const [sideOpen, setSideOpen] = React.useState(false);
  const [interacting, setInteracting] = React.useState<string | null>(null);
  const [edges, setEdges] = React.useState<Edge[]>([]);
  const [copying, setCopying] = React.useState<Copying | null>(null);
  const [zoom, setZoom] = React.useState(1);
  /** the board is laid out (its stylesheet is in) and has its first view */
  const [laid, setLaid] = React.useState(false);
  // read once the page is up (the server has no storage, and must render the same)
  const [known, setKnown] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    const id = window.setTimeout(() => setKnown(readHeights()), 0);
    return () => window.clearTimeout(id);
  }, []);

  // the latest of each, for work that runs on after the render it started in
  const framesNow = React.useRef(frames);
  const unitNow = React.useRef(unit);
  React.useEffect(() => {
    framesNow.current = frames;
    unitNow.current = unit;
  }, [frames, unit]);

  const viewport = React.useRef<HTMLDivElement>(null);
  const world = React.useRef<HTMLDivElement>(null);
  const outline = React.useRef<HTMLDivElement>(null);
  const view = React.useRef({ x: 0, y: 0, k: 1 });
  const fitted = React.useRef(false);
  /** what the view holds on to while the board is still settling (`cell:<key>` or `lane:<id>`): nothing once it's moved by hand */
  const follow = React.useRef<string | null>(null);

  // the side list keeps what's in hand in sight, wherever it was picked
  React.useEffect(() => {
    outline.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selected, laneSel]);

  /* ------------------------------------------------------------ pan and zoom */

  const apply = React.useCallback(() => {
    const { x, y, k } = view.current;
    const w = world.current;
    if (w) {
      // Names keep their size on screen: scaled against the zoom, for as long as a
      // frame's title still fits the band over it (canvas.css, .rk-card-head).
      // Past that, about 10% for a desktop board, they shrink with the board
      const band = S[7] * unitNow.current;
      const label = Math.min(band / LABELS.far, Math.max(1, 1 / k));
      w.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`;
      w.style.setProperty("--rk-label", String(label));
      // and the band holds what fits in it at this zoom
      w.dataset.lod = label * LABELS.near <= band ? "near" : "far";
    }
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
  /** zoom about the middle of the surface: the bar's buttons, the keys */
  const zoomBy = React.useCallback(
    (factor: number) => {
      const at = viewport.current?.getBoundingClientRect();
      if (at) zoomAt(at.left + at.width / 2, at.top + at.height / 2, view.current.k * factor);
    },
    [zoomAt],
  );

  /** bring a box of the world into view, with room around it and, over it, room for what's written there */
  const frameBox = React.useCallback(
    (box: { x: number; y: number; w: number; h: number }, pad: number, most: number, over = pad) => {
      const at = viewport.current;
      if (!at) return;
      const k = Math.max(ZOOM_MIN, Math.min(most, (at.clientWidth - pad * 2) / box.w, (at.clientHeight - over - pad) / box.h));
      // in the middle of what's left under `over`, or from its top when it's taller than that
      const y = over + Math.max(0, (at.clientHeight - over - pad - box.h * k) / 2);
      view.current = { k, x: (at.clientWidth - box.w * k) / 2 - box.x * k, y: y - box.y * k };
      apply();
    },
    [apply],
  );

  const fit = React.useCallback(() => {
    const w = world.current;
    if (w) frameBox({ x: 0, y: 0, w: w.offsetWidth, h: w.offsetHeight }, S[5], 0.6);
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

  /** bring a frame (`cell:<key>`) or a lane (`lane:<id>`) into view */
  const reveal = React.useCallback(
    (target: string) => {
      const w = world.current;
      if (!w) return;
      const lane = target.startsWith("lane:");
      const name = CSS.escape(target.slice(target.indexOf(":") + 1));
      // a lane whole; a frame by its page, with its labels' room kept over it
      const el = w.querySelector<HTMLElement>(lane ? `[data-lane="${name}"]` : `[data-view="${name}"]`);
      if (!el) return;
      if (lane) frameBox(boxIn(el, w), S[5], 0.6);
      // (on a short surface, a window zoomed to 200%, less is kept: the frame itself comes first)
      else frameBox(boxIn(el, w), S[5], 1, Math.min(S[9], (viewport.current?.clientHeight ?? 0) / 4));
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
    // the inspector opening or closing changes how much surface there is: what's followed stays in view
    const sized = new ResizeObserver(() => {
      if (follow.current) reveal(follow.current);
    });
    sized.observe(at);
    return () => {
      at.removeEventListener("wheel", onWheel);
      sized.disconnect();
    };
  }, [apply, reveal, zoomAt]);

  /** for whoever isn't looking: the frame the board's own keys, or a press on it, picked */
  const announce = (cell: Cell) => {
    const lane = lanes.find((l) => l.lane.id === laneIdOf(cell.key))?.lane;
    setSaid(`${KIND_LABEL[cell.gap ? "gap" : cell.kind]}: ${titleOf(cell)}${lane ? `, ${lane.ticket}` : ""}`);
  };

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
    if (!g.moved && Math.hypot(dx, dy) < S[1]) return;
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
    // by where the pointer is: the surface holds the pointer while it's down
    const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const key = under?.closest<HTMLElement>("[data-card]")?.dataset.card ?? null;
    const lane = key ? laneIdOf(key) : (under?.closest<HTMLElement>("[data-lane-label]")?.dataset.laneLabel ?? null);
    follow.current = null;
    setSelected(key);
    setLaneSel(lane);
    if (interacting && interacting !== key) setInteracting(null);
    const cell = key ? cells.find((c) => c.key === key) : null;
    if (cell) announce(cell);
  };

  /* ------------------------------------------------------------ the keyboard */

  // Escape lets go, from anywhere in the canvas: of the frame in use, then of
  // the frame, then of the lane. The keys that are one character belong to the
  // board alone (onBoardKey): they can't fire while something else has the keys
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || (e.target as HTMLElement | null)?.closest("input, textarea, select")) return;
      if (interacting) setInteracting(null);
      else if (selected) setSelected(null);
      else if (laneSel) setLaneSel(null);
      else setSideOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interacting, laneSel, selected]);

  /** the board's rows in order, lane after lane: what the arrow keys walk */
  const grid = React.useMemo(() => lanes.flatMap((l) => l.rows.map((r) => r.cells)), [lanes]);

  /** move the view just enough to have a frame on screen, at the zoom it's at */
  const bringIn = React.useCallback(
    (key: string) => {
      const w = world.current;
      const at = viewport.current;
      const el = w?.querySelector<HTMLElement>(`[data-card="${CSS.escape(key)}"]`);
      if (!w || !at || !el) return;
      const b = boxIn(el, w);
      const v = view.current;
      const pad = S[5];
      const left = b.x * v.k + v.x;
      const top = b.y * v.k + v.y;
      // a frame bigger than the surface is shown from its top left
      if (left < pad || b.w * v.k > at.clientWidth - pad * 2) v.x += pad - left;
      else if (left + b.w * v.k > at.clientWidth - pad) v.x -= left + b.w * v.k - (at.clientWidth - pad);
      if (top < pad || b.h * v.k > at.clientHeight - pad * 2) v.y += pad - top;
      else if (top + b.h * v.k > at.clientHeight - pad) v.y -= top + b.h * v.k - (at.clientHeight - pad);
      apply();
    },
    [apply],
  );

  /** the board's own keys, while the board itself has them */
  const onBoardKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.metaKey || e.ctrlKey || e.altKey) return;
    const ways: Record<string, [number, number] | undefined> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const way = ways[e.key];
    const r = grid.findIndex((row) => row.some((x) => x.key === selected));
    const c = r < 0 ? -1 : grid[r].findIndex((x) => x.key === selected);
    let to: Cell | undefined;
    if (way && e.shiftKey) {
      follow.current = null;
      view.current.x -= way[0] * PAN_STEP;
      view.current.y -= way[1] * PAN_STEP;
      apply();
    } else if (way && r < 0) {
      // nothing in hand yet: the first frame on screen, or the board's first
      const at = e.currentTarget.getBoundingClientRect();
      to =
        cells.find((x) => {
          const box = world.current?.querySelector(`[data-view="${CSS.escape(x.key)}"]`)?.getBoundingClientRect();
          return !!box && box.right > at.left && box.left < at.right && box.bottom > at.top && box.top < at.bottom;
        }) ?? cells[0];
    } else if (way && way[0]) to = grid[r][c + way[0]];
    else if (way) {
      // the frame under or over this one: rows start at the same edge
      const row = grid[r + way[1]];
      to = row?.[Math.min(c, row.length - 1)];
    } else if (e.key === "Home" && r >= 0) to = grid[r][0];
    else if (e.key === "End" && r >= 0) to = grid[r][grid[r].length - 1];
    else if (e.key === "Enter" && selected) {
      follow.current = `cell:${selected}`;
      reveal(follow.current);
    } else if (e.key === "+" || e.key === "=") zoomBy(1.25);
    else if (e.key === "-") zoomBy(0.8);
    else if (e.key === "0") fitWidth();
    else if (e.key === "1") fit();
    else return;
    e.preventDefault();
    if (!to) return;
    follow.current = null;
    setSelected(to.key);
    setLaneSel(laneIdOf(to.key));
    setInteracting(null);
    bringIn(to.key);
    announce(to);
  };

  // a frame in use has the keys: Tab goes through the page inside it, and out again
  React.useEffect(() => {
    if (interacting) world.current?.querySelector<HTMLIFrameElement>(`[data-view="${CSS.escape(interacting)}"] iframe`)?.focus({ preventScroll: true });
  }, [interacting]);

  // the side list, opened from the bar on a narrow window, takes the keys with it
  React.useEffect(() => {
    if (sideOpen) document.querySelector<HTMLElement>("#rk-side a")?.focus();
  }, [sideOpen]);

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
      const section = findScene(m.id)?.view === "section";
      setFrames((all) => {
        const was = all[key];
        // a page only grows (its frame is at least a screen); a section is exactly as tall as it says
        const height = section ? m.height : Math.max(was?.height ?? 0, m.height);
        // a frame that failed stays failed, whatever its page says after
        // (one let go and loading again is loading, so it isn't pulled from under its page)
        const status =
          was?.status === "failed"
            ? "failed"
            : m.status === "running"
              ? was?.status === "idle"
                ? "loading"
                : (was?.status ?? "loading")
              : m.status;
        const detail = was?.status === "failed" ? was.detail : m.detail;
        const up = was?.up || status === "ready" || undefined;
        if (was && was.status === status && was.height === height && was.detail === detail && was.up === up) return all;
        return { ...all, [key]: { status, detail, height, up } };
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
        // and which are near it now, coming and going
        setNear((was) => {
          let next: Set<string> | null = null;
          for (const en of entries) {
            const key = (en.target as HTMLElement).dataset.view;
            if (!key || en.isIntersecting === was.has(key)) continue;
            next ??= new Set(was);
            if (en.isIntersecting) next.add(key);
            else next.delete(key);
          }
          return next ?? was;
        });
      },
      { root: at, rootMargin: "300px" },
    );
    w.querySelectorAll<HTMLElement>("[data-view]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lanes, device, laid]);

  // Which frames are live, within LIVE_BUDGET, a few loading at a time:
  // 1. what's pinned: the frame in hand, the one being used, a lane being copied;
  // 2. near frames that are loading now, so nothing is pulled from under a page mid-load;
  // 3. only for `npm run check:scenes` (`?check`): near frames that have never come
  //    up, in the order they were seen, so with more near than the budget each
  //    still comes up once, in turn (a person looking at the whole board instead
  //    gets the first that fit, without frames loading in and out);
  // 4. near frames in the order they were seen, to fill what's left.
  // A frame let go keeps its height and says how to see it again.
  const live = React.useMemo(() => {
    const everyOnce = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("check");
    const on = new Set<string>();
    let loading = 0;
    let used = 0;
    const take = (cell: Cell, pinned = false) => {
      const fk = frameKey(cell);
      if (on.has(fk)) return;
      const cost = COST[viewOf(cell)];
      const status = frames[fk]?.status;
      const settled = status === "ready" || status === "failed";
      if (!pinned && used + cost > LIVE_BUDGET) return;
      if (!settled) {
        if (loading >= LOADING_AT_ONCE) return;
        loading += 1;
      }
      on.add(fk);
      used += cost;
    };
    const byKey = new Map(cells.map((c) => [c.key, c]));
    for (const key of [selected, interacting, ...pins]) {
      const cell = key ? byKey.get(key) : undefined;
      if (cell?.scene) take(cell, true);
    }
    const nearby = seen.map((k) => byKey.get(k)).filter((c): c is Cell => !!c?.scene && near.has(c.key));
    const state = (c: Cell) => frames[frameKey(c)];
    for (const c of nearby) if (state(c)?.status === "loading") take(c);
    if (everyOnce) for (const c of nearby) if (!state(c)?.up && state(c)?.status !== "failed") take(c);
    for (const c of nearby) take(c);
    return on;
  }, [cells, frameKey, frames, seen, near, pins, selected, interacting]);

  // a frame let go: idle, so it loads again (and counts as loading) when it's back
  const wasLive = React.useRef<ReadonlySet<string>>(new Set());
  React.useEffect(() => {
    const gone = [...wasLive.current].filter((k) => !live.has(k));
    wasLive.current = live;
    if (!gone.length) return;
    setFrames((all) => {
      let next: Record<string, FrameState> | null = null;
      for (const k of gone) {
        const s = all[k];
        if (s?.status !== "ready" && s?.status !== "loading") continue;
        next ??= { ...all };
        next[k] = { ...s, status: "idle" };
      }
      return next ?? all;
    });
  }, [live]);

  // one that never answers: said, and out of the queue's way
  const waiting = [...live].filter((k) => !frames[k] || frames[k].status === "idle").join("|");
  React.useEffect(() => {
    if (!waiting) return;
    const id = window.setTimeout(() => {
      setFrames((all) => {
        const next = { ...all };
        for (const k of waiting.split("|")) {
          if (!next[k] || next[k].status === "idle") next[k] = { ...next[k], status: "failed", detail: "the page didn't answer in time" };
        }
        return next;
      });
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [waiting]);

  /* ------------------------------------------------------------------ arrows */

  const draw = React.useCallback(() => {
    const w = world.current;
    if (w) setEdges(arrows(w, lanes, unitNow.current));
  }, [lanes]);

  const pickCell = React.useCallback(
    (cell: Cell, bring: boolean) => {
      setSelected(cell.key);
      setLaneSel(laneIdOf(cell.key));
      follow.current = bring ? `cell:${cell.key}` : null;
      if (bring) reveal(`cell:${cell.key}`);
    },
    [reveal],
  );

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
        const asked = cells.find((c) => c.id === decodeURIComponent(window.location.hash.slice(1)));
        if (asked) pickCell(asked, true);
        else fitWidth();
      } else if (follow.current) {
        // what was asked for stays in view while the frames above it grow
        reveal(follow.current);
      }
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, [cells, draw, fitWidth, pickCell, reveal, device]);

  // a frame's link followed while the board is already open
  React.useEffect(() => {
    const onHash = () => {
      const asked = cells.find((c) => c.id === decodeURIComponent(window.location.hash.slice(1)));
      if (asked) pickCell(asked, true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [cells, pickCell]);

  // and the address names the frame in hand, however it was picked, so it can be passed on as it is
  React.useEffect(() => {
    if (!laid) return;
    const cell = selected ? cells.find((c) => c.key === selected) : null;
    const hash = cell ? `#${cell.id}` : "";
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash || window.location.pathname + window.location.search);
  }, [cells, laid, selected]);

  /* ----------------------------------------------------------------- actions */

  const pickLane = (id: string) => {
    setSelected(null);
    setLaneSel(id);
    follow.current = `lane:${id}`;
    reveal(`lane:${id}`);
  };
  const reload = (cell: Cell) => {
    setNonce((n) => ({ ...n, [cell.key]: (n[cell.key] ?? 0) + 1 }));
  };
  const switchDevice = (next: Device) => {
    if (next === device) return;
    setDevice(next);
    setSeen([]);
    setNear(new Set());
    setInteracting(null);
    follow.current = null;
    fitted.current = false;
  };

  /* ------------------------------------------------------------------ copying */

  const say = (key: string, state: Copying["state"]) => {
    setCopying({ key, state });
    setSaid(COPY_SAYS[state]);
    if (state !== "busy") window.setTimeout(() => setCopying((c) => (c?.key === key && c.state === state ? null : c)), 2200);
  };
  const saying = (key: string, idle: string) => (copying?.key === key ? COPY_SAYS[copying.state] : idle);

  /** a picture onto the clipboard; where the browser won't allow that, into a file */
  const copyPng = async (key: string, picture: Promise<Blob>, file: string) => {
    say(key, "busy");
    try {
      // the promise goes in as it is, so the press that asked still counts when the picture is ready
      await navigator.clipboard.write([new ClipboardItem({ "image/png": picture })]);
      say(key, "copied");
    } catch {
      try {
        download(await picture, file);
        say(key, "saved");
      } catch {
        say(key, "failed");
      }
    }
  };

  /** a frame's page as a picture, asked of the frame itself (SceneRunner draws it) */
  const shoot = (cell: Cell, scale: number): Promise<Blob> => {
    const frame = world.current?.querySelector<HTMLIFrameElement>(`[data-view="${CSS.escape(cell.key)}"] iframe`);
    const capture = frame?.contentWindow?.__RK_SCENE__?.capture;
    if (!capture) return Promise.reject(new Error("the frame isn't loaded"));
    return capture(viewOf(cell), scale);
  };

  /** one frame, with a line under it that says what it is and when it was taken: the picture won't follow the code */
  const frameImage = async (cell: Cell, lane: Lane): Promise<Blob> => {
    const scale = device === "mobile" ? 2 : 1;
    const shot = await createImageBitmap(await shoot(cell, scale));
    const lines = [`${lane.ticket} · ${titleOf(cell)}`, `${dev.label} · ${today()}`];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas to draw on");
    // the caption is the chrome's own type: body size, on the spacing scale
    const size = 13 * scale;
    const line = 20 * scale;
    const font = `${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`;
    ctx.font = font;
    const pad = S[3] * scale;
    // one line when it fits, two when it doesn't (a phone's frame is narrow)
    const one = lines.join(" · ");
    const text = ctx.measureText(one).width + pad * 2 <= shot.width ? [one] : lines;
    const strip = line * text.length + pad;
    canvas.width = shot.width;
    canvas.height = shot.height + strip;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(shot, 0, 0);
    ctx.fillStyle = "#f4f4f5";
    ctx.fillRect(0, shot.height, canvas.width, strip);
    ctx.fillStyle = "#dcdce0";
    ctx.fillRect(0, shot.height, canvas.width, scale);
    ctx.fillStyle = "#18181b";
    ctx.font = font;
    ctx.textBaseline = "middle";
    text.forEach((t, i) => ctx.fillText(t, pad, shot.height + pad / 2 + line * (i + 0.5), canvas.width - pad * 2));
    return toPng(canvas);
  };

  /**
   * One lane as a picture: its ticket and story, its rows, each frame with
   * its action, title and note, and the arrows. The lane is put in its
   * print form (canvas.css, `data-print`) for as long as the picture takes:
   * its own markup is drawn as it stands, each frame's page is asked of the
   * frame and laid into its place, and the arrows are drawn over both.
   */
  const laneImage = async (lm: LaneModel): Promise<Blob> => {
    const w = world.current;
    const el = w?.querySelector<HTMLElement>(`[data-lane="${CSS.escape(lm.lane.id)}"]`);
    if (!w || !el) throw new Error("the lane isn't on the board");
    const mine = lm.rows.flatMap((r) => r.cells).filter((c) => c.scene);

    // every frame of the lane up and settled, whether or not it has been on screen,
    // and kept live (pinned) until the picture is drawn
    setSeen((was) => [...was, ...mine.map((c) => c.key).filter((k) => !was.includes(k))]);
    setPins(mine.map((c) => c.key));
    const settled = () =>
      mine.every((c) => {
        const status = framesNow.current[frameKey(c)]?.status;
        return status === "ready" || status === "failed";
      });
    for (let waited = 0; !settled() && waited < 120_000; waited += 300) await new Promise((done) => window.setTimeout(done, 300));

    el.dataset.print = "";
    try {
      await paint();
      const u = unitNow.current;
      const label = PRINT_LABEL[device];
      const pad = S[4] * u;
      const box = boxIn(el, w);
      const reach = [...el.querySelectorAll<HTMLElement>("[data-card], .rk-lane-head")].map((x) => {
        const b = boxIn(x, w);
        return b.x + b.w;
      });
      const width = Math.max(...reach) - box.x;
      const scale = Math.min(LANE_SCALE[device], LANE_MAX_WIDTH / (width + pad * 2));

      const { toCanvas } = await import("html-to-image");
      const chrome = await toCanvas(el, {
        width,
        height: box.h,
        pixelRatio: scale,
        // the canvas's own type is the system's: nothing to embed
        skipFonts: true,
        style: { margin: "0" },
        filter: (node) => !(node instanceof Element && node.matches("iframe, .rk-veil, .rk-shield, .rk-failed")),
      });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round((width + pad * 2) * scale);
      canvas.height = Math.round((box.h + pad * 2) * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas to draw on");
      ctx.fillStyle = SURFACE;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(chrome, pad * scale, pad * scale, width * scale, box.h * scale);

      for (const cell of mine) {
        const shown = w.querySelector<HTMLElement>(`[data-view="${CSS.escape(cell.key)}"]`);
        if (!shown || framesNow.current[frameKey(cell)]?.status !== "ready") continue;
        const b = boxIn(shown, w);
        const shot = await createImageBitmap(await shoot(cell, scale));
        const x = (b.x - box.x + pad) * scale;
        const y = (b.y - box.y + pad) * scale;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, b.w * scale, b.h * scale, S[1] * label * scale);
        ctx.clip();
        ctx.drawImage(shot, x, y, b.w * scale, b.h * scale);
        ctx.restore();
      }

      const weight = STROKE * label;
      for (const edge of arrows(w, [lm], u)) {
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, (pad - box.x) * scale, (pad - box.y) * scale);
        ctx.strokeStyle = KIND_COLOR[edge.kind];
        ctx.fillStyle = KIND_COLOR[edge.kind];
        ctx.lineWidth = weight;
        ctx.lineCap = "round";
        if (edge.kind === "negative") ctx.setLineDash([S[2] * label, S[1] * label]);
        ctx.stroke(new Path2D(edge.d));
        ctx.setLineDash([]);
        const [x, y] = edge.end;
        const head = weight * 4;
        ctx.beginPath();
        if (edge.dir === "right") {
          ctx.moveTo(x + head * 0.4, y);
          ctx.lineTo(x - head * 0.6, y - head / 2);
          ctx.lineTo(x - head * 0.6, y + head / 2);
        } else {
          ctx.moveTo(x, y + head * 0.4);
          ctx.lineTo(x - head / 2, y - head * 0.6);
          ctx.lineTo(x + head / 2, y - head * 0.6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      return await toPng(canvas);
    } finally {
      delete el.dataset.print;
      setPins([]);
    }
  };

  const sceneUrl = (cell: Cell) => `${window.location.origin}${cell.scene!.path}?scene=${encodeURIComponent(cell.id)}`;
  const copyLink = async (cell: Cell) => {
    const key = `link:${cell.key}`;
    try {
      await navigator.clipboard.writeText(sceneUrl(cell));
      say(key, "copied");
    } catch {
      say(key, "failed");
    }
  };

  if (!board) return null;
  const current = cells.find((c) => c.key === selected) ?? null;
  const currentLane = lanes.find((l) => l.lane.id === laneSel) ?? null;
  const failed = cells.filter((c) => c.scene && frames[frameKey(c)]?.status === "failed").length;
  const total = cells.filter((c) => c.scene).length;
  // loaded: has come up, whether it's live now or was let go since
  const ready = cells.filter((c) => {
    const s = c.scene && frames[frameKey(c)];
    return !!s && s.up && s.status !== "failed";
  }).length;
  const srcOf = (cell: Cell) =>
    `${cell.scene!.path}?scene=${encodeURIComponent(cell.id)}&frame=${encodeURIComponent(frameKey(cell))}`;
  const close = () => {
    follow.current = null;
    setSelected(null);
    setLaneSel(null);
    setInteracting(null);
    // its button goes with the panel: the keys go back to the board
    viewport.current?.focus({ preventScroll: true });
  };

  return (
    <div className="rk-canvas" data-device={device} data-inspecting={current || currentLane ? "" : undefined} data-side-open={sideOpen || undefined}>
      <p className="rk-sr" role="status">
        {said}
      </p>
      <p className="rk-sr" role="status">
        {failed > 0 && `${failed} ${failed === 1 ? "frame" : "frames"} failed to load`}
      </p>
      <aside id="rk-side" className="rk-side" aria-label="Boards and frames">
        <Link href="/canvas" className="rk-home">
          Canvas
        </Link>
        <nav className="rk-boards" aria-label="Boards">
          {BOARDS.map((b) => (
            <Link key={b.id} href={`/canvas/${b.id}`} aria-current={b.id === board.id ? "page" : undefined}>
              {b.title}
              <span>{boardCount(b).scenes}</span>
            </Link>
          ))}
        </nav>
        <div ref={outline} className="rk-outline">
          <p>{board.lead}</p>
          {lanes.map(({ lane, rows }) => (
            <section key={lane.id}>
              <h2>
                <button type="button" aria-current={!current && laneSel === lane.id ? "true" : undefined} onClick={() => pickLane(lane.id)}>
                  <code>{lane.ticket}</code>
                  <span>{lane.title}</span>
                </button>
              </h2>
              <ul>
                {rows.flatMap((row) =>
                  row.cells.map((cell) => (
                    <li key={cell.key}>
                      <button
                        type="button"
                        data-kind={cell.gap ? "gap" : cell.kind}
                        aria-current={cell.key === selected ? "true" : undefined}
                        onClick={() => pickCell(cell, true)}
                      >
                        <i className="rk-mark" role="img" aria-label={KIND_LABEL[cell.gap ? "gap" : cell.kind]} />
                        <span>{titleOf(cell)}</span>
                        {cell.scene && frames[frameKey(cell)]?.status === "failed" && <b className="rk-failed-tag">failed</b>}
                      </button>
                    </li>
                  )),
                )}
              </ul>
            </section>
          ))}
        </div>
        <div className="rk-foot">
          <p className="rk-count" data-ready={ready} data-total={total} data-failed={failed}>
            {total} frames · {ready} loaded
            {failed > 0 && (
              <>
                {" · "}
                <b>{failed} failed</b>
              </>
            )}
          </p>
          <ul className="rk-legend" aria-label="Kinds of state">
            {(["positive", "negative", "edge", "gap"] as const).map((k) => (
              <li key={k} data-kind={k}>
                <i className="rk-mark" aria-hidden />
                {KIND_LABEL[k]}
              </li>
            ))}
          </ul>
          <p>Drag or scroll to move. Pinch or ⌘-scroll to zoom. Double-click a frame to use it.</p>
          <p id="rk-keys">On the board, by keyboard: arrows go from frame to frame, Enter zooms to one, + − 0 1 zoom, Shift with an arrow moves the board.</p>
        </div>
      </aside>

      <header className="rk-bar">
        <button
          type="button"
          className="rk-side-toggle"
          aria-label="List of boards and frames"
          aria-expanded={sideOpen}
          aria-controls="rk-side"
          onClick={() => setSideOpen((open) => !open)}
        >
          List
        </button>
        {/* the way to the page this board is of, with the visitor's own draft
            (CanvasSwitch is the same switch, from the prototype's side) */}
        <div className="rk-seg" role="group" aria-label="Prototype or canvas">
          <a
            href={board.page.home}
            onClick={(e) => {
              // a better place on this device, when there is one: known only in the browser
              const to = boardHome(board);
              if (to === board.page.home) return;
              e.preventDefault();
              window.location.assign(to);
            }}
          >
            Prototype
          </a>
          <span aria-current="page">Canvas</span>
        </div>
        <div className="rk-title">
          <h1>{board.title}</h1>
          <code>{board.route}</code>
        </div>
        <div className="rk-seg" role="group" aria-label="Viewport">
          {(Object.keys(DEVICES) as Device[]).map((dv) => (
            <button key={dv} type="button" data-device={dv} aria-pressed={dv === device} onClick={() => switchDevice(dv)}>
              {DEVICES[dv].label}
            </button>
          ))}
        </div>
        <div className="rk-seg rk-zoom" role="group" aria-label="Zoom">
          <button type="button" data-zoom="out" aria-label="Zoom out" onClick={() => zoomBy(0.8)}>
            −
          </button>
          <output>{Math.round(zoom * 100)}%</output>
          <button type="button" data-zoom="in" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>
            +
          </button>
          <button type="button" data-zoom="width" title="Fit the board's width" onClick={fitWidth}>
            Fit
          </button>
          <button type="button" data-zoom="all" title="Fit the whole board" onClick={fit}>
            All
          </button>
        </div>
      </header>

      <div
        ref={viewport}
        className="rk-viewport"
        // one stop for Tab: the arrow keys go from frame to frame inside it
        tabIndex={0}
        role="group"
        aria-label={`${board.title}: the board`}
        aria-describedby="rk-keys"
        onKeyDown={onBoardKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={(e) => {
          const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
          const cell = cells.find((c) => c.key === under?.closest<HTMLElement>("[data-card]")?.dataset.card);
          if (cell?.scene) {
            setSelected(cell.key);
            setLaneSel(laneIdOf(cell.key));
            setInteracting(cell.key);
          }
        }}
      >
        <div ref={world} className="rk-world">
          {lanes.map(({ lane, rows }) => (
            <section key={lane.id} className="rk-lane" data-lane={lane.id} data-selected={laneSel === lane.id || undefined}>
              <header className="rk-lane-head">
                <div className="rk-label" data-lane-label={lane.id}>
                  <h2 className="rk-lane-name">
                    <code>{lane.ticket}</code>
                    {lane.title}
                  </h2>
                  {lane.story && <p className="rk-story rk-print">{lane.story}</p>}
                </div>
              </header>
              {rows.map((row, r) => (
                <div key={r} className="rk-row" data-kind={row.kind}>
                  <p className="rk-row-name">{KIND_LABEL[row.kind]}</p>
                  <div className="rk-cells">
                    {row.cells.map((cell) => {
                      const fk = frameKey(cell);
                      const state = frames[fk];
                      const view = viewOf(cell);
                      const screen = view === "screen";
                      // The frame itself starts a screen tall and takes the height its page
                      // reports, so the height is always measured, never assumed: a page
                      // grows to its whole length, a section is exactly as tall as it is.
                      // Until it has settled, its place is held at the height it had last time
                      const said = state?.height ?? 0;
                      const height = screen
                        ? dev.h
                        : view === "section"
                          ? Math.min(MAX_PAGE_HEIGHT, Math.max(MIN_SECTION_HEIGHT, said || dev.h))
                          : Math.min(MAX_PAGE_HEIGHT, Math.max(dev.h, said));
                      const settled = state?.status === "ready" || state?.status === "failed";
                      const remembered = known[`${cell.id}@${device}`];
                      const held =
                        screen || settled || !remembered
                          ? height
                          : Math.min(MAX_PAGE_HEIGHT, view === "section" ? remembered : Math.max(height, remembered));
                      const on = !!cell.scene && live.has(fk);
                      const kind = cell.gap ? "gap" : cell.kind;
                      const via = viaOf(cell);
                      return (
                        <article
                          key={cell.key}
                          className="rk-card"
                          data-card={cell.key}
                          data-title={titleOf(cell)}
                          data-kind={kind}
                          data-selected={cell.key === selected || undefined}
                          data-interacting={cell.key === interacting || undefined}
                          style={{ width: dev.w }}
                        >
                          <div className="rk-card-head">
                            <div className="rk-label">
                              {via && (
                                <p className="rk-via" title={via}>
                                  <span aria-hidden>{cell.fromKey ? "→ " : "↳ "}</span>
                                  {via}
                                </p>
                              )}
                              <h3 data-kind={kind} title={titleOf(cell)}>
                                <i className="rk-mark" role="img" aria-label={KIND_LABEL[kind]} />
                                <span>{titleOf(cell)}</span>
                              </h3>
                            </div>
                          </div>
                          {cell.gap ? (
                            <div className="rk-gap" data-view={cell.key}>
                              <p>Not built yet</p>
                            </div>
                          ) : (
                            <div className="rk-view" data-view={cell.key} style={{ height: held }}>
                              {on && (
                                <iframe
                                  key={fk}
                                  title={titleOf(cell)}
                                  src={srcOf(cell)}
                                  width={dev.w}
                                  height={height}
                                  // A frame is looked at until it's used. Until then the page in
                                  // it can't take the keys (a page that focuses a field as it
                                  // loads would take them from the canvas) and isn't read out
                                  inert={cell.key !== interacting}
                                  tabIndex={cell.key === interacting ? 0 : -1}
                                />
                              )}
                              {(on ? !settled : state?.status !== "failed") && (
                                <div className="rk-veil">{on ? "Loading…" : state?.up ? "Zoom in to load it again" : "Not loaded yet"}</div>
                              )}
                              {state?.status === "failed" && (
                                <div className="rk-failed">
                                  <strong>Scene failed</strong>
                                  {state.detail}
                                </div>
                              )}
                              <div className="rk-shield" />
                            </div>
                          )}
                          {noteOf(cell) && <p className="rk-note rk-print">{noteOf(cell)}</p>}
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

      {(current || currentLane) && (
        <aside className="rk-inspect" aria-label={current ? "The frame in hand" : "The lane in hand"}>
          <button type="button" className="rk-close" onClick={close}>
            Close
          </button>
          {current ? (
            <>
              <div className="rk-subject">
                <p data-kind={current.gap ? "gap" : current.kind}>
                  <i className="rk-mark" aria-hidden />
                  {KIND_LABEL[current.gap ? "gap" : current.kind]}
                  {currentLane && <code>{currentLane.lane.ticket}</code>}
                </p>
                <h2>{titleOf(current)}</h2>
              </div>
              {current.scene && currentLane && (
                <div className="rk-actions">
                  <button
                    type="button"
                    className="rk-primary"
                    data-copy="image"
                    title="This frame as a picture, with a line saying what it is"
                    disabled={frames[frameKey(current)]?.status !== "ready"}
                    onClick={() =>
                      void copyPng(
                        `image:${current.key}`,
                        frameImage(current, currentLane.lane),
                        `${fileName(`${currentLane.lane.ticket} ${current.id}`)}-${device}.png`,
                      )
                    }
                  >
                    {saying(`image:${current.key}`, "Copy image")}
                  </button>
                  <button type="button" data-copy="link" title="A link that opens this state" onClick={() => void copyLink(current)}>
                    {saying(`link:${current.key}`, "Copy link")}
                  </button>
                  <a href={`${current.scene.path}?scene=${encodeURIComponent(current.id)}`} target="_blank" rel="noreferrer">
                    Open in a tab
                  </a>
                  <button
                    type="button"
                    aria-pressed={interacting === current.key}
                    title="Click and type in the page inside the frame"
                    onClick={() => setInteracting(interacting === current.key ? null : current.key)}
                  >
                    {interacting === current.key ? "Done using it" : "Use the frame"}
                  </button>
                  <button type="button" onClick={() => reload(current)}>
                    Reload
                  </button>
                </div>
              )}
              {viaOf(current) && (
                <section>
                  <h3>Reached by</h3>
                  <p>{viaOf(current)}</p>
                </section>
              )}
              {noteOf(current) && (
                <section>
                  <h3>{current.gap ? "What the brief asks for" : "What it shows"}</h3>
                  <p>{noteOf(current)}</p>
                </section>
              )}
              {current.scene && (
                <section>
                  <h3>Frame</h3>
                  <p>
                    {VIEW_SAYS[viewOf(current)]}, {dev.label.toLowerCase()}.
                    {frames[frameKey(current)]?.status === "failed" && ` It failed: ${frames[frameKey(current)]?.detail}`}
                  </p>
                </section>
              )}
              {currentLane && (
                <div className="rk-actions">
                  <button type="button" onClick={() => pickLane(currentLane.lane.id)}>
                    Its lane: {currentLane.lane.ticket}
                  </button>
                </div>
              )}
            </>
          ) : (
            currentLane && (
              <>
                <div className="rk-subject">
                  <p>
                    <code>{currentLane.lane.ticket}</code>
                    {currentLane.rows.reduce((n, row) => n + row.cells.length, 0)} frames
                  </p>
                  <h2>{currentLane.lane.title}</h2>
                </div>
                <div className="rk-actions">
                  <button
                    type="button"
                    className="rk-primary"
                    data-copy="lane"
                    title="The whole lane as one picture, for its ticket"
                    onClick={() =>
                      void copyPng(
                        `lane:${currentLane.lane.id}`,
                        laneImage(currentLane),
                        `${fileName(`${currentLane.lane.ticket} ${currentLane.lane.title}`)}-${device}.png`,
                      )
                    }
                  >
                    {saying(`lane:${currentLane.lane.id}`, "Copy lane as a picture")}
                  </button>
                </div>
                {currentLane.lane.story && (
                  <section>
                    <h3>Story</h3>
                    <p>{currentLane.lane.story}</p>
                  </section>
                )}
                {currentLane.lane.differs && (
                  <section>
                    <h3>Differs from the brief</h3>
                    <ul>
                      {currentLane.lane.differs.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {currentLane.lane.confirm && (
                  <details>
                    <summary>
                      To confirm <span>· the prototype&rsquo;s review notes, as written</span>
                    </summary>
                    <ul>
                      {currentLane.lane.confirm.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            )
          )}
        </aside>
      )}
    </div>
  );
}
