/**
 * Content for the expat relocation landing (/expat-relocation) that is data
 * rather than interface copy: the FAQ, which reviews to show, real shipment
 * examples, and the draft's review notes. Short UI strings live in
 * lib/i18n/messages.ts under `expat`.
 *
 * Draft status: every customs and delivery claim below still needs Rimkirim's
 * sign-off (see REVIEW_NOTES). Answers are assembled from what the site
 * already says in lib/data/faq.ts and content/articles, never invented.
 */
import type { Locale } from "@/lib/i18n/messages";

interface Txt {
  id: string;
  en: string;
}

interface ExpatFaqSource {
  q: Txt;
  a: Txt;
}

export interface ExpatFaq {
  q: string;
  a: string;
}

const FAQ: ExpatFaqSource[] = [
  {
    q: { id: "Barang apa saja yang bisa dikirim?", en: "What can I ship?" },
    a: {
      id: "Kardus dan koper berisi barang pribadi: pakaian, sepatu, buku, peralatan dapur, dan barang sehari-hari lainnya. Koper wajib dikunci dan bisa kena biaya tambahan. Furnitur, elektronik rumah tangga, dan barang besar lainnya perlu dinilai terpisah, jadi sebutkan di permintaanmu.",
      en: "Boxes and suitcases of personal belongings: clothes, shoes, books, kitchenware and other everyday things. Suitcases need to be locked and can carry an extra charge. Furniture, appliances and other bulky items need a separate assessment, so mention them in your enquiry.",
    },
  },
  {
    q: { id: "Barang apa yang tidak boleh dikirim?", en: "What can't I ship?" },
    a: {
      id: "Alkohol, rokok dan vape, senjata, bahan peledak, uang tunai, perhiasan, dan tanaman. Kurir juga tidak menerbangkan cairan atau parfum, perangkat dengan baterai yang tidak bisa dilepas, atau barang mudah terbakar. Ragu soal sesuatu? Tanya kami sebelum dikemas.",
      en: "Alcohol, cigarettes and vapes, weapons, explosives, cash, jewellery and plants. Couriers also won't fly liquids or perfume, devices with batteries that can't be removed, or anything flammable. Not sure about something? Ask us before you pack it.",
    },
  },
  {
    q: { id: "Dokumen apa yang perlu disiapkan?", en: "What documents will I need?" },
    a: {
      id: "Biasanya paspor dan izin tinggal di Indonesia, ditambah packing list yang kami siapkan bersamamu. Daftar pastinya tergantung situasimu, jadi kami konfirmasi bersama penawaran.",
      en: "Usually your passport and your Indonesian stay permit, plus the packing list we prepare with you. The exact list depends on your situation, so we'll confirm it with your quote.",
    },
  },
  {
    q: { id: "Bagaimana harga dihitung?", en: "How is the price worked out?" },
    a: {
      id: "Dari rute dan berat tiap barang. Kardus besar tapi ringan dihitung dari ukurannya (panjang × lebar × tinggi ÷ 5000), mana yang lebih besar. Barang yang terlalu besar atau sangat berat bisa kena biaya penanganan tambahan.",
      en: "From your route and the weight of each piece. A big but light box is priced by its size instead (length × width × height ÷ 5000), whichever is higher. Oversized or very heavy pieces can carry an extra handling charge.",
    },
  },
  {
    q: { id: "Apakah ada bea atau pajak impor?", en: "Do I pay import duty or tax?" },
    a: {
      id: "Tergantung barang yang kamu bawa dan statusmu di Indonesia. Bea atau pajak, kalau ada, dibayar ke bea cukai dan tidak termasuk harga kami. Kami beri tahu perkiraannya sebelum barang dikirim.",
      en: "It depends on what you're bringing and your status in Indonesia. Any duty or tax is paid to customs and isn't part of our price. We'll tell you what to expect before anything ships.",
    },
  },
  {
    q: { id: "Berapa lama pengirimannya?", en: "How long does it take?" },
    a: {
      id: "Lewat udara dari Eropa, biasanya sekitar 4–8 hari perjalanan, ditambah sekitar 4–10 hari kerja untuk clearance di Indonesia. Estimasi untuk rutemu kami berikan bersama penawaran.",
      en: "By air from Europe, usually around 4–8 days in transit, plus about 4–10 working days for customs clearance in Indonesia. We'll give you an estimate for your route with your quote.",
    },
  },
  {
    q: { id: "Bagaimana pengantaran di Indonesia?", en: "How does delivery in Indonesia work?" },
    a: {
      id: "Setelah kirimanmu lolos bea cukai, kami atur pengantaran ke alamatmu dan sepakati waktunya bersamamu lewat WhatsApp.",
      en: "Once your shipment clears customs, we arrange delivery to your address and agree the timing with you on WhatsApp.",
    },
  },
  {
    q: {
      id: "Bisakah kantorku yang mengirimkan barangnya?",
      en: "Can my employer send the shipment for me?",
    },
    a: {
      id: "Untuk barang pribadi, pengirim dan penerimanya sebaiknya kamu sendiri. Kalau perusahaanmu yang mengirim, bea cukai memperlakukannya berbeda, jadi kabari kami sejak awal.",
      en: "For personal belongings, you should be both the sender and the receiver. If your company sends it instead, customs treats the shipment differently, so tell us early.",
    },
  },
];

