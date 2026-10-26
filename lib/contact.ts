/** The one WhatsApp door for humans: every "hubungi kami" link points here. */
export const WA_URL = "https://wa.me/6281234567890";

/** The same door with a message already typed, for handing over context. */
export const waLink = (text: string) => `${WA_URL}?text=${encodeURIComponent(text)}`;
