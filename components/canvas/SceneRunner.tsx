"use client";

import * as React from "react";
import { SCENE_SEED_PREFIX } from "@/lib/canvas/boot";
import { pause, play } from "@/lib/canvas/driver";
import { findScene, sceneSeed } from "@/lib/canvas/registry";

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
  /** the page's whole height, for a frame that grows to it */
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

function tell(status: SceneMessage["status"], detail?: string) {
  const boot = window.__RK_SCENE__;
  if (!boot) return;
  if (status === "failed" && boot.status !== "failed") console.error(`[scene ${boot.id}] ${detail}`);
  boot.status = status;
  boot.detail = detail;
  if (window.parent === window) return;
  const message: SceneMessage = {
    rk: "scene",
    frame: frame ?? null,
    id: boot.id,
    status,
    detail,
    height: document.documentElement.scrollHeight,
  };
  window.parent.postMessage(message, window.location.origin);
}

/**
 * The scene's second move, once the page is up (the first is the boot
 * script, lib/canvas/boot.ts): it checks the page was seeded with what the
 * code builds now, plays the scene's steps, and tells the canvas how it
 * went and how tall the page is. Mounted by the root layout outside
 * production; on a page that isn't a scene it does nothing.
 */
export function SceneRunner() {
  // the page's height, each time it changes: a fold opening, a list growing
  React.useEffect(() => {
    const boot = window.__RK_SCENE__;
    if (!boot) return;
    const sized = new ResizeObserver(() => tell(boot.status ?? "running", boot.detail));
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

    tell("running");
    void (async () => {
      // the page's own first moves: its stores are in, its effects have run
      await pause(400);
      try {
        await play(scene.steps ?? []);
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
