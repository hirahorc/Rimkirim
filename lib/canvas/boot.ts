/**
 * Scene mode's first move, before any of the app's own code runs.
 *
 * A scene is one page in one state (`?scene=<id>`): what the canvas
 * (/canvas) shows in each of its frames. Dozens of them stand side by side
 * in one browser, and the app keeps its state in localStorage and
 * sessionStorage, which every frame of an origin shares. So a page opened as
 * a scene gets storage of its own: two in-memory stand-ins, filled with the
 * scene's seed, in place of the real ones. The stores hydrate from them as
 * they would from a real draft, and nothing a scene does ever reaches the
 * draft the developer is really filling in.
 *
 * It has to be an inline script (app/layout.tsx): the stores read their
 * storage as their modules load, so the stand-ins must be there first. The
 * seed comes from the canvas that frames the page (`__RK_SEEDS__` on its
 * window) or, for a scene opened in a tab of its own, from the real
 * localStorage, where SceneRunner leaves it before reloading once.
 *
 * It also holds timers back (`hold`): a moment that would pass (a toast, a
 * "Checking…") stays on the page when the timer that ends it never fires.
 *
 * Never in production (the layout leaves it out).
 */

/** where a scene's seed waits in the real localStorage, for a tab of its own */
export const SCENE_SEED_PREFIX = "rimkirim:scene:";

/** what a scene's storage starts with */
export interface SceneSeed {
  /** a hash of the rest: a stored seed that no longer matches is replaced */
  sig: string;
  local: Record<string, string>;
  session: Record<string, string>;
  /** timers longer than this (ms) never fire, from the page's first moment */
  hold?: number;
}

export interface SceneBoot {
  id: string;
  /** the seed the storage was filled with, if one was found */
  sig: string | null;
  from: "host" | "stored" | null;
  /** the browser's own storage, for leaving a seed where a reload finds it */
  real: { local: Storage; session: Storage };
  /** the browser's own timer: the driver's waits are never held back */
  setTimeout: typeof window.setTimeout;
  holdOver: number;
  /** how the scene went, for the canvas and for a script checking it */
  status?: "running" | "ready" | "failed";
  detail?: string;
}

declare global {
  interface Window {
    __RK_SCENE__?: SceneBoot;
    /** the canvas's seeds, by scene id, read by the frames it holds */
    __RK_SEEDS__?: Record<string, SceneSeed>;
  }
}

export const SCENE_BOOT_SCRIPT = `(function(){try{
var m=/[?&]scene=([^&#]+)/.exec(location.search);if(!m)return;
var id=decodeURIComponent(m[1]);
var real={local:window.localStorage,session:window.sessionStorage};
var seed=null,from=null;
try{if(window.parent!==window&&window.parent.__RK_SEEDS__&&window.parent.__RK_SEEDS__[id]){seed=window.parent.__RK_SEEDS__[id];from="host";}}catch(e){}
if(!seed){try{var raw=real.local.getItem(${JSON.stringify(SCENE_SEED_PREFIX)}+id);if(raw){seed=JSON.parse(raw);from="stored";}}catch(e){}}
function mem(init){var d={};for(var k in (init||{}))d[k]=String(init[k]);
return{getItem:function(k){return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null;},
setItem:function(k,v){d[k]=String(v);},removeItem:function(k){delete d[k];},clear:function(){d={};},
key:function(i){var ks=Object.keys(d);return i<ks.length?ks[i]:null;},
get length(){return Object.keys(d).length;}};}
Object.defineProperty(window,"localStorage",{configurable:true,value:mem(seed&&seed.local)});
Object.defineProperty(window,"sessionStorage",{configurable:true,value:mem(seed&&seed.session)});
var st=window.setTimeout;
var boot={id:id,sig:seed?seed.sig:null,from:from,real:real,setTimeout:function(){return st.apply(window,arguments);},holdOver:(seed&&seed.hold)||0,status:"running"};
window.setTimeout=function(fn,ms){if(boot.holdOver&&ms>boot.holdOver)return 0;return st.apply(window,arguments);};
window.__RK_SCENE__=boot;
}catch(e){}})();`;
