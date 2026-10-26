/**
 * The one WhatsApp door for humans: every "hubungi kami" link points here.
 * Rimkirim's live support line, +62 817 1717 7008 (as on rimkirim.com), so
 * anything sent from a demo reaches the real team.
 */
export const WA_URL = "https://wa.me/6281717177008";

/** The same door with a message already typed, for handing over context. */
export const waLink = (text: string) => `${WA_URL}?text=${encodeURIComponent(text)}`;