export function expatFaq(locale: Locale): ExpatFaq[] {
  return FAQ.map((f) => ({ q: f.q[locale], a: f.a[locale] }));
}

/**
 * Reviews for the expat page, by `name` in lib/data/testimonials.ts (quoted
 * verbatim from Google). All English-language and all from Europe or
 * Australia, the corridors the brief cares about. They are Indonesians who
 * moved home, not expats, which is why the copy never calls them expats.
 */
export const EXPAT_REVIEW_NAMES = ["Ratna sari", "Nurul", "Elita Nuraeny"];

/** the hero's one-line proof: a verbatim excerpt of this review */
export const EXPAT_HERO_REVIEW = {
  name: "daelyn",
  excerpt: "everything arrived safely and was intact.",
};

/**
 * Brief section 07, "Real shipment examples". Stays empty, and the section
 * stays hidden, until Rimkirim has approved examples: route, what was sent,
 * a short customer comment. Never invent numbers, timings or outcomes.
 */
export interface ShipmentExample {
  /** ISO code of the origin country */
  origin: string;
  /** what was sent, in the customer's terms, e.g. "6 boxes and 2 suitcases" */
  sent: Txt;
  comment: Txt;
  customer: string;
  photo?: string;
}

export const SHIPMENT_EXAMPLES: ShipmentExample[] = [];

/**
 * What Rimkirim still has to confirm before this draft goes live, shown on
 * the page only with `?review=1`. Indonesian: they are for the team, not for
 * visitors.
 */
export const REVIEW_NOTES = {
  hero: "Pastikan klaim 'by air', pickup dari pintu, dan antar sampai pintu berlaku untuk semua negara asal expat.",
  form: "Prototype: permintaan belum terkirim ke mana pun. Putuskan tujuan lead (CRM/email) dan apakah nomor WhatsApp wajib. WA_URL di lib/contact.ts masih nomor placeholder.",
  reviews:
    "Ulasan Google asli, tapi dari WNI yang pulang, bukan expat. Brief: minta 2–3 ulasan dari expat, plus foto, screenshot ulasan, atau video singkat (dengan izin).",
  ship: "Brief: konfirmasi daftar barang yang eligible sebelum dipublikasikan.",
  coordinate:
    "Konfirmasi pembagian tugas, terutama dokumen WNA. Konten repo bertentangan: artikel Belanda bilang fasilitas Pindahan mencakup WNA yang pindah kerja, panduan bea cukai bilang hanya WNI. Satu-satunya daftar dokumen WNA di repo: VITAS, ITAS, RPTKA.",
  pricing:
    "Ambang 25 kg dan ±120 cm diambil dari engine surcharge (dokumen carrier). Konfirmasi berlaku untuk rute expat.",
  steps: "Brief: Rimkirim konfirmasi urutan langkah yang sebenarnya.",
  examples:
    "Section 07 (contoh pengiriman nyata) disembunyikan sampai ada contoh asli: asal, jenis barang, komentar, foto. Isi SHIPMENT_EXAMPLES di lib/data/expat.ts.",
  faq: "Brief: semua jawaban wajib disetujui Rimkirim, terutama bea cukai & pengantaran. Waktu 4–8 hari + 4–10 hari kerja diambil dari FAQ & artikel yang sudah ada.",
} as const;
