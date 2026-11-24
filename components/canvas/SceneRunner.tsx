"use client";

import * as React from "react";
import { SCENE_SEED_PREFIX } from "@/lib/canvas/boot";
import { find, pause, play } from "@/lib/canvas/driver";
import { findScene, sceneSeed } from "@/lib/canvas/registry";
import type { View } from "@/lib/canvas/types";

/** the seed this tab already reloaded for, so a seed that can't settle never loops */
const TRIED = "rimkirim:scene-tried:";

/** what a frame tells the canvas that holds it */
export interface SceneMessage {
  rk: "scene";
  /** which frame of the canvas, when it named itself (`?frame=`) */
  frame: string | null;
  id: string;
  status: "running" | "ready" | "failed";
  detail?: string;
  /** how tall its frame should be: the whole page, or the one section it's of */
  height: number;
}

/* harness chrome has no place in a frame: the dataset toggle, the
   environment marker, Next's own indicator */
const HIDE = `
html[data-scene] [aria-label="Break UI: order data"],
html[data-scene] [data-env-badge],
html[data-scene] nextjs-portal { display: none !important; }
`;

let started = false;
/** the frame's name on the canvas, read before the page can navigate away from its first URL */
let frame: string | null | undefined;
/** the section a `section` frame is of, once it's found */
let focus: HTMLElement | null = null;

/** what a header pinned to the top takes off the screen: a section is framed clear of it */
function headerRoom(): number {
  const header = document.querySelector<HTMLElement>("header");
  if (!header) return 0;
  const pinned = window.getComputedStyle(header).position;
  return pinned === "sticky" || pinned === "fixed" ? header.offsetHeight : 0;
}

/** bring the section to the top of the frame, under the header */
function frameSection() {
  if (!focus) return;
  const top = focus.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - headerRoom()), behavior: "instant" });
}

const frameHeight = () =>
  focus ? Math.ceil(focus.getBoundingClientRect().height) + headerRoom() : document.documentElement.scrollHeight;

function tell(status: SceneMessage["status"], detail?: string) {
  const boot = window.__RK_SCENE__;
  if (!boot) return;
  if (status === "failed" && boot.status !== "failed") console.error(`[scene ${boot.id}] ${detail}`);
  boot.status = status;
  boot.detail = detail;
  if (window.parent === window) return;
  const message: SceneMessage = { rk: "scene", frame: frame ?? null, id: boot.id, status, detail, height: frameHeight() };
  window.parent.postMessage(message, window.location.origin);
}

/* ----------------------------------------------------------------- capture */

/** the fonts the page uses, embedded once: every picture of this frame reuses them */
let fonts: string | undefined;

/**
 * The page as a picture, as its frame shows it. The page is redrawn from a
 * copy of its DOM (html-to-image), and a copy isn't a screen: it's drawn
 * from the document's top, as if it had never been scrolled, and nothing in
 * it sticks. A whole page is exactly that. A screen or a section isn't:
 * what's pinned to the screen stands where the screen is. So for those the
 * page is laid flat first. Its content is moved up by how far it's scrolled;
 * each sticky element (the header, the plan's bar on a phone, the service
 * beside the form) is made an ordinary one and moved to where it stood; the
 * picture is taken at the screen's size; and everything is put back.
 *
 * The copy carries each element's styles as they are at that moment, and
 * none of the page's stylesheets: with them, an entrance that's a keyframe
 * animation (a sheet coming up) would play again from its first frame, and
 * the picture would be of a sheet that hasn't arrived.
 */
