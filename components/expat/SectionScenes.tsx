"use client";

import * as React from "react";
import { Check, CheckCheck, ChevronLeft, PhoneCall, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { RateCard } from "@/components/expat-order/RateCard";
import { CheckCards } from "@/components/expat-order/ChoiceCards";
import { BookingHead } from "@/components/expat-order/BookingHead";
import { expatRates } from "@/lib/pricing/expat-rates";
import { IPhone } from "./IPhone";
import { at } from "./SceneParts";

/**
 * The section illustrations of the expat page, each the product moment its
 * section describes, built once on a SceneStage: the team on WhatsApp going
 * through the packing list (who does what), and the order flow's own three
 * screens behind "Check your rate" (the closing ticket), drawn by the
 * flow's own components so the picture can never drift from the product.
 * Pricing's four, one a step and playing as a relay, are in PricingScenes.
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
  const { t } = useLanguage();
  return { k: (key: string) => t(`expat.scenes.${group}.${key}`) };
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

/** the closing pictures' route and weight: the UK to Jakarta, 30 kg, priced
 *  by the flow's own rates, so the card is the one Check Rate shows */
const PICTURE_RATE = expatRates("GB", 30).rates[0];

/** the flow's own screens, shown and not used: no focus, no clicks, out of
 *  the accessibility tree (the step's words carry the meaning), and on the
 *  app's neutrals rather than the ticket's chapter (.tone-none) */
function Shown({ ms, className, children }: { ms: number; className?: string; children: React.ReactNode }) {
  return (
    <div inert aria-hidden className={cn("tone-none jr jr-rise", className)} style={at(ms)}>
      {children}
    </div>
  );
}

/** 1: Check Rate's lead card, as the flow draws it: a Special Rate from the
 *  UK, its price per kg and the estimated total */
export function EstimateScene() {
  return (
    <div className={NEXT_CARD} style={at(0)}>
      <Shown ms={250}>
        <RateCard rate={PICTURE_RATE} origin="GB" display stacked plain />
      </Shown>
    </div>
  );
}

/** 2: the Eligibility Check's first question, answered as the flow answers
 *  it: furniture and personal effects ticked */
export function EligibleScene() {
  const { t } = useLanguage();
  const e = (k: string) => t(`expatOrder.eligibility.${k}`);
  return (
    <div className={NEXT_CARD} style={at(0)}>
      <Shown ms={250}>
        <p id="scene-q1" className="font-display text-sm font-semibold leading-snug tracking-tight">
          {e("q1")}
        </p>
      </Shown>
      <Shown ms={450} className="mt-3">
        <CheckCards
          single
          labelledBy="scene-q1"
          value={["furniture", "personal"]}
          onChange={() => {}}
          options={(["furniture", "personal", "fineArt", "electronics"] as const).map((c) => ({
            value: c,
            label: e(`items.${c}`),
          }))}
        />
      </Shown>
    </div>
  );
}

/** 3: the Booking Summary's head, as the flow draws it: received, the
 *  summary on its way by email, and the booking number */
export function HandoffScene() {
  return (
    <div className={NEXT_CARD} style={at(0)}>
      <Shown ms={300}>
        <BookingHead number="RK4KX9M2PT" email="you@example.com" compact />
      </Shown>
    </div>
  );
}
