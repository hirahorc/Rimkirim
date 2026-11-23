"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { boardForPath, boardHome, boardOfScene, findScene } from "@/lib/canvas/registry";
import { APP_ENV } from "@/lib/env";

/**
 * The way between the prototype and the canvas, from the prototype's side
 * (the canvas has its own, in its bar):
 *
 * - on a page that has a board, a small switch, "Prototype | Canvas": Canvas
 *   opens that page's board;
 * - on a page opened as a scene in a tab of its own, a line that says so
 *   (what's on screen is a seeded state, not the visitor's draft), with the
 *   way back to its frame and the way out to the real page.
 *
 * Nothing inside a frame of the canvas, and nothing on a page without a
 * board. Harness chrome, plain on purpose and in its own styles, like the
 * dataset toggle; the root layout mounts it outside production only.
 */

const never = () => () => {};
/** "" on a page that isn't a scene; else whether it's in a frame, then the scene's id */
const readScene = () => {
  const boot = window.__RK_SCENE__;
  return boot ? `${window.parent === window ? "tab" : "frame"}:${boot.id}` : "";
};

const BAR: React.CSSProperties = {
  position: "fixed",
  left: 16,
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  gap: 2,
  maxWidth: "calc(100vw - 32px)",
  padding: 3,
  borderRadius: 9,
  background: "#e4e4e4",
  boxShadow: "0 2px 10px rgba(0,0,0,.18)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 12,
  lineHeight: 1.2,
  color: "#111",
};
const segment = (on: boolean): React.CSSProperties => ({
  borderRadius: 6,
  padding: "5px 9px",
  whiteSpace: "nowrap",
  textDecoration: "none",
  color: on ? "#111" : "#555",
  background: on ? "#fff" : "transparent",
  boxShadow: on ? "0 1px 2px rgba(0,0,0,.18)" : "none",
  fontWeight: on ? 600 : 400,
});

export function CanvasSwitch() {
  const pathname = usePathname();
  // known in the browser only: nothing is drawn on the server or before the page is up
  const scene = React.useSyncExternalStore(never, readScene, () => null);

  if (scene === null || pathname.startsWith("/canvas")) return null;
  // a frame of the canvas shows the page, nothing of the harness
  if (scene.startsWith("frame:")) return null;

  // Clear of what's already at the foot of the screen. On a page: the
  // environment marker, and on the plan below lg its bar and, in development,
  // the dataset toggle over it. A scene has neither marker nor toggle
  const onPlan = pathname === "/expat-relocation/plan";
  const place = scene
    ? onPlan
      ? "bottom-4 max-lg:bottom-[148px]"
      : "bottom-4"
    : onPlan
      ? APP_ENV === "development"
        ? "bottom-[52px] max-lg:bottom-[196px]"
        : "bottom-[52px] max-lg:bottom-[148px]"
      : "bottom-[52px]";

  if (scene) {
    const id = scene.slice("tab:".length);
    const board = boardOfScene(id);
    return (
      <div role="group" aria-label="Scene" className={place} style={BAR}>
        <span style={{ ...segment(false), overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
          Scene: <strong style={{ color: "#111" }}>{findScene(id)?.title ?? id}</strong>
        </span>
        {/* plain links, so each is a page load: a scene's storage ends with its page */}
        <a href={board ? `/canvas/${board.id}#${encodeURIComponent(id)}` : "/canvas"} style={segment(true)}>
          Back to canvas
        </a>
        {board && (
          <a href={boardHome(board)} style={segment(false)}>
            Leave scene
          </a>
        )}
      </div>
    );
  }

  const board = boardForPath(pathname);
  if (!board) return null;
  return (
    <div role="group" aria-label="Prototype or canvas" className={place} style={BAR}>
      <span aria-current="page" style={segment(true)}>
        Prototype
      </span>
      <a href={`/canvas/${board.id}`} style={segment(false)}>
        Canvas
      </a>
    </div>
  );
}
