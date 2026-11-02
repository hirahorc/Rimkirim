"use client";

import * as React from "react";
import {
  ArrowRight,
  BedDouble,
  BookOpen,
  Check,
  CheckCheck,
  ChevronLeft,
  CookingPot,
  Lamp,
  PhoneCall,
  Puzzle,
  Shirt,
  Video,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatNumber } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { IPhone } from "./IPhone";
import { at, Bubble, ChatHead, SceneFlag, SceneTitle } from "./SceneParts";

/**
 * The section illustrations of the expat page, each the product moment its
 * section describes, built once on a SceneStage: the calculator weighing two
 * pieces (pricing), the commercial invoice and packing list for one box
 * (what you can ship), the team on WhatsApp telling you what to have ready
 * (who does what), and the three screens behind "Get a quote" (the closing
 * ticket).
 *
 * Framed as the journey's scenes are (the stageshow rules): one hero
 * surface, inset a gutter from the top and sides and running off the
 * bottom, so only filler is cropped, and at most one satellite. Every size
 * is in em, a share of the stage's width; each scene names its compact
 * container query, where the gutter tightens and the type stays at 10px or
 * more. A piece that moves carries a `jr-*` class naming its entrance and
 * `at(ms)`, when it starts once the scene builds.
 */

function useScene(group: string) {
  const { t, locale } = useLanguage();
  return { k: (key: string) => t(`expat.scenes.${group}.${key}`), locale };
}

/* ------------------------------------------------------------------ */
/*  Pricing: how size turns into weight                                */
/* ------------------------------------------------------------------ */

const PIECES = [
  { key: "box", kg: 12, dims: [60, 40, 40] },
  { key: "suitcase", kg: 24, dims: [75, 50, 30] },
] as const;

/** the size weight, length × width × height ÷ 5000, as the calculator works it */
const sizeKg = ([l, w, h]: readonly number[]) => (l * w * h) / 5000;

