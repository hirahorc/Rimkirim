import type { SceneSeed } from "./boot";
import { EXPAT_BOARDS, EXPAT_SCENES } from "./expat/scenes";
import { isGap, type Board, type Scene } from "./types";

/**
 * Every board and scene the canvas knows. A flow adds its own file beside
 * lib/canvas/expat and joins the two lists here; nothing else changes.
 */
export const BOARDS: Board[] = [...EXPAT_BOARDS];
const SCENES: Scene[] = [...EXPAT_SCENES];

const BY_ID = new Map(SCENES.map((s) => [s.id, s]));

export const findScene = (id: string): Scene | undefined => BY_ID.get(id);
export const findBoard = (id: string): Board | undefined => BOARDS.find((b) => b.id === id);

/** the board of the page a visitor is on, if it has one */
export const boardForPath = (pathname: string): Board | undefined => BOARDS.find((b) => b.page.is(pathname));

/** the board a scene stands on: its own page's, before a digest that borrows it */
export function boardOfScene(id: string): Board | undefined {
  const has = (b: Board) => b.lanes.some((l) => l.rows.some((r) => r.cells.some((c) => !isGap(c) && c === id)));
  return BOARDS.find((b) => !b.digest && has(b)) ?? BOARDS.find(has);
}

/** where "Prototype" goes from a board, on this device (the browser only) */
export const boardHome = (b: Board): string => b.page.resume?.() ?? b.page.home;

/** the scenes a board frames, each once */
export function boardScenes(board: Board): Scene[] {
  const ids = new Set<string>();
  for (const lane of board.lanes) for (const row of lane.rows) for (const c of row.cells) if (!isGap(c)) ids.add(c);
  return [...ids].map((id) => BY_ID.get(id)).filter((s): s is Scene => !!s);
}

/** how many states a board holds, and how many of them the prototype doesn't have yet */
export function boardCount(board: Board) {
  let scenes = 0;
  let gaps = 0;
  for (const lane of board.lanes)
    for (const row of lane.rows)
      for (const c of row.cells) {
        if (isGap(c)) gaps += 1;
        else scenes += 1;
      }
  return { scenes, gaps, lanes: board.lanes.length };
}

/** a short, stable hash: enough to tell a stored seed from the one the code builds now */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** a scene's seed with its signature, as the boot script reads it */
export function sceneSeed(scene: Scene): SceneSeed {
  const body = scene.seed();
  return { sig: hash(JSON.stringify(body)), ...body };
}

/** ids a board names that no scene answers to: a typo would otherwise be an empty frame */
export function unknownScenes(): string[] {
  const missing: string[] = [];
  for (const b of BOARDS)
    for (const lane of b.lanes)
      for (const row of lane.rows)
        for (const c of row.cells) {
          if (!isGap(c) && !BY_ID.has(c)) missing.push(`${b.id}/${lane.id}: ${c}`);
          const from = isGap(c) ? c.from : BY_ID.get(c)?.from;
          if (from && !BY_ID.has(from)) missing.push(`${b.id}/${lane.id}: from ${from}`);
        }
  return missing;
}
