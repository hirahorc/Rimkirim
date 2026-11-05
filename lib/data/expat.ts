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
  /** the question's anchor, for a question the page links to */
  slug?: string;
  q: Txt;
  a: Txt;
}

export interface ExpatFaq {
  slug?: string;
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
      id: "Barang pribadi: pakaian dan sepatu, buku dan berkas, peralatan dapur, seprai dan handuk, mainan, dan barang sehari-hari lainnya, dikemas dalam kardus atau koper. Koper wajib dikunci dan bisa kena biaya tambahan. Furnitur, elektronik rumah tangga, dan barang yang tidak muat di kardus atau koper perlu dinilai terpisah; tim kami mengeceknya bersamamu lewat WhatsApp. Semua barang dikemas sendiri olehmu, termasuk furnitur, sesuai kriteria pengemasan kami.",
      en: "Personal belongings: clothes and shoes, books and documents, kitchenware, bedding and linen, toys and other everyday things, packed in boxes or suitcases. Suitcases need to be locked and can carry an extra charge. Furniture, appliances and anything that won't fit in a box or suitcase need a separate assessment; our team checks those with you on WhatsApp. Everything travels packed by you, furniture included, to our packing criteria.",
    },
  },
  {
    // a deep link to the answer (ExpatFaq, openFaqItem)
    slug: "faq-cant-ship",
    q: { id: "Barang apa yang tidak boleh dikirim?", en: "What can't I ship?" },
    a: {
      id: "Alkohol, rokok dan vape, senjata, bahan peledak, uang tunai, perhiasan, dan tanaman. Kurir juga tidak menerbangkan cairan atau parfum, perangkat dengan baterai yang tidak bisa dilepas, atau barang mudah terbakar. Ragu soal sesuatu? Tanya kami sebelum dikemas.",
      en: "Alcohol, cigarettes and vapes, weapons, explosives, cash, jewellery and plants. Couriers also won't fly liquids or perfume, devices with batteries that can't be removed, or anything flammable. Not sure about something? Ask us before you pack it.",
    },
  },
  {
    q: { id: "Dokumen apa yang perlu disiapkan?", en: "What documents will I need?" },
    a: {
      id: "Tergantung jalur bea cukaimu. Sebagai barang pindahan, yang bebas bea dan pajak, biasanya perlu paspor, izin tinggal (ITAS) atau visa kerja (VITAS), izin kerja (RPTKA) kalau pindah untuk bekerja, packing list per kardus, dan tiket yang menunjukkan kedatanganmu. Sebagai barang kiriman, cukup fotokopi paspor dan packing list dengan nilai tiap barang. Daftar pastinya kami konfirmasi bersama penawaran.",
      en: "It depends on your customs route. As relocation goods, which go free of duty and tax, you usually need your passport, a stay permit (ITAS) or work visa (VITAS), a work permit (RPTKA) if you're moving for work, a packing list itemised per box, and a ticket showing your arrival. As a regular shipment, your passport copy and a packing list with each item's value are enough. We'll confirm the exact list with your quote.",
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
      id: "Kalau kamu bisa menyediakan dokumen pindahan, barang pribadimu yang sudah terpakai bisa masuk sebagai barang pindahan, bebas bea dan pajak. Kalau tidak, barangmu di-clear sebagai barang kiriman, dan bea serta pajak berlaku, dibayar ke bea cukai dan tidak termasuk harga kami. Kami bantu cek jalur mana yang berlaku sebelum barang dikirim.",
      en: "If you can provide relocation documents, your used belongings can enter as relocation goods (barang pindahan), free of duty and tax. Otherwise they clear as a regular shipment (barang kiriman), and duty and tax apply, paid to customs and not part of our price. We help you check which applies before anything ships.",
    },
  },
  {
    q: { id: "Berapa lama pengirimannya?", en: "How long does it take?" },
    a: {
      id: "Lewat udara dari Eropa, biasanya sekitar 4–8 hari perjalanan, ditambah sekitar 4–10 hari kerja untuk clearance di Indonesia. Jauh lebih cepat daripada kargo laut, yang biasanya butuh lima sampai enam minggu di laut saja. Estimasi untuk rutemu kami berikan bersama penawaran.",
      en: "By air from Europe, usually around 4–8 days in transit, plus about 4–10 working days for customs clearance in Indonesia. That's much faster than sea freight, which usually spends five to six weeks at sea alone. We'll give you an estimate for your route with your quote.",
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
  return FAQ.map((f) => ({ slug: f.slug, q: f.q[locale], a: f.a[locale] }));
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
  // a local preview photo can stand in while the real one is awaited: set
  // NEXT_PUBLIC_EXPAT_REVIEW_PHOTO in .env.local (never committed); without
  // it the card asks for the photo
  { name: "Ratna sari", photo: process.env.NEXT_PUBLIC_EXPAT_REVIEW_PHOTO || null },
  // no photo: Leticia asked for her review to run without one
  { name: "Leticia Marina Bevilaqua" },
  { name: "Nurul" },
  { name: "Elita Nuraeny" },
];

/**
 * The hero's photo deck: real shipments with Rimkirim's FedEx labels, each
 * label (name, address, AWB) and any name on a box covered by a mosaic that
 * follows its shape, since the repo and the page are public. Mostly big
 * shipments, as proof that Rimkirim moves a whole household's worth of
 * boxes; one suitcase shot stays as proof that suitcases ship too. Every
 * frame is cropped to the deck's 5:4, so `position` keeps the boxes, not the
 * floor, in the crop. Ordered so near-identical shots never sit next to each
 * other, opening on boxes and suitcases together (what the brief describes)
 * and closing on the large shipment. `alt` is a key under `expat.photos`.
 */
export const EXPAT_HERO_PHOTOS = [
  { src: "/expat/hero/01-boxes-and-suitcases.jpg", alt: "hall", position: "58% 50%" },
  { src: "/expat/hero/02-suitcases.jpg", alt: "suitcases", position: "50% 55%" },
  { src: "/expat/hero/03-moving-boxes-trolley.jpg", alt: "trolley", position: "50% 60%" },
  { src: "/expat/hero/04-this-way-up.jpg", alt: "thisWayUp", position: "50% 45%" },
  { src: "/expat/hero/05-ten-boxes.jpg", alt: "tenBoxes", position: "50% 50%" },
  { src: "/expat/hero/06-direct-boxes.jpg", alt: "direct", position: "50% 50%" },
  { src: "/expat/hero/07-large-shipment.jpg", alt: "large", position: "50% 48%" },
] as const;

/**
 * "Why Rimkirim": couriers collecting Rimkirim customers' shipments, from the
 * team (2026-10-27). Every frame is cropped to the same 4:5 at the same
 * 960×1200, so the slices can treat them as equals; the couriers' faces,
 * number plates and shipping labels (AWB) wear the hero's mosaic. Opens at
 * the door, then alternates people and boxes. On the page each photo says
 * only its route: `from`, the ISO country it was collected in (confirmed by
 * the team, 2026-10-29), to Indonesia. `alt` is a key under `expat.pickups`,
 * the photo described for screen readers.
 */
export const EXPAT_PICKUP_PHOTOS = [
  { src: "/expat/pickups/01-doorstep-scan.jpg", alt: "doorstep", from: "GB" },
  { src: "/expat/pickups/02-trolley.jpg", alt: "trolley", from: "JP" },
  { src: "/expat/pickups/03-pallet-jack.jpg", alt: "pallet", from: "DE" },
  { src: "/expat/pickups/04-stroller-box.jpg", alt: "stroller", from: "GB" },
  { src: "/expat/pickups/05-truck-load.jpg", alt: "truck", from: "GB" },
  { src: "/expat/pickups/06-tall-box.jpg", alt: "tallBox", from: "GB" },
] as const;

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
  hero: "Pastikan klaim 'by air', pickup dari pintu, dan antar sampai pintu berlaku untuk semua negara asal expat. Papan keberangkatan di eyebrow menampilkan negara asal GBR, NLD, DEU, AUS, USA, FRA, JPN, SGP: konfirmasi daftarnya (RouteBoard.tsx). Foto hero adalah kiriman asli: pastikan ada izin customer. Label FedEx (nama, alamat, nomor AWB) dan nama yang ditulis di kardus sudah disensor mosaik. Notifikasi WhatsApp di pojok foto adalah contoh ('Your boxes have cleared customs in Indonesia. Next stop: your door.'), bukan tentang kiriman di foto: konfirmasi tim memang mengabarkan clearance lewat WhatsApp.",
  cta: "Semua 'Get a quote' mengarah ke kalkulator relocation yang live (rimkirim.com/relocation/rates): estimasi, cek kelayakan, data diri, lalu WhatsApp. Ganti EXPAT_QUOTE_URL di lib/data/expat.ts kalau kalkulatornya dibangun di situs ini. Semua link WhatsApp sudah ke nomor live (+62 817 1717 7008).",
  reviews:
    "Ulasan Leticia Marina Bevilaqua (Inggris Raya ke Indonesia) adalah ulasan expat asli pertama. Ulasan ditampilkan utuh atas permintaan customer, dan dipotong dengan tombol 'Read more' di kartunya. Leticia tidak ingin memakai foto, jadi kartunya tanpa foto. Tiga ulasan lainnya masih placeholder dari WNI yang pulang, bukan expat, dan akan diganti ulasan asli dari customer expat yang sedang di-approach (EXPAT_REVIEWS di lib/data/expat.ts). Kartu pertama menunggu foto asli customer: isi `photo` dengan path fotonya (dengan izin). Selama belum ada foto, slot 'Photo to add' tampil di tempatnya untuk semua pengunjung, karena kartu foto tinggi itu bagian dari desain. Rating bintang dan link Google sengaja dihapus karena belum ada ulasan expat di Google.",
  ship:
    "DRAFT, menunggu dokumen resmi Rimkirim untuk tiap poin. Section ini sekarang mengikuti 'What you can send' di sendmybag.com: enam kartu (Kardus, Koper & tas, Pakaian/buku/perabot, Elektronik, Barang baru & hadiah, Furnitur & peralatan besar) yang masing-masing bisa dibuka untuk detailnya, lalu blok 'Not allowed' tepat di bawahnya. Yang perlu dikonfirmasi: (1) kardus maksimal 25 kg, sisi terpanjang 121 cm dan sisi kedua 76 cm sebelum kena biaya penanganan, diambil dari tabel surcharge di modal Surcharge Information: cek apakah berlaku untuk semua kurir di rute expat; (2) kardus yang dibungkus plastik atau bubble wrap, atau dilakban penuh, kena biaya tambahan; (3) koper wajib dikunci, kena biaya penanganan per tas, dan batas 25 kg juga berlaku untuk koper; (4) elektronik wajib dikabarkan dulu, dan kurir tidak menerbangkan perangkat yang baterainya tidak bisa dilepas: kalau benar, laptop dan HP tidak bisa dikirim, jadi pastikan aturannya; (5) barang baru & hadiah bisa kena pajak, dikemas terpisah, dan dikabarkan dulu; (6) barang besar dicek lewat WhatsApp dan bisa dikirim sebagai kargo dengan biaya penanganan sendiri; (7) daftar 'Not allowed' (alkohol, rokok & vape, senjata & bahan peledak, barang mudah terbakar, cairan & parfum, uang tunai, perhiasan, tanaman) dan makanan & minuman yang boleh kalau dideklarasikan dulu; (8) syarat 'sudah terpakai dan milik sendiri' untuk barang pribadi. Koreksi Kevin (ops): semua barang dikemas sendiri oleh customer, termasuk furnitur, sesuai kriteria pengemasan Ops; kartu Furniture, FAQ, dan 'Who does what' sudah mengikuti ini. Butuh dokumen kriteria pengemasan dari Ops, untuk dikirim ke customer atau nanti dijadikan isi halaman. Ilustrasi tiap kartu adalah gambar, bukan foto kiriman asli.",
  coordinate:
    "Konfirmasi pembagian tugas, terutama dokumen WNA. Soal fasilitas Pindahan untuk WNA, Kevin (ops) sudah menjawab: dengan dokumen pindahan, barang bisa masuk bebas bea dan pajak (lihat section bea cukai). Daftar dokumen WNA yang final masih ditunggu; yang dipakai sekarang VITAS, ITAS, RPTKA dari artikel di repo. Foto pickup adalah kiriman customer asli: pastikan ada izin customer. Wajah kurir, plat nomor, dan label AWB sudah disensor mosaik. Ilustrasi chat WhatsApp di iPhone (di samping daftar) adalah contoh: konfirmasi alurnya (tim minta paspor dan izin tinggal, mengirim packing list untuk diisi bersama, lalu menjadwalkan pickup dengan rentang jam).",
  compare:
    "Usulan agency (04b), copy menunggu verifikasi ops: terutama 'estimasi dengan rincian biaya sebelum memesan', 'kabar status di setiap tahap, termasuk clearance', dan pendampingan personal. Kompetitor tidak disebut, dan packing sengaja tidak dibandingkan (dibahas di How it works). Kolom 'opsi umum' diriset dari halaman publik jasa kirim bagasi dan perusahaan pindahan internasional (2026-10-29). Klaim Rimkirim yang perlu dikonfirmasi: antar sampai pintu di semua kota tujuan (termasuk kota yang belum terlayani domestik seperti Makassar), customer tidak perlu datang ke bea cukai, dan kabar status lewat WhatsApp di setiap tahap.",
  pricing:
    "Ambang 25 kg dan ±120 cm diambil dari engine surcharge (dokumen carrier). Modal Surcharge Information sama dengan di situs utama (FedEx/DHL/UPS + biaya logistik lain). Konfirmasi semuanya berlaku untuk rute expat, terutama surcharge packaging untuk koper yang kini disebut di copy. Ilustrasi kalkulator memakai angka hitungan asli (60×40×40 ÷ 5000 = 19,2 kg; 75×50×30 ÷ 5000 = 22,5 kg), tapi label kolomnya (Real, By size, Charged) diambil dari kalkulator situs utama: sesuaikan kalau kalkulator relocation memakai label lain.",
  customs:
    "Section baru dari feedback Kevin (ops): jalur barang pindahan (bebas bea dan pajak dengan dokumen pindahan) atau barang kiriman (bea dan pajak berlaku). Semua DRAFT, perlu konfirmasi ops: (1) barang pindahan berlaku untuk WNA yang punya dokumen; (2) daftar dokumen WNA yang pasti (sekarang: paspor, ITAS atau VITAS, RPTKA kalau pindah kerja, packing list per kardus, tiket kedatangan; diambil dari artikel di repo); (3) dokumen barang kiriman (sekarang: fotokopi paspor dan packing list dengan nilai); (4) batas 90 hari sebelum atau sesudah kedatangan (PMK 25/2025); (5) barang baru dan jumlah berlebih tidak bebas bea; (6) kulkas, freezer, dan AC diblokir meski bekas (Permendag 16/2025 Pasal 42); (7) apakah tim bisa memberi perkiraan bea dan pajak sebelum barang dikirim. Sengaja tidak dimasukkan: artikel bilang pemeriksaan fisik perlu dihadiri customer atau wakilnya, bertentangan dengan klaim tabel compare 'you don't go to customs yourself'; tolong dipastikan.",
  steps:
    "Brief: Rimkirim konfirmasi urutan langkah yang sebenarnya. Ilustrasi tiap langkah adalah contoh, bukan data asli: konfirmasi nama dokumen di checklist (Passport copy, Packing list, Visa or stay permit) dan contoh pesan WhatsApp soal jadwal antar.",
  examples:
    "Section 07 (contoh pengiriman nyata) disembunyikan sampai ada contoh asli: asal, jenis barang, komentar, foto. Isi SHIPMENT_EXAMPLES di lib/data/expat.ts.",
  closing:
    "Tiap langkah 'What happens next' punya ilustrasi layar (contoh, bukan data asli): kartu estimasi (harga sengaja tidak ditampilkan), pertanyaan kelayakan 'Are you shipping personal belongings to Indonesia?' diambil dari kuesioner Back For Good, dan '1 of 3 answered' adalah contoh: konfirmasi pertanyaan dan jumlahnya di kalkulator relocation. Pesan WhatsApp juga contoh.",
  faq: "Brief: semua jawaban wajib disetujui Rimkirim, terutama bea cukai & pengantaran. Waktu 4–8 hari + 4–10 hari kerja diambil dari FAQ & artikel yang sudah ada.",
} as const;
