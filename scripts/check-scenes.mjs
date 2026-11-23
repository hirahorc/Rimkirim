#!/usr/bin/env node
/**
 * Opens every board of the canvas (/canvas) in a headless Chrome, at both
 * viewports, and fails if any scene does: a step that can't be played any
 * more (a label was reworded, a control moved), or a page that never came
 * up. Run it after a change to the flows the canvas frames.
 *
 *   npm run dev            # or a staging build: the canvas isn't in production
 *   npm run check:scenes
 *
 * BASE_URL (default http://localhost:3000) is where the app runs;
 * CHROME_PATH is the browser to drive, when it isn't Chrome on a Mac.
 * No dependencies: it speaks the DevTools protocol over Node's own WebSocket.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9400 + Math.floor(Math.random() * 500);
/** how long one board may take to bring every frame up */
const BOARD_MS = 240_000;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const profile = mkdtempSync(join(tmpdir(), "rk-scenes-"));
const chrome = spawn(
  CHROME,
  [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--headless=new", "--no-first-run", "--disable-gpu", "about:blank"],
  { stdio: "ignore" },
);
const quit = (code) => {
  chrome.kill();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* the profile is in the temp folder either way */
  }
  process.exit(code);
};
chrome.on("error", () => {
  console.error(`Couldn't start Chrome at ${CHROME}. Set CHROME_PATH to a Chrome or Chromium binary.`);
  process.exit(2);
});

async function connect() {
  for (let i = 0; i < 80; i++) {
    try {
      const pages = await (await fetch(`http://localhost:${PORT}/json`)).json();
      const page = pages.find((p) => p.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("Chrome didn't open its debugging port");
}

const ws = new WebSocket(await connect());
await new Promise((ok, no) => {
  ws.onopen = ok;
  ws.onerror = no;
});
let seq = 0;
const waiting = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  const w = d.id && waiting.get(d.id);
  if (!w) return;
  waiting.delete(d.id);
  if (d.error) w.no(new Error(d.error.message));
  else w.ok(d.result);
};
const send = (method, params = {}) =>
  new Promise((ok, no) => {
    const id = ++seq;
    waiting.set(id, { ok, no });
    ws.send(JSON.stringify({ id, method, params }));
  });
const run = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};
const press = (selector) => run(`document.querySelector(${JSON.stringify(selector)})?.click()`);
/** the whole board on screen: a frame only loads once it has been */
const ALL = '.rk-zoom button[data-zoom="all"]';

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1680, height: 1000, deviceScaleFactor: 1, mobile: false });

try {
  await send("Page.navigate", { url: `${BASE}/canvas` });
  let boards = [];
  for (let i = 0; i < 60 && !boards.length; i++) {
    await sleep(500);
    boards = await run(`[...document.querySelectorAll('.rk-index a[href^="/canvas/"]')].map((a) => a.getAttribute("href"))`).catch(() => []);
  }
  if (!boards.length) {
    console.error(`No canvas at ${BASE}/canvas. Is the app running, and not as production?`);
    quit(2);
  }

  let bad = 0;
  for (const href of boards) {
    for (const device of ["Desktop", "Mobile"]) {
      await send("Page.navigate", { url: `${BASE}${href}` });
      for (let i = 0; i < 60; i++) {
        await sleep(500);
        if (await run(`!!document.querySelector(".rk-count")`).catch(() => false)) break;
      }
      await sleep(1500);
      if (device === "Mobile") {
        await press('.rk-seg button[data-device="mobile"]');
        await sleep(1500);
      }
      await press(ALL);

      const until = Date.now() + BOARD_MS;
      let state = { total: 0, ready: 0, failed: [] };
      for (;;) {
        await sleep(1500);
        // keep the board whole as its frames grow
        await press(ALL);
        state = await run(`(() => {
          const count = document.querySelector(".rk-count")?.dataset ?? {};
          const failed = [...document.querySelectorAll(".rk-failed")].map((f) =>
            f.closest("[data-card]").dataset.title + ": " + f.textContent.replace("Scene failed", "").trim());
          return { ready: Number(count.ready ?? 0), total: Number(count.total ?? 0), failed };
        })()`);
        if (state.total && state.ready + state.failed.length >= state.total) break;
        if (Date.now() > until) {
          state.failed.push(`${state.total - state.ready - state.failed.length} frame(s) never came up`);
          break;
        }
      }
      const name = `${href.replace("/canvas/", "")} · ${device.toLowerCase()}`;
      console.log(`${state.failed.length ? "✗" : "✓"} ${name}: ${state.ready}/${state.total} ready`);
      for (const f of state.failed) console.log(`    ${f}`);
      bad += state.failed.length;
    }
  }
  console.log(bad ? `\n${bad} scene(s) failed.` : "\nEvery scene came up.");
  quit(bad ? 1 : 0);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  quit(2);
}
