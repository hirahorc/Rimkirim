import type { Step, Target } from "./types";

/**
 * Plays a scene's steps on the page it's on: the few presses and keystrokes
 * that put a screen in a state no stored draft can (what a form says once
 * its action was pressed, a dialog that's open, a field that was left).
 * Everything is found as a person finds it (Target) and waited for, so a
 * step that can't be played fails by name instead of leaving a frame that
 * quietly shows the wrong state.
 */

const FIND_MS = 6000;
const TICK_MS = 80;
/** what a sticky header takes off the top of the screen */
const HEADER_ROOM = 72;

/** the browser's own timer: scene mode holds long timers back, never these */
const later = (fn: () => void, ms: number) => {
  const own = window.__RK_SCENE__?.setTimeout ?? window.setTimeout.bind(window);
  own(fn, ms);
};
export const pause = (ms: number) => new Promise<void>((done) => later(done, ms));

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
const same = (have: string, want: string, contains?: boolean) =>
  contains ? norm(have).toLowerCase().includes(norm(want).toLowerCase()) : norm(have) === norm(want);

function onScreen(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.getClientRects().length === 0) return false;
  // an [inert] or hidden ancestor takes it out of reach, as it does for a person
  return !el.closest("[inert], [aria-hidden='true'], [hidden]");
}

const IMPLICIT: Record<string, string> = {
  button: "button, [role='button']",
  link: "a[href], [role='link']",
  textbox: "input:not([type]), input[type='text'], input[type='email'], input[type='tel'], textarea, [role='textbox']",
};

function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label;
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    const said = by
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? "")
      .join(" ");
    if (norm(said)) return said;
  }
  return el.textContent ?? "";
}

function candidates(t: Target): Element[] {
  const root: ParentNode = t.within ? (document.querySelector(t.within) ?? document) : document;
  if (t.css) return [...root.querySelectorAll(t.css)];
  if (t.label !== undefined) {
    return [...root.querySelectorAll("label")]
      .filter((l) => same(l.textContent ?? "", t.label!, t.contains))
      .map((l) => {
        const el = l.htmlFor ? document.getElementById(l.htmlFor) : l.querySelector("input, textarea, button");
        if (!el) return null;
        // a label can point at a field's wrapper: the control is inside it
        return el.matches("input, textarea, button, select") ? el : (el.querySelector("input, textarea, button") ?? el);
      })
      .filter((el): el is HTMLElement => !!el);
  }
  if (t.placeholder !== undefined) {
    return [...root.querySelectorAll("input, textarea")].filter((el) =>
      same(el.getAttribute("placeholder") ?? "", t.placeholder!, t.contains),
    );
  }
  if (t.role) {
    const pool = [...root.querySelectorAll(IMPLICIT[t.role] ?? `[role='${t.role}']`)];
    return t.name === undefined ? pool : pool.filter((el) => same(nameOf(el), t.name!, t.contains));
  }
  if (t.text !== undefined) {
    return [...root.querySelectorAll("button, a, [role='button'], [role='option'], [role='radio'], [role='checkbox'], summary")].filter(
      (el) => same(el.textContent ?? "", t.text!, t.contains),
    );
  }
  return [];
}

const say = (t: Target) =>
  Object.entries(t)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ");

async function find(t: Target): Promise<HTMLElement> {
  const until = Date.now() + FIND_MS;
  for (;;) {
    const hit = candidates(t).filter(onScreen)[t.nth ?? 0];
    if (hit) return hit as HTMLElement;
    if (Date.now() > until) throw new Error(`nothing on screen matches { ${say(t)} }`);
    await pause(TICK_MS);
  }
}

function press(el: HTMLElement) {
  el.scrollIntoView({ block: "center", behavior: "instant" });
  const at = el.getBoundingClientRect();
  const point = { bubbles: true, cancelable: true, composed: true, clientX: at.left + at.width / 2, clientY: at.top + at.height / 2, button: 0 };
  // the whole of a press: some controls open on the way down, most on the click
  el.dispatchEvent(new PointerEvent("pointerdown", { ...point, pointerId: 1, pointerType: "mouse", isPrimary: true }));
  el.dispatchEvent(new MouseEvent("mousedown", point));
  el.dispatchEvent(new PointerEvent("pointerup", { ...point, pointerId: 1, pointerType: "mouse", isPrimary: true }));
  el.dispatchEvent(new MouseEvent("mouseup", point));
  el.click();
}

function type(el: HTMLElement, text: string) {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    throw new Error("a fill step needs a field to type into");
  }
  el.scrollIntoView({ block: "center", behavior: "instant" });
  el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  // the field's own setter, then the event React listens for: a keystroke, as far as the form can tell
  const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, text);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** plays the steps in order; throws at the first that can't be played, naming it */
export async function play(steps: Step[]): Promise<void> {
  for (const [i, step] of steps.entries()) {
    try {
      switch (step.do) {
        case "click":
          press(await find(step.on));
          break;
        case "fill":
          type(await find(step.on), step.text);
          break;
        case "leave":
          // a frame isn't the focused window, so real focus never leaves: the event is sent
          (await find(step.on)).dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
          break;
        case "see":
          await find(step.on);
          break;
        case "show":
          (await find(step.on)).scrollIntoView({ block: "center", behavior: "instant" });
          break;
        case "to": {
          const at = (await find(step.on)).getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, at - HEADER_ROOM), behavior: "instant" });
          break;
        }
        case "top":
          window.scrollTo({ top: 0, behavior: "instant" });
          break;
        case "hold":
          if (window.__RK_SCENE__) window.__RK_SCENE__.holdOver = step.over;
          break;
        case "wait":
          await pause(step.ms);
          break;
      }
    } catch (e) {
      throw new Error(`step ${i + 1} (${step.do}): ${e instanceof Error ? e.message : String(e)}`);
    }
    // the page's answer to the step: a render, then what it fades or folds in
    await pause(step.do === "wait" || step.do === "hold" ? 0 : 140);
  }
}
