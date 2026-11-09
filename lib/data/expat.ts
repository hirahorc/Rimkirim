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
      id: "Hampir semua barang pribadi: pakaian dan barang pribadi, buku, perlengkapan rumah dan dapur, alat olahraga dan hobi, sampai sepeda, dikemas dalam koper, kardus, atau kemasan khusus seperti bike box atau crate. Semua barang dikemas sendiri olehmu, termasuk furnitur, sesuai kriteria pengemasan kami. Elektronik, makanan, obat, suplemen, kosmetik, dan parfum perlu dikonfirmasi ke tim kami dulu.",
      en: "Almost any personal belonging: clothes and personal items, books, home and kitchen things, sports and hobby gear, even bikes, packed in suitcases, boxes or special packaging like a bike box or a crate. Everything travels packed by you, furniture included, to our packing criteria. Electronics, food, medicine, supplements, cosmetics and perfume need a check with our team first.",
    },
  },
  {
    // a deep link to the answer (ExpatFaq, openFaqItem)
    slug: "faq-cant-ship",
    q: { id: "Barang apa yang tidak boleh dikirim?", en: "What can't I ship?" },
    a: {
      id: "Alkohol, rokok dan vape, senjata dan bahan peledak, barang mudah terbakar, uang tunai, perhiasan, dan tanaman. Larangan impor Indonesia juga berlaku di semua jalur, termasuk pakaian bekas yang dikirim curah. Elektronik, makanan, obat, suplemen, kosmetik, dan parfum perlu dikonfirmasi dulu, karena aturannya tergantung barang dan rutenya. Ragu soal sesuatu? Tanya kami sebelum dikemas.",
      en: "Alcohol, cigarettes and vapes, weapons and explosives, anything flammable, cash, jewellery and plants. Indonesia's import bans apply on every route too, including used clothing sent in bulk. Electronics, food, medicine, supplements, cosmetics and perfume need a check with us first, since the rules depend on the item and the route. Not sure about something? Ask us before you pack it.",
    },
  },
  {
    q: { id: "Bisakah saya mengirim furnitur?", en: "Can I ship furniture?" },
    a: {
      id: "Bisa, kalau carrier partner kami punya layanannya, asal kamu mengemasnya sendiri: dikosongkan, dibongkar sebisa mungkin, dibungkus, lalu masuk kardus double wall atau crate kayu yang heat-treated dan berstempel ISPM 15. Ukur dan timbang setiap koli setelah dikemas, lalu kirim angkanya ke kami untuk konfirmasi harga. Sebagai barang pindahan, furnitur juga bebas bea.",
      en: "Yes, where our carrier partner offers it, as long as you pack it yourself: emptied, taken apart where you can, wrapped, and in a double-wall box or a wooden crate heat-treated and stamped ISPM 15. Measure and weigh each packed piece and send us the numbers to confirm the price. As relocation goods, furniture is duty-free too.",
    },
  },
  {
    q: { id: "Dokumen apa yang perlu disiapkan?", en: "What documents will I need?" },
    a: {
      id: "Tergantung jalur bea cukaimu. Sebagai barang pindahan: paspor, ITAS kerja atau belajar (berlaku 12 bulan atau lebih) beserta pengesahan kerja atau izin belajar, rincian barang, dan surat kuasa supaya kami bisa mengurus deklarasinya; WNI yang pulang membawa surat keterangan pindah dari KBRI atau KJRI sebagai ganti ITAS. Sebagai barang penumpang yang dikirim terpisah: paspor, data kedatangan, dan rincian barang dengan nilainya. Sebagai barang kiriman: paspor (atau NPWP) dan rincian barang dengan nilainya. Daftar pastinya kami konfirmasi bersama penawaran.",
      en: "It depends on how your things clear customs. As relocation goods: your passport, your work or study ITAS (valid 12 months or more) with your work approval or study permit, an itemised list of your goods, and a power of attorney so we can declare them for you; Indonesians moving home bring a moving letter from the embassy instead of the ITAS. As passenger goods sent separately: your passport, your arrival details and an itemised list with values. As a personal shipment: your passport (or NPWP) and an itemised list with values. We confirm the exact list with your quote.",
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
      id: "Tergantung jalurnya. Sebagai barang pindahan, dengan ITAS kerja atau belajar 12 bulan atau lebih, barang rumah tanggamu bebas bea masuk tanpa batas nilai. Sebagai barang penumpang yang dikirim terpisah, USD 500 pertama per orang per kedatangan bebas, dan kelebihannya kena bea masuk 10% plus PPN. Sebagai barang kiriman tidak ada pembebasan: sampai USD 1.500, tarif flat dari 0% (buku) sampai 25% (pakaian, tas, alas kaki, dan sepeda), plus PPN. Bea dan pajak dibayar ke bea cukai, tidak termasuk harga kami, dan kami beri tahu perkiraannya sebelum barang dikirim.",
      en: "It depends on the route. As relocation goods, with a work or study ITAS of 12 months or more, your household things are duty-free with no value limit. As passenger goods sent separately, the first USD 500 per person per arrival is free, and the amount above it pays 10% duty plus VAT. As a personal shipment there's no exemption: up to USD 1,500, flat rates from 0% (books) to 25% (clothes, bags, shoes and bikes), plus VAT. Duty and tax are paid to customs, not part of our price, and we tell you what to expect before anything ships.",
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
    "DRAFT dari update ops (6 Nov 2026), diselaraskan dengan dokumen ops 'Ringkasan Product Import Rimkirim' sebagai source of truth. Susunannya: (A) enam kartu barang yang paling sering dikirim, tiap kartu bisa dibuka; (B) 'What to pack it in' (koper & tas, kardus, kemasan khusus) di bawah aturan harga per koli, lalu panduan mengemas furnitur langkah demi langkah (bagian 10 dokumen ops); (C) 'Before you send': yang perlu konfirmasi dulu di samping yang tidak boleh dikirim. Dari dokumen ops: kartu Pakaian sekarang menyebut pakaian bekas curah (HS 6309) dilarang, jadi pakaian dikemas dilipat, jumlah wajar, dan dicatat per kardus; buku bea masuk 0% dan tanpa PPh untuk semua buku lewat barang kiriman, bukan hanya buku ilmu pengetahuan; furnitur bisa dikirim kalau 3PL punya layanannya dan customer mengemas sendiri. Yang perlu dikonfirmasi: (1) dua angka [X] dari dokumen ops sebelumnya masih diisi dari tabel surcharge: sisi terpanjang 121 cm dan 25 kg per kardus (di engine, 25 kg ambang biaya overweight, bukan batas); (2) repack di gudang dengan biaya tambahan tidak ada di dokumen import, yang bilang customer mengemas sendiri; (3) biaya tambahan furnitur ('menyusul' di dokumen ops) belum ditampilkan; (4) Panduan Packing Sepeda belum ada di situs, jadi tombolnya meminta panduan lewat WhatsApp; (5) tombol 'Cek Harga' mengarah ke kalkulator relocation (EXPAT_QUOTE_URL); (6) daftar 'Not allowed' (alkohol, rokok & vape, senjata & bahan peledak, barang mudah terbakar, uang tunai, perhiasan, tanaman) belum ada di dokumen mana pun: dokumen import hanya menyebut Barang Dilarang Impor (Permendag 47/2025, termasuk HS 6309), barang kena cukai yang tidak bebas bea, dan 11 jenis barang di Pasal 42 ayat (8) yang belum dirinci. Pastikan daftar ini, mungkin dari aturan carrier. Ilustrasi tiap kartu adalah gambar, bukan foto kiriman asli.",
  coordinate:
    "Konfirmasi pembagian tugas. Dokumen untuk barang pindahan sekarang mengikuti dokumen ops 'Ringkasan Product Import Rimkirim': ITAS kerja atau belajar berlaku 12 bulan atau lebih, plus pengesahan kerja atau izin belajar (WNA), atau surat keterangan pindah dari KBRI/KJRI (WNI); 'Who does what' hanya menyebut ITAS untuk jalur bebas bea. Foto pickup adalah kiriman customer asli: pastikan ada izin customer. Wajah kurir, plat nomor, dan label AWB sudah disensor mosaik. Ilustrasi chat WhatsApp di iPhone (di samping daftar) adalah contoh: konfirmasi alurnya (tim minta paspor dan izin tinggal, mengirim packing list untuk diisi bersama, lalu menjadwalkan pickup dengan rentang jam).",
  compare:
    "Usulan agency (04b), copy menunggu verifikasi ops: terutama 'estimasi dengan rincian biaya sebelum memesan', 'kabar status di setiap tahap, termasuk clearance', dan pendampingan personal. Kompetitor tidak disebut, dan packing sengaja tidak dibandingkan (dibahas di How it works). Kolom 'opsi umum' diriset dari halaman publik jasa kirim bagasi dan perusahaan pindahan internasional (2026-10-29). Klaim Rimkirim yang perlu dikonfirmasi: antar sampai pintu di semua kota tujuan (termasuk kota yang belum terlayani domestik seperti Makassar), customer tidak perlu datang ke bea cukai, dan kabar status lewat WhatsApp di setiap tahap.",
  pricing:
    "Ambang 25 kg dan ±120 cm diambil dari engine surcharge (dokumen carrier). Modal Surcharge Information sama dengan di situs utama (FedEx/DHL/UPS + biaya logistik lain). Konfirmasi semuanya berlaku untuk rute expat, terutama surcharge packaging untuk koper yang kini disebut di copy. Ilustrasi kalkulator memakai angka hitungan asli (60×40×40 ÷ 5000 = 19,2 kg; 75×50×30 ÷ 5000 = 22,5 kg), tapi label kolomnya (Real, By size, Charged) diambil dari kalkulator situs utama: sesuaikan kalau kalkulator relocation memakai label lain.",
  customs:
    "Diselaraskan dengan dokumen ops 'Ringkasan Product Import Rimkirim' (source of truth): tiga jalur, yaitu barang pindahan (PMK 25/2025), barang penumpang yang dikirim terpisah (PMK 203/2017 jo. PMK 34/2025), dan barang kiriman pribadi (PMK 4/2025), plus tabel tarif barang kiriman jalur CN sampai USD 1.500 (bagian 7). Dihapus karena tidak ada di dokumen: syarat 'barang terpakai', 'barang baru tidak bebas bea', 'boleh tiba 90 hari sebelum', kulkas/freezer/AC diblokir (dokumen: pindahan dan penumpang dikecualikan dari API/PI/LS lewat Permendag 16/2025 Pasal 42 ayat 4), dan tiket pesawat di daftar dokumen. Masih perlu dicek: (1) jendela waktu barang penumpang unaccompanied terhadap kedatangan (dokumen menandainya), jadi halaman hanya bilang 'tiba berdekatan dengan kedatanganmu'; (2) apakah barang yang dibawa sendiri dan yang dikirim terpisah berbagi jatah USD 500; (3) PPN barang pindahan untuk WNA (dokumen: cakupan WNA perlu dicek), jadi halaman hanya menjanjikan bebas bea masuk, bukan bebas pajak; (4) 'surat pindah' di lampiran PIBK untuk WNA, yang di halaman hanya disebut untuk WNI; (5) dokumen barang penumpang (paspor, data kedatangan, rincian dengan nilai) disimpulkan dari syaratnya, belum tertulis di dokumen; (6) tarif PPh tanpa NPWP; (7) 'sekitar 22% dari kelebihan' dihitung dari BM 10% + PPN 11% atas (kelebihan + BM), cocok dengan contoh USD 800 di dokumen; (8) pajak buku selain PPh (PPN) tidak disebut di dokumen, jadi tabel hanya menulis 'tanpa PPh'.",
  steps:
    "Brief: Rimkirim konfirmasi urutan langkah yang sebenarnya. Ilustrasi tiap langkah adalah contoh, bukan data asli: konfirmasi nama dokumen di checklist (Passport copy, Packing list, Visa or stay permit) dan contoh pesan WhatsApp soal jadwal antar.",
  examples:
    "Section 07 (contoh pengiriman nyata) disembunyikan sampai ada contoh asli: asal, jenis barang, komentar, foto. Isi SHIPMENT_EXAMPLES di lib/data/expat.ts.",
  closing:
    "Tiap langkah 'What happens next' punya ilustrasi layar (contoh, bukan data asli): kartu estimasi (harga sengaja tidak ditampilkan), pertanyaan kelayakan 'Are you shipping personal belongings to Indonesia?' diambil dari kuesioner Back For Good, dan '1 of 3 answered' adalah contoh: konfirmasi pertanyaan dan jumlahnya di kalkulator relocation. Pesan WhatsApp juga contoh.",
  faq: "Brief: semua jawaban wajib disetujui Rimkirim, terutama bea cukai & pengantaran. Waktu 4–8 hari + 4–10 hari kerja diambil dari FAQ & artikel yang sudah ada.",
} as const;
