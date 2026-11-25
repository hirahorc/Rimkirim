/**
 * The prototype's states for kanvas (../kanvas): every state of the Expat
 * Relocation flow, frozen into static frames on a board at /canvas.
 *
 * The scenes stay where they are, in lib/canvas (their seeds, their steps,
 * their lanes, the brief's tickets): the same scenes open the flow in a
 * state by themselves (`?scene=<id>`, lib/canvas/boot.ts), which is what the
 * board's "Open live" links to. This file only says them the way kanvas reads
 * them. It has no import from kanvas, so it builds wherever the app does.
 *
 *   npm run kanvas -- snap && npm run kanvas -- log && npm run kanvas -- build
 */
import { BOARDS, findScene } from "@/lib/canvas/registry";
import { DEVICES, isGap, type Step as RStep, type Target as RTarget } from "@/lib/canvas/types";

/* the shapes kanvas reads (kanvas/src/config.ts), said here so nothing is imported from it */
type Target = { role?: string; name?: string; label?: string; text?: string; placeholder?: string; css?: string; within?: string; nth?: number; contains?: boolean };
type Step =
  | { click: Target }
  | { fill: Target; text: string }
  | { leave: Target }
  | { see: Target }
  | { show: Target }
  | { top: true }
  | { wait: number }
  | { hold: number };
type Seed = { localStorage?: Record<string, string>; sessionStorage?: Record<string, string> };
type Scene = {
  id: string;
  title: string;
  path: string;
  via?: string;
  from?: string | null;
  note?: string;
  seed: () => Seed;
  steps: Step[];
  view: "page" | "screen" | { section: Target };
  hold?: number;
};
type Gap = { id: string; title: string; gap: true; note?: string; via?: string; from?: string | null };

const target = (t: RTarget): Target => ({
  role: t.role,
  name: t.name,
  label: t.label,
  text: t.text,
  placeholder: t.placeholder,
  css: t.css,
  within: t.within,
  nth: t.nth,
  contains: t.contains,
});

function step(s: RStep): Step {
  switch (s.do) {
    case "click":
      return { click: target(s.on) };
    case "fill":
      return { fill: target(s.on), text: s.text };
    case "leave":
      return { leave: target(s.on) };
    case "see":
      return { see: target(s.on) };
    case "show":
      return { show: target(s.on) };
    case "wait":
      return { wait: s.ms };
    case "hold":
      return { hold: s.over };
    case "top":
      return { top: true };
  }
}

/** a scene of lib/canvas as kanvas reads it, made once however many boards it's on */
const made = new Map<string, Scene>();
function scene(id: string): Scene {
  const known = made.get(id);
  if (known) return known;
  const s = findScene(id);
  if (!s) throw new Error(`a board names "${id}", which no scene answers to`);
  const k: Scene = {
    id,
    title: s.title,
    path: s.path,
    via: s.via,
    from: s.from,
    note: s.note,
    hold: s.seed().hold,
    seed: () => {
      const { local, session } = s.seed();
      return { localStorage: local, sessionStorage: session };
    },
    steps: (s.steps ?? []).map(step),
    view: s.view === "section" && s.focus ? { section: target(s.focus) } : s.view === "screen" ? "screen" : "page",
  };
  made.set(id, k);
  return k;
}

/** a board's route as a link to its page, when it is one ("/simulator · tab …" is /simulator; "[number]" and a flow's name aren't) */
const pathOf = (route: string) => {
  const first = route.split(" ")[0] ?? "";
  return first.startsWith("/") && !first.includes("[") ? first : undefined;
};

const boards = BOARDS.map((b) => ({
  id: b.id,
  title: b.title,
  path: pathOf(b.route),
  lead: b.lead,
  lanes: b.lanes.map((l) => ({
    id: l.id,
    title: l.title,
    ticket: l.ticket,
    story: l.story,
    lists: [
      ...(l.differs?.length ? [{ title: "Departs from the brief", items: l.differs }] : []),
      ...(l.confirm?.length ? [{ title: "To confirm", items: l.confirm }] : []),
    ],
    rows: l.rows.map((r) => ({
      kind: r.kind,
      scenes: r.cells.map((c): Scene | Gap => (isGap(c) ? { id: c.id, title: c.title, gap: true, note: c.note, via: c.via, from: c.from } : scene(c))),
    })),
  })),
}));

const config = {
  baseUrl: "http://localhost:3000",
  // the board's "now": every date on it is worked out from here, so frames don't change with the day.
  // Moved on purpose, it changes every frame with a date, as one entry on each board
  clock: "2026-11-25T10:00:00+07:00",
  timezone: "Asia/Jakarta",
  locale: "en-US",
  devices: Object.entries(DEVICES).map(([id, d]) => ({ id, label: d.label, width: d.w, height: d.h, mobile: id === "mobile" })),
  // the prototype's own dev chrome, never part of a state
  hide: ["nextjs-portal", "[data-env-badge]", '[aria-label="Break UI: order data"]', '[aria-label="Prototype or canvas"]', '[aria-label="Scene"]'],
  // served by the app itself, at /canvas: its pages are on the same site, and it opens a scene by itself
  out: "public/canvas",
  live: { query: "scene" },
  boards,
};

export default config;