/** one cell of a piece's readout, the calculator's own three: real, by size, charged */
function Readout({
  label,
  value,
  ms,
  win,
  strong,
}: {
  label: string;
  value: string;
  ms: number;
  /** of real and by size, the one that counts; the other is set faint */
  win?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 px-[0.7em] py-[0.5em]">
      <span className="block truncate text-[0.66em] font-medium uppercase tracking-[0.05em] text-muted-2">{label}</span>
      <span
        className={cn(
          "jr jr-rise mt-[0.2em] block whitespace-nowrap text-[0.84em] tabular-nums",
          win === true && "font-medium text-tone-ink",
          win === false && "text-muted-2",
          strong && "font-semibold",
        )}
        style={at(ms)}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * The calculator's package rows, two pieces filled in: a box light for its
 * size, charged by size, and a suitcase heavy for its size, charged by its
 * real weight; then the charged weight the price is worked from, the one
 * big number. The rule, shown in the tool the visitor is about to use.
 */
export function SizeScene() {
  const { k, locale } = useScene("size");
  const kg = (n: number) => `${formatNumber(n, 1, locale)} kg`;
  const total = PIECES.reduce((s, p) => s + Math.max(p.kg, sizeKg(p.dims)), 0);
  return (
    <div
      className="jr jr-arrive absolute inset-x-[2.6em] top-[2.6em] h-[40em] rounded-[1.1em] bg-background p-[1.2em] shadow-float @max-[30rem]:inset-x-[1.6em] @max-[30rem]:top-[1.6em] @max-[30rem]:p-[1em]"
      style={at(0)}
    >
      <SceneTitle>{k("title")}</SceneTitle>
      <div className="mt-[0.9em] grid gap-[0.6em]">
        {PIECES.map((p, i) => {
          const size = sizeKg(p.dims);
          const bySize = size > p.kg;
          const start = 300 + i * 1250;
          return (
            <div key={p.key} className="jr jr-rise rounded-[0.8em] bg-surface-2 p-[0.75em]" style={at(start)}>
              <span className="block text-[0.66em] font-semibold uppercase tracking-[0.06em] text-muted">{k(p.key)}</span>
              {/* the fields, typed in: weight, then the three sides */}
              <div className="mt-[0.5em] grid grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] gap-[0.45em]">
                {[`${p.kg} kg`, `${p.dims.join(" × ")} cm`].map((v, j) => (
                  <span key={v} className="flex h-[2.15em] items-center rounded-[0.55em] bg-background px-[0.7em]">
                    <span className="jr jr-type whitespace-nowrap text-[0.84em] tabular-nums" style={at(start + 200 + j * 240)}>
                      {v}
                    </span>
                  </span>
                ))}
              </div>
              <div className="mt-[0.5em] grid grid-cols-3 divide-x divide-border rounded-[0.55em] bg-background">
                <Readout label={k("real")} value={kg(p.kg)} ms={start + 700} win={!bySize} />
                <Readout label={k("bySize")} value={kg(size)} ms={start + 820} win={bySize} />
                <Readout label={k("charged")} value={kg(Math.max(p.kg, size))} ms={start + 1000} strong />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="jr jr-rise mt-[0.8em] flex items-baseline justify-between gap-[1em] border-t border-border pt-[0.7em]"
        style={at(2800)}
      >
        <span className="text-[0.82em] font-medium">{k("total")}</span>
        <span className="font-display text-[1.45em] font-semibold tabular-nums tracking-tight">{kg(total)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  What you can ship: the CIPL for one box                            */
/* ------------------------------------------------------------------ */

/** the list's rows: the section's own goods, with the same icons, each as
 *  a line of the customs packing list, values in the origin's currency */
const ITEMS = [
  { key: "coats", Icon: Shirt, qty: 2, value: 120 },
  { key: "books", Icon: BookOpen, qty: 14, value: 70 },
  { key: "pans", Icon: CookingPot, qty: 3, value: 45 },
  { key: "sheets", Icon: BedDouble, qty: 4, value: 32 },
  { key: "games", Icon: Puzzle, qty: 2, value: 30 },
  { key: "lamp", Icon: Lamp, qty: 1, value: 25 },
] as const;

/** a sheet of the stack: inset a gutter from the top and sides, off the bottom */
const SHEET =
  "absolute inset-x-[2.6em] top-[2.6em] h-[40em] bg-background shadow-float @max-[24rem]:inset-x-[1.6em] @max-[24rem]:top-[1.6em]";

/** one column template for the head and every row, so the columns line up */
const LIST_COLS = "grid grid-cols-[1.75em_minmax(0,1fr)_2.1em_2.7em] items-center gap-x-[0.6em]";

/**
 * The commercial invoice and packing list for the last of eight boxes, the
 * document customs reads, alone on its ground: the things the section
 * lists going in row by row, then the total, the shipper's signature, and
 * Rimkirim's "Checked" stamp, every box reviewed. It is paper, not a screen, so
 * it has no rounded corner anywhere, and everything on it is printed, in
 * black and white: each piece carries `print-ink` (globals.css), toner on
 * paper, every colour a grey, its edges a fraction of a pixel ragged and
 * its ink a little thin in places, by the filter drawn here. Only the
 * signature and the stamp, put on the printout afterwards, keep a colour. The
 * filter sits on each piece, not on the sheet, so the grain travels with a
 * row as it rises instead of the row sliding through a still grain. Under
 * the sheet lie the sheets of the other boxes, their edges showing; a mouse
 * on the card fans them further (the stage's `cipl-stack`).
 */
export function PackingScene() {
  const { k } = useScene("packing");
  const total = ITEMS.reduce((s, i) => s + i.value, 0);
  return (
    <>
      <svg className="absolute size-0" aria-hidden>
        <filter id="print-ink" x="-2%" y="-10%" width="104%" height="120%" colorInterpolationFilters="sRGB">
          {/* a black and white printer: every colour comes out a grey */}
          <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="mono" />
          {/* the grain: toner is never even */}
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="grain" />
          {/* the edges, pushed a fraction of a pixel by the grain */}
          <feDisplacementMap in="mono" in2="grain" scale="0.5" xChannelSelector="R" yChannelSelector="G" result="ragged" />
          {/* where the toner missed: a finer grain read as a mask, solid but
              for its few brightest specks, so small type stays legible */}
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="3" result="specks" />
          <feColorMatrix in="specks" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -20 14" result="thin" />
          <feComposite in="ragged" in2="thin" operator="in" />
        </filter>
        <filter id="stamp-ink" x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="11" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="1" xChannelSelector="R" yChannelSelector="G" result="ragged" />
          {/* rubber never inks evenly: patches, coarser than the toner's specks */}
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" seed="5" result="patches" />
          <feColorMatrix in="patches" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.5" result="thin" />
          <feComposite in="ragged" in2="thin" operator="in" />
        </filter>
      </svg>
      {/* the other boxes' sheets, a degree askew under this one, fanned
          further by a mouse (globals.css, .cipl-stack); blank, since only
          their edges ever show */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          data-side={side}
          className={cn(SHEET, "cipl-under jr jr-arrive")}
          style={at(0)}
        />
      ))}
      <div className={cn(SHEET, "cipl-sheet jr jr-arrive p-[1.2em] @max-[24rem]:p-[1em]")} style={at(0)}>
        <span className="print-ink block text-balance">
          <SceneTitle>{k("title")}</SceneTitle>
        </span>
        <span
          className="print-ink jr jr-drop mt-[0.45em] block w-fit whitespace-nowrap border border-foreground/60 px-[0.55em] py-[0.15em] text-[0.74em] font-semibold"
          style={at(350)}
        >
          {k("box")}
        </span>
        <div className={cn(LIST_COLS, "print-ink jr jr-rise mt-[0.9em] border-b border-border pb-[0.4em]")} style={at(450)}>
          <span />
          {[k("item"), k("qty"), k("value")].map((h, i) => (
            <span
              key={h}
              className={cn("text-[0.74em] font-medium uppercase tracking-[0.04em] text-muted-2", i > 0 && "text-right")}
            >
              {h}
            </span>
          ))}
        </div>
        <ul>
          {ITEMS.map(({ key, Icon, qty, value }, i) => (
            <li key={key} className={cn(LIST_COLS, "print-ink jr jr-rise border-b border-border py-[0.5em]")} style={at(600 + i * 170)}>
              <Icon className="size-[1.05em]" strokeWidth={1.75} />
              <span className="truncate text-[0.8em]">{k(key)}</span>
              <span className="text-right text-[0.8em] tabular-nums text-muted">{qty}</span>
              <span className="text-right text-[0.8em] tabular-nums">£{value}</span>
            </li>
          ))}
        </ul>
        <div className={cn(LIST_COLS, "print-ink jr jr-rise pt-[0.6em]")} style={at(1600)}>
          <span />
          <span className="text-[0.8em] font-semibold">{k("total")}</span>
          <span />
          <span className="text-right text-[0.8em] font-semibold tabular-nums">£{total}</span>
        </div>
        <div className="mt-[0.9em] flex items-end justify-between gap-[1em]">
          {/* signed by the shipper, last, in pen in the chapter's ink */}
          <div className="w-[9em]">
            <svg
              viewBox="0 0 120 34"
              className="block h-[2.1em] w-full overflow-visible text-tone-ink"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path
                className="jr jr-ring"
                style={at(1750)}
                pathLength={100}
                d="M6 26C9 18 12 6 16 6c4 0 1 14-2 20-2 4 4 4 8-4 3-6 5-6 6 0 1 5 5 4 7-2 2-5 5-4 5 1 0 5 4 5 7-1 2-4 5-3 5 2 0 5 5 4 8-3 2-5 3-11 1-11-3 0-3 12 1 17 3 4 8-1 11-6 2-3 5-2 6 3 1 4 7 3 11-2 4-5 10-6 14-3-8 13-44 16-80 14"
              />
            </svg>
            <span className="print-ink block whitespace-nowrap border-t border-foreground/40 pt-[0.35em] text-[0.74em] font-medium uppercase tracking-[0.03em] text-muted-2">
              {k("signed")}
            </span>
          </div>
          {/* checked by Rimkirim: the team's stamp on the last box's sheet,
              in the same ink as the signature, since only what a hand puts
              on the printout keeps a colour */}
          <span
            className="cipl-stamp mb-[0.35em] mr-[0.3em] flex shrink-0 flex-col items-center border-[0.13em] border-current px-[0.75em] pb-[0.3em] pt-[0.25em] text-tone-ink outline outline-[0.07em] outline-offset-[0.16em] outline-current"
          >
            <span className="text-[0.58em] font-semibold uppercase leading-tight tracking-[0.2em]">Rimkirim</span>
            <span className="font-display text-[1.1em] font-bold uppercase leading-none tracking-[0.1em]">{k("stamp")}</span>
          </span>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Who does what: the team on WhatsApp                                */
/* ------------------------------------------------------------------ */

/** WhatsApp's own light theme, inside the phone: the chat's ground (its
 *  wallpaper's colour, without the doodles), the bubbles, the meta grey and
 *  the read ticks. The page's one stretch in WhatsApp's colours, because
 *  it is WhatsApp on a phone */
const WA_BUBBLE = "drop-shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]";

/** one message: theirs white at the left, the customer's WhatsApp green at
 *  the right with the blue read ticks; the time sits in the room left at
 *  the end of its last line, and the last of a run wears the iOS tail at
 *  its foot. `below` sets the time on a line of its own (a document) */
function WaBubble({
  from,
  time,
  tail,
  below,
  ms,
  className,
  children,
}: {
  from: "them" | "me";
  time: string;
  tail?: boolean;
  below?: boolean;
  ms: number;
  className?: string;
  children: React.ReactNode;
}) {
  const me = from === "me";
  const meta = (
    <span className="flex items-center gap-[3px] text-[11px] leading-none text-[#667781]">
      {time}
      {me && <CheckCheck className="size-[16px] text-[#53bdeb]" strokeWidth={2} />}
    </span>
  );
  return (
    <div
      className={cn(
        "jr jr-drop relative w-fit max-w-[80%] rounded-[16px] text-[17px] leading-[22px] text-[#111b21]",
        WA_BUBBLE,
        me ? "self-end bg-[#d9fdd3]" : "self-start bg-white",
        below ? "p-[4px]" : "px-[10px] pb-[7px] pt-[6px]",
        className,
      )}
      style={at(ms)}
    >
      {children}
      {below ? (
        <span className="flex justify-end px-[6px] pb-[2px] pt-[4px]">{meta}</span>
      ) : (
        <>
          <span className={cn("inline-block", me ? "w-[62px]" : "w-[42px]")} />
          <span className="absolute bottom-[6px] right-[10px]">{meta}</span>
        </>
      )}
      {tail && (
        <svg
          viewBox="0 0 18 16"
          className={cn(
            "absolute bottom-0 h-[16px] w-[18px]",
            me ? "-right-[6px] fill-[#d9fdd3]" : "-left-[6px] fill-white",
          )}
          aria-hidden
        >
          <path
            d={
              me
                ? "M0 0H12V8.5C12 12.6 14 15 17.5 16C15 16.7 12.2 16.5 9.8 15.3L0 15Z"
                : "M18 0H6V8.5C6 12.6 4 15 0.5 16C3 16.7 5.8 16.5 8.2 15.3L18 15Z"
            }
          />
        </svg>
      )}
    </div>
  );
}

/** a PDF as WhatsApp shows one in a message: the page with its corner
 *  folded and the type's red label */
function PdfIcon() {
  return (
    <svg viewBox="0 0 30 36" className="h-[36px] w-[30px] shrink-0" aria-hidden>
      <path d="M3 0h17l10 10v23a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3Z" fill="#fff" />
      <path d="M20 0v7a3 3 0 0 0 3 3h7Z" fill="#d1d7db" />
      <rect x="-2" y="19" width="26" height="11" rx="2" fill="#e5484d" />
      <text x="11" y="27.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">
        PDF
      </text>
    </svg>
  );
}

/** the phone's width in the scene's em: four fifths of a wide stage,
 *  nearly all of a compact one (the same switch as the scene's own compact
 *  container query), so the chat's 17pt type reads at 12 to 15px */
const PHONE_EM = { wide: 24, compact: 20 };

/**
 * "You'll need to", as it happens, on the customer's iPhone: the team on
 * WhatsApp says which documents to have ready and sends the packing list
 * they fill in together (the FAQ's own words), the customer asks for a
 * pickup day, it is confirmed, and it is booked. The three to-dos in one
 * short thread. The phone is the stageshow kit's iPhone 18 Pro (IPhone),
 * pinned a gutter from the stage's top and running off its foot, so its
 * status bar, island and the chat's header stay whole and the crop falls on
 * the empty wallpaper under the thread (WhatsApp sets a short chat from the
 * top). Its width is measured from the scene's em, since the phone lays its
 * screen out in true points. Under a mouse the card leans in and a glint
 * crosses the phone's glass (the stage's `glint`).
 */
export function ThreadScene() {
  const { k } = useScene("thread");
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(380);

  React.useEffect(() => {
    const scene = ref.current?.parentElement;
    if (!scene) return;
    const fit = () => {
      const em = parseFloat(getComputedStyle(scene).fontSize);
      setWidth(Math.round(em * (scene.clientWidth <= 384 ? PHONE_EM.compact : PHONE_EM.wide)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(scene);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="jr jr-arrive absolute inset-x-0 top-[2.2em] mx-auto w-fit @max-[24rem]:top-[1.4em]"
      style={at(0)}
    >
      <IPhone width={width} screen="#f6f6f6">
        {/* the chat's header, as WhatsApp on iOS draws a business: back,
            Rimkirim's own app icon, its name, video and voice calls */}
        <div className="flex h-[52px] shrink-0 items-center gap-[8px] border-b border-black/[0.08] pl-[6px] pr-[18px] text-[#111b21]">
          <ChevronLeft className="size-[30px] shrink-0" strokeWidth={2.2} />
          {/* eslint-disable-next-line @next/next/no-img-element -- a 96px still, as in SceneFlag */}
          <img src="/expat/journey/rimkirim-avatar.png" alt="" className="size-[36px] shrink-0 rounded-full" />
          <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">Rimkirim</span>
          <Video className="size-[25px] shrink-0" strokeWidth={1.8} />
          <PhoneCall className="ml-[16px] size-[21px] shrink-0" strokeWidth={1.8} />
        </div>
        <div className="flex flex-1 flex-col gap-[2px] bg-[#efeae2] px-[14px] pt-[10px]">
          <span
            className="jr jr-drop mb-[8px] self-center rounded-[8px] bg-white px-[10px] py-[4px] text-[12.5px] font-medium text-[#54656f] drop-shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]"
            style={at(250)}
          >
            {k("today")}
          </span>
          <WaBubble from="them" time="09:12" ms={400}>
            {k("msg1")}
          </WaBubble>
          <WaBubble from="them" time="09:12" tail below ms={750}>
            <span className="flex w-[232px] items-center gap-[10px] rounded-[12px] bg-[#f5f6f6] px-[10px] py-[9px]">
              <PdfIcon />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium leading-[20px]">{k("file")}</span>
                <span className="block text-[12.5px] leading-[16px] text-[#667781]">{k("pages")}</span>
              </span>
            </span>
          </WaBubble>
          <WaBubble from="me" time="09:20" tail ms={1300} className="mt-[8px]">
            {k("msg2")}
          </WaBubble>
          <WaBubble from="them" time="09:24" tail ms={2100} className="mt-[8px]">
            {k("msg3")}
          </WaBubble>
          <p
            className="jr jr-drop mt-[12px] flex items-center gap-[7px] self-center rounded-[8px] bg-white px-[12px] py-[6px] text-[14px] font-semibold text-[#111b21] drop-shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]"
            style={at(2700)}
          >
            <span className="grid size-[18px] place-items-center rounded-full bg-[#25d366] text-white">
              <Check className="size-[12px]" strokeWidth={3} />
            </span>
            {k("booked")}
          </p>
        </div>
      </IPhone>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The closing ticket: what happens next                              */
/* ------------------------------------------------------------------ */

/** the closing cards: white, straight on the ticket's dark (the ticket is
 *  their ground, so no stage of their own), their column's width, fading
 *  out at the foot over their empty end (the fade-crop framing, .scene-fade),
 *  so only their top corners are rounded: the foot has no edge to round.
 *  They set their own ink, since the ticket's words are white */
const NEXT_CARD =
  "scene-fade jr jr-arrive absolute inset-0 rounded-t-[1.1em] bg-background p-[1.1em] text-foreground @max-[18rem]:p-[0.95em]";

/** the estimate's shipment: eight of the pricing scene's boxes and two of
 *  its suitcases, each charged at the higher of its two weights */
const SHIPMENT = [
  { piece: PIECES[0], n: 8 },
  { piece: PIECES[1], n: 2 },
];

/** 1: the calculator's estimate, instant. Its big number is the weight the
 *  price is worked from, not a price: no figure here can be the visitor's */
export function EstimateScene() {
  const { k, locale } = useScene("next");
  const charged = SHIPMENT.reduce((s, { piece, n }) => s + n * Math.max(piece.kg, sizeKg(piece.dims)), 0);
  return (
    <div className={NEXT_CARD} style={at(0)}>
      <div className="flex items-center justify-between gap-[0.8em]">
        <SceneTitle>{k("estimate")}</SceneTitle>
        <span
          className="jr jr-drop whitespace-nowrap rounded-full bg-(--tone-wash) px-[0.6em] py-[0.2em] text-[0.68em] font-semibold text-tone-ink"
          style={at(900)}
        >
          {k("instant")}
        </span>
      </div>
      <p className="jr jr-rise mt-[0.8em] flex items-center gap-[0.45em] whitespace-nowrap text-[0.78em]" style={at(250)}>
        <SceneFlag code="gb" />
        {k("origin")}
        <ArrowRight className="size-[1em] shrink-0 text-muted-2" />
        <SceneFlag code="id" />
        {k("dest")}
      </p>
      <p className="jr jr-rise mt-[0.3em] text-[0.72em] text-muted" style={at(350)}>
        {k("contents")}
      </p>
      <div
        className="jr jr-rise mt-[0.8em] flex items-baseline justify-between gap-[1em] border-t border-border pt-[0.6em]"
        style={at(600)}
      >
        <span className="text-[0.8em] font-medium">{k("total")}</span>
        <span className="font-display text-[1.3em] font-semibold tabular-nums tracking-tight">
          {formatNumber(charged, 1, locale)} kg
        </span>
      </div>
    </div>
  );
}

/** 2: one of the eligibility questions, answered: Yes is pressed, and the
 *  progress it makes comes up with its count */
export function EligibleScene() {
  const { k } = useScene("next");
  return (
    <div className={NEXT_CARD} style={at(0)}>
      <div className="flex items-center justify-between gap-[0.8em]">
        <span className="jr jr-rise text-[0.68em] font-medium text-muted" style={at(1150)}>
          {k("progress")}
        </span>
        <span className="flex gap-[0.25em]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="relative block h-[0.3em] w-[1.4em] overflow-hidden rounded-full bg-surface-3">
              {i === 0 && <span className="jr jr-grow absolute inset-0 origin-left bg-tone-ink" style={at(1150)} />}
            </span>
          ))}
        </span>
      </div>
      <p className="jr jr-rise mt-[0.75em] text-pretty text-[0.86em] font-medium leading-snug" style={at(250)}>
        {k("question")}
      </p>
      <div className="mt-[0.8em] grid grid-cols-2 gap-[0.45em]">
        {/* Yes, pressed: its fill comes up under the one label, which
            turns white with it */}
        <span
          className="jr jr-rise relative flex h-[2.3em] items-center justify-center rounded-[0.6em] shadow-[inset_0_0_0_1.5px_var(--border-strong)]"
          style={at(450)}
        >
          <span className="jr jr-press absolute inset-0 rounded-[0.6em] bg-tone-ink" style={at(950)} />
          <span className="jr jr-ink relative text-[0.82em] font-medium text-background" style={at(950)}>
            {k("yes")}
          </span>
        </span>
        <span className="jr jr-rise flex h-[2.3em] items-center justify-center rounded-[0.6em] shadow-[inset_0_0_0_1.5px_var(--border-strong)]" style={at(520)}>
          <span className="text-[0.82em] font-medium">{k("no")}</span>
        </span>
      </div>
    </div>
  );
}

/** 3: the details sent, and the team picking it up on WhatsApp */
export function HandoffScene() {
  const { k } = useScene("next");
  return (
    <div className={cn(NEXT_CARD, "p-0")} style={at(0)}>
      <ChatHead />
      <div className="flex flex-col gap-[0.45em] px-[0.8em] py-[0.8em]">
        <Bubble from="me" ms={350}>
          {k("hello")}
        </Bubble>
        <Bubble from="them" ms={1100}>
          {k("reply")}
        </Bubble>
      </div>
    </div>
  );
}
