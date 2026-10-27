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
    q: { id: "Bagaimana cara minta penawaran?", en: "How do I get a quote?" },
    a: {
      id: "Mulai dari kalkulator untuk estimasi instan, jawab beberapa pertanyaan untuk cek kelayakan, lalu isi data dirimu. Setelah itu tim kami lanjut bersamamu lewat WhatsApp untuk memastikan harga dan langkah berikutnya.",
      en: "Start with the calculator for an instant estimate, answer a few questions to check you're eligible, then add your details. Our team then picks it up with you on WhatsApp to confirm the price and the next steps.",
    },
  },
  {
    q: { id: "Barang apa saja yang bisa dikirim?", en: "What can I ship?" },
    a: {
      id: "Barang pribadi: pakaian dan sepatu, buku dan berkas, peralatan dapur, seprai dan handuk, mainan, dan barang sehari-hari lainnya, dikemas dalam kardus atau koper. Koper wajib dikunci dan bisa kena biaya tambahan. Furnitur, elektronik rumah tangga, dan barang yang tidak muat di kardus atau koper perlu dinilai terpisah; tim kami mengeceknya bersamamu lewat WhatsApp.",
      en: "Personal belongings: clothes and shoes, books and documents, kitchenware, bedding and linen, toys and other everyday things, packed in boxes or suitcases. Suitcases need to be locked and can carry an extra charge. Furniture, appliances and anything that won't fit in a box or suitcase need a separate assessment; our team checks those with you on WhatsApp.",
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

/**
 * Where every "Get a quote" on the expat page goes: the live relocation
 * calculator, which runs the expat flow end to end (instant estimate, then
 * eligibility, then personal details, then WhatsApp). This prototype has no
 * expat calculator of its own; point this at the new route once it does.
 */
export const EXPAT_QUOTE_URL = "https://rimkirim.com/relocation/rates";

export function expatFaq(locale: Locale): ExpatFaq[] {
  return FAQ.map((f) => ({ q: f.q[locale], a: f.a[locale] }));
}

/**
 * PLACEHOLDER reviews for the expat page, by `name` in lib/data/testimonials.ts
 * (verbatim, English-language, Europe and Australia routes). They are
 * Indonesians who moved home, not expats, so the copy never calls them
 * expats, and the page shows no Google rating: no expat has reviewed us there
 * yet. Replace with real reviews from the expat customers being approached.
 */
export const EXPAT_REVIEWS: {
  name: string;
  /** a customer photo for this review: `null` asks for one (a placeholder
   *  shows until there is a real, consented photo), a path shows it */
  photo?: string | null;
}[] = [
  { name: "Ratna sari", photo: null },
  { name: "Nurul" },
  { name: "Elita Nuraeny" },
];

/**
 * The hero's photo deck: real shipments with Rimkirim's FedEx labels, each
 * label (name, address, AWB) and a name written on a box covered by a mosaic
 * that follows its shape, since the repo and the page are public. Every
 * frame is cropped to the deck's 5:4, so `position` keeps the boxes, not the
 * floor, in the crop. Ordered so near-identical shots never sit next to each
 * other, opening on the one the brief describes (boxes and suitcases ready to
 * ship) and closing on the large shipment, which could read as a house move.
 * `alt` is a key under `expat.photos`.
 */
export const EXPAT_HERO_PHOTOS = [
  { src: "/expat/hero/01-suitcases.jpg", alt: "suitcases", position: "50% 55%" },
  { src: "/expat/hero/02-boxes-living-room.jpg", alt: "livingRoom", position: "50% 58%" },
  { src: "/expat/hero/03-courier-van.jpg", alt: "van", position: "50% 60%" },
  { src: "/expat/hero/04-this-way-up.jpg", alt: "thisWayUp", position: "50% 45%" },
  { src: "/expat/hero/05-taped-boxes.jpg", alt: "taped", position: "50% 62%" },
  { src: "/expat/hero/06-winter-clothes.jpg", alt: "winter", position: "50% 62%" },
  { src: "/expat/hero/07-large-shipment.jpg", alt: "large", position: "50% 48%" },
] as const;

/**
 * "Why Rimkirim": couriers collecting Rimkirim customers' shipments, from the
 * team (2026-10-27). Every frame is cropped to the same 4:5 at the same
 * 960×1200, so a layout can treat them as equals; the couriers' faces,
 * number plates and shipping labels (AWB) wear the hero's mosaic. Opens at
 * the door, then alternates people and boxes. `alt` is a key under
 * `expat.pickups`.
 */
export const EXPAT_PICKUP_PHOTOS = [
  { src: "/expat/pickups/01-doorstep-scan.jpg", alt: "doorstep" },
  { src: "/expat/pickups/02-trolley.jpg", alt: "trolley" },
  { src: "/expat/pickups/03-pallet-jack.jpg", alt: "pallet" },
  { src: "/expat/pickups/04-stroller-box.jpg", alt: "stroller" },
  { src: "/expat/pickups/05-truck-load.jpg", alt: "truck" },
  { src: "/expat/pickups/06-tall-box.jpg", alt: "tallBox" },
] as const;

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
  /** what was sent and what it travelled in, in the customer's terms, e.g.
   *  "clothes, books and kitchenware in 6 boxes and 2 suitcases" */
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
  hero: "Pastikan klaim 'by air', pickup dari pintu, dan antar sampai pintu berlaku untuk semua negara asal expat. Papan keberangkatan di eyebrow menampilkan negara asal GBR, NLD, DEU, AUS, USA, FRA, JPN, SGP: konfirmasi daftarnya (RouteBoard.tsx). Foto hero adalah kiriman asli: pastikan ada izin customer. Label FedEx (nama, alamat, nomor AWB) dan nama yang ditulis di kardus sudah disensor mosaik.",
  cta: "Semua 'Get a quote' mengarah ke kalkulator relocation yang live (rimkirim.com/relocation/rates): estimasi, cek kelayakan, data diri, lalu WhatsApp. Ganti EXPAT_QUOTE_URL di lib/data/expat.ts kalau kalkulatornya dibangun di situs ini. Semua link WhatsApp sudah ke nomor live (+62 817 1717 7008).",
  reviews:
    "Placeholder: ulasan ini dari WNI yang pulang, bukan expat, dan akan diganti ulasan asli dari customer expat yang sedang di-approach (EXPAT_REVIEWS di lib/data/expat.ts, juga kutipan di hero). Kartu pertama menunggu foto asli customer: isi `photo` dengan path fotonya (dengan izin). Rating bintang dan link Google sengaja dihapus karena belum ada ulasan expat di Google.",
  ship: "Brief: konfirmasi daftar barang yang eligible sebelum dipublikasikan, termasuk kategori baru seprai & handuk dan mainan & perlengkapan hobi. Kardus dan koper diperlakukan sebagai kemasan, bukan jenis barang.",
  coordinate:
    "Konfirmasi pembagian tugas, terutama dokumen WNA. Konten repo bertentangan: artikel Belanda bilang fasilitas Pindahan mencakup WNA yang pindah kerja, panduan bea cukai bilang hanya WNI. Satu-satunya daftar dokumen WNA di repo: VITAS, ITAS, RPTKA. Foto pickup adalah kiriman customer asli: pastikan ada izin customer. Wajah kurir, plat nomor, dan label AWB sudah disensor mosaik.",
  pricing:
    "Ambang 25 kg dan ±120 cm diambil dari engine surcharge (dokumen carrier). Modal Surcharge Information sama dengan di situs utama (FedEx/DHL/UPS + biaya logistik lain). Konfirmasi semuanya berlaku untuk rute expat, terutama surcharge packaging untuk koper yang kini disebut di copy.",
  steps: "Brief: Rimkirim konfirmasi urutan langkah yang sebenarnya.",
  examples:
    "Section 07 (contoh pengiriman nyata) disembunyikan sampai ada contoh asli: asal, jenis barang, komentar, foto. Isi SHIPMENT_EXAMPLES di lib/data/expat.ts.",
  faq: "Brief: semua jawaban wajib disetujui Rimkirim, terutama bea cukai & pengantaran. Waktu 4–8 hari + 4–10 hari kerja diambil dari FAQ & artikel yang sudah ada.",
} as const;
