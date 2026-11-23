import type { SceneSeed } from "./boot";

/** the two viewports every story is designed for (the brief: "Mobile and desktop") */
export type Device = "desktop" | "mobile";
export const DEVICES: Record<Device, { w: number; h: number; label: string }> = {
  desktop: { w: 1440, h: 900, label: "Desktop 1440" },
  mobile: { w: 390, h: 844, label: "Mobile 390" },
};

/**
 * What a step acts on, found the way a person finds it: by its label, its
 * role and name, or the words on it. Matches are exact unless `contains`;
 * only what's on screen counts, so the copy of a button a breakpoint hides
 * is never the one pressed.
 */
export interface Target {
  /** a field, by its label's words */
  label?: string;
  /** an ARIA role (a `<button>` is a button), with `name` */
  role?: string;
  /** the accessible name: aria-label, else the words on it */
  name?: string;
  /** anything pressable, by the words on it */
  text?: string;
  placeholder?: string;
  css?: string;
  /** look inside this element only (a CSS selector) */
  within?: string;
  /** which match, from 0 */
  nth?: number;
  contains?: boolean;
}

export type Step =
  | { do: "click"; on: Target }
  /** type into a field, as a keyboard would (the field hears each change) */
  | { do: "fill"; on: Target; text: string }
  /** move focus out of a field, so what it says on being left shows */
  | { do: "leave"; on: Target }
  /** wait for something to be on the page */
  | { do: "see"; on: Target }
  | { do: "wait"; ms: number }
  /** from here on, timers longer than `over` ms never fire: what they would end stays */
  | { do: "hold"; over: number }
  /** bring something to the middle of the screen (a `screen` frame shows what's there) */
  | { do: "show"; on: Target }
  /** bring something to the top of the screen, clear of a sticky header: a section of a long page */
  | { do: "to"; on: Target }
  | { do: "top" };

export type SceneKind = "positive" | "negative" | "edge";

/** one page in one state */
export interface Scene {
  id: string;
  /** the frame's name on the canvas */
  title: string;
  /** what the frame shows, under it */
  note?: string;
  /** the action that leads here: the words on its arrow */
  via?: string;
  /** the scene it follows; without one, the scene before it in its row; null when it stands alone */
  from?: string | null;
  /** the route it opens on */
  path: string;
  /** what its storage starts with (built when asked: dates follow today) */
  seed: () => Omit<SceneSeed, "sig">;
  steps?: Step[];
  /**
   * `page`: the frame grows to the whole page, as a design frame does.
   * `screen`: the frame is the device's screen, for what's pinned to it (a
   * dialog, a sheet, a toast).
   */
  view?: "page" | "screen";
}

/** a state the brief asks for that the prototype doesn't have: a placeholder, never a page */
export interface Gap {
  gap: true;
  id: string;
  title: string;
  note: string;
  via?: string;
  from?: string | null;
}

export interface Row {
  kind: SceneKind;
  /** scene ids, and gaps where they belong in the sequence */
  cells: (string | Gap)[];
}

/** one story: a ticket of the brief, with the states that answer it */
export interface Lane {
  id: string;
  /** e.g. "RPW-290" */
  ticket: string;
  title: string;
  /** the story, as the brief tells it */
  story?: string;
  /** where the prototype departs from the brief, each said in a line */
  differs?: string[];
  rows: Row[];
}

export interface Board {
  id: string;
  title: string;
  /** the route the board's page lives on, as a reader knows it */
  route: string;
  lead: string;
  /**
   * The page the board is of, for the switch between the two. `is` says
   * which routes are it: a prototype page there offers its board. `home` is
   * where "Prototype" goes from the board, the page with the visitor's own
   * draft; `resume`, read in the browser, is a better place on this device
   * when there is one (the last booking made here, say).
   */
  page: {
    is: (pathname: string) => boolean;
    home: string;
    resume?: () => string | null;
  };
  /** a board made of other boards' frames (the overview): never the board a scene is "from" */
  digest?: boolean;
  lanes: Lane[];
}

export const isGap = (c: string | Gap): c is Gap => typeof c !== "string";