async function capture(view: View, scale: number): Promise<Blob> {
  const { toBlob, getFontEmbedCSS } = await import("html-to-image");
  const root = document.documentElement;
  const body = document.body;
  const whole = view === "page";
  const width = window.innerWidth;
  const height = whole ? root.scrollHeight : window.innerHeight;
  const scrolled = window.scrollY;

  const undo: (() => void)[] = [];
  if (!whole) {
    const sticky = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((el) => window.getComputedStyle(el).position === "sticky")
      .map((el) => ({ el, was: el.getBoundingClientRect() }));
    if (scrolled > 0) {
      const { position, top } = body.style;
      // relative, not a transform: what's fixed to the screen must stay fixed to it
      body.style.position = "relative";
      body.style.top = `${-scrolled}px`;
      window.scrollTo({ top: 0, behavior: "instant" });
      undo.push(() => {
        body.style.position = position;
        body.style.top = top;
        window.scrollTo({ top: scrolled, behavior: "instant" });
      });
    }
    for (const { el, was } of sticky) {
      const { position, translate } = el.style;
      // in its place in the flow, as it will be in the copy, then moved to where it stood on the screen
      el.style.position = "relative";
      const now = el.getBoundingClientRect();
      el.style.translate = `${was.left - now.left}px ${was.top - now.top}px`;
      undo.push(() => {
        el.style.position = position;
        el.style.translate = translate;
      });
    }
  }

  try {
    fonts ??= await getFontEmbedCSS(root);
    const blob = await toBlob(root, {
      width,
      height,
      pixelRatio: scale,
      fontEmbedCSS: fonts,
      // no stylesheets (see above), nothing of the harness, nothing that can't be drawn
      filter: (node) =>
        !(node instanceof Element && node.matches("head, style, link, script, noscript, nextjs-portal, [aria-label='Scene']")),
    });
    if (!blob) throw new Error("the page couldn't be drawn");
    return blob;
  } finally {
    for (const put of undo.reverse()) put();
  }
}

/**
 * The scene's second move, once the page is up (the first is the boot
 * script, lib/canvas/boot.ts): it checks the page was seeded with what the
 * code builds now, plays the scene's steps, and tells the canvas how it
 * went and how tall its frame should be. It also gives the canvas a way to
 * ask for the page as a picture. Mounted by the root layout wherever the
 * canvas ships; on a page that isn't a scene it does nothing.
 */
export function SceneRunner() {
  // Less motion, when the visitor asks for it. The pages do that themselves,
  // except where a scene holds a moment that would have passed: its spinner
  // would turn for as long as the board is open. So in a scene, then, an
  // animation runs once and is over; its end state is what the frame shows
  React.useEffect(() => {
    if (!window.__RK_SCENE__) return;
    const still = document.createElement("style");
    still.textContent =
      "@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important;scroll-behavior:auto!important}}";
    document.head.appendChild(still);
    return () => still.remove();
  }, []);

  // the frame's height, each time the page changes size: a fold opening, a list growing
  React.useEffect(() => {
    const boot = window.__RK_SCENE__;
    if (!boot) return;
    const sized = new ResizeObserver(() => {
      frameSection();
      tell(boot.status ?? "running", boot.detail);
    });
    sized.observe(document.documentElement);
    sized.observe(document.body);
    return () => sized.disconnect();
  }, []);

  React.useEffect(() => {
    const boot = window.__RK_SCENE__;
    // an effect run twice (Strict Mode) must not play the steps twice
    if (!boot || started) return;
    started = true;
    frame = new URLSearchParams(window.location.search).get("frame");

    const scene = findScene(boot.id);
    if (!scene) {
      tell("failed", `no scene is called "${boot.id}"`);
      return;
    }

    // A tab of its own has no canvas to hand it a seed: it's left in the real
    // localStorage and the page loads once more, onto it. The same when the
    // stored one is from older code
    const want = sceneSeed(scene);
    if (boot.sig !== want.sig && boot.from !== "host") {
      try {
        if (boot.real.session.getItem(TRIED + boot.id) !== want.sig) {
          boot.real.local.setItem(SCENE_SEED_PREFIX + boot.id, JSON.stringify(want));
          boot.real.session.setItem(TRIED + boot.id, want.sig);
          window.location.reload();
          return;
        }
      } catch {
        /* no storage to leave it in: the scene plays on what it has */
      }
    }

    document.documentElement.dataset.scene = boot.id;
    const style = document.createElement("style");
    style.textContent = HIDE;
    document.head.appendChild(style);
    boot.capture = capture;

    tell("running");
    void (async () => {
      // the page's own first moves: its stores are in, its effects have run
      await pause(400);
      try {
        await play(scene.steps ?? []);
        if (scene.view === "section" && scene.focus) {
          focus = await find(scene.focus);
          frameSection();
          // the frame takes the section's height, then the section plays its reveal
          tell("running");
          await pause(1600);
          frameSection();
        }
        // what the last step set off has landed (a fold, a dialog, a toast)
        await pause(500);
        tell("ready");
      } catch (e) {
        tell("failed", e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  return null;
}
