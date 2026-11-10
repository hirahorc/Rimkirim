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
    q: { id: "Bagaimana cara memesan?", en: "How do I book?" },
    a: {
      id: "Cek tarifmu dulu: pilih dari mana dan ke mana kamu pindah serta perkiraan beratnya, dan estimasinya langsung muncul. Pilih opsi pengiriman, jawab empat pertanyaan singkat tentang kepindahanmu, lalu isi data dirimu. Ringkasan pesanan kami kirim lewat email. Setelah itu tim kami memeriksa packing list bersamamu dan mengirim quotation.",
      en: "Check your rate first: pick where you're moving from and to and roughly what it weighs, and see an estimate straight away. Choose a shipping option, answer four quick questions about your move, and add your details. You'll get a booking summary by email. Our team then goes through your packing list with you and sends your quotation.",
    },
  },
  {
    q: { id: "Barang apa saja yang bisa dikirim?", en: "What can I ship?" },
    a: {
      id: "Hampir semua barang pribadi: pakaian dan barang pribadi, buku, perlengkapan rumah dan dapur, serta alat olahraga dan hobi, dikemas dalam koper, kardus, atau kemasan khusus seperti hard case atau crate. Semua barang dikemas sendiri olehmu, termasuk furnitur, sesuai panduan pengemasan kami. Elektronik, makanan, obat, suplemen, kosmetik, dan parfum perlu dikonfirmasi ke tim kami dulu.",
      en: "Almost any personal belonging: clothes and personal items, books, home and kitchen things, and sports and hobby gear, packed in suitcases, boxes or special packaging like a hard case or a crate. Everything travels packed by you, furniture included, to our packing guide. Electronics, food, medicine, supplements, cosmetics and perfume need a check with our team first.",
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
    q: { id: "Apakah Rimkirim bisa mengemas barang saya?", en: "Do you pack my belongings?" },
    a: {
      id: "Tidak. Semua barang kamu kemas sendiri sebelum pickup, termasuk furnitur, mengikuti panduan pengemasan kami. Kami tidak mengemas atau repack, baik di rumahmu maupun di gudang kami. Kalau ada barang yang tiba rusak dan kemasannya tidak sesuai panduan, klaimnya tidak bisa diganti sesuai nilai yang kamu deklarasikan.",
      en: "No. You pack everything yourself before pickup, furniture included, following our packing guide. We don't pack or repack, at your door or at our warehouse. If something arrives damaged and wasn't packed to the guide, it can't be claimed at the value you declared.",
    },
  },
  {
    q: { id: "Bisakah saya mengirim furnitur?", en: "Can I ship furniture?" },
    a: {
      id: "Bisa, kalau carrier partner kami punya layanannya. Seperti barang lainnya, kamu yang mengemasnya: dikosongkan, dibongkar sebisa mungkin, dibungkus, lalu masuk kardus double wall atau crate kayu yang heat-treated dan berstempel ISPM 15. Ukur dan timbang setiap koli setelah dikemas, lalu kirim angkanya ke kami untuk konfirmasi harga. Sebagai barang pindahan, furnitur juga bebas bea.",
      en: "Yes, where our carrier partner offers it. Like everything else, you pack it yourself: emptied, taken apart where you can, wrapped, and in a double-wall box or a wooden crate heat-treated and stamped ISPM 15. Measure and weigh each packed piece and send us the numbers to confirm the price. As relocation goods, furniture is duty-free too.",
    },
  },
  {
    q: { id: "Dokumen apa yang perlu disiapkan?", en: "What documents will I need?" },
    a: {
      id: "Tergantung jalur bea cukaimu. Ini kebutuhan tiap jalur. Saat mereview pesananmu, kalau dokumenmu cocok untuk jalur yang lebih menguntungkan, kami tunjukkan dan beri tahu apa yang kurang. Keputusannya selalu di kamu. Sebagai barang pindahan: paspor, ITAS kerja atau belajar (berlaku 12 bulan atau lebih) beserta pengesahan kerja atau izin belajar, commercial invoice/packing list dengan nilai tiap barang, dan surat kuasa supaya kami bisa mendeklarasikannya atas namamu. Sebagai barang penumpang yang dikirim terpisah: paspor, tanggal kedatangan dan detail penerbangan, serta commercial invoice/packing list dengan nilai tiap barang. Sebagai barang kiriman pribadi: paspor atau NPWP, serta commercial invoice/packing list dengan nilai tiap barang. Jalur mana pun, template commercial invoice/packing list-nya kami kirimkan. Sesekali bea cukai meminta dokumen tambahan. Kalau itu terjadi, kami kabari.",
      en: "It depends on how your things clear customs. Here's what each way needs. When we review your booking, if your documents fit a way that saves you more, we'll point it out and tell you what's missing. The choice is always yours. As relocation goods: your passport, your work or study ITAS (valid 12 months or more) with your work approval or study permit, a commercial invoice/packing list with each item's value, and a power of attorney so we can declare on your behalf. As passenger goods sent separately: your passport, your arrival date and flight details, and a commercial invoice/packing list with each item's value. As a personal shipment: your passport or NPWP, and a commercial invoice/packing list with each item's value. Whichever way it goes, we'll send you a template for the commercial invoice/packing list. Customs may occasionally ask for additional documents. We'll let you know if they do.",
    },
  },
  {
    q: { id: "Bagaimana harga dihitung?", en: "How is the price worked out?" },
    a: {
      id: "Dari rute dan berat tiap barang. Kardus besar tapi ringan dihitung dari ukurannya (panjang × lebar × tinggi ÷ 5000), mana yang lebih besar. Barang yang terlalu besar atau sangat berat bisa kena biaya penanganan tambahan. Tarif saat cek tarif adalah estimasi. Harga finalnya ada di invoice, setelah paketmu tiba di gudang kami dan kami ukur serta timbang ulang.",
      en: "From your route and the weight of each piece. A big but light box is priced by its size instead (length × width × height ÷ 5000), whichever is higher. Oversized or very heavy pieces can carry an extra handling charge. The rate you see when you check is an estimate. Your final price is on your invoice, once your packages reach our warehouse and we've measured and weighed them again.",
    },
  },
  {
    q: { id: "Apakah ada bea atau pajak impor?", en: "Do I pay import duty or tax?" },
    a: {
      id: "Tergantung jalurnya. Sebagai barang pindahan, dengan ITAS kerja atau belajar 12 bulan atau lebih, barang rumah tanggamu bebas bea masuk tanpa batas nilai. Sebagai barang penumpang yang dikirim terpisah, USD 500 pertama per orang per kedatangan bebas, dan kelebihannya kena bea masuk 10% plus PPN. Sebagai barang kiriman pribadi tidak ada pembebasan: sampai USD 1.500, tarif flat dari 0% (buku cetak) sampai 25% (pakaian, tas, dan alas kaki), plus PPN, dan tanpa NPWP beberapa barang kena tarif PPh yang lebih tinggi. Harga kami mencakup ongkos kirim; bea dan pajak ditetapkan oleh Bea Cukai Indonesia dan ditagihkan terpisah. Kamu tidak perlu memilih jalur sekarang: saat mereview pesananmu, kami tunjukkan jalur yang paling menguntungkan, dan keputusannya di kamu. Dari packing list-mu, kami beri tahu barang yang kemungkinan kena pajak, supaya bisa kamu keluarkan kalau mau.",
      en: "It depends on the route. As relocation goods, with a work or study ITAS of 12 months or more, your household things are duty-free with no value limit. As passenger goods sent separately, the first USD 500 per person per arrival is free, and the amount above it pays 10% duty plus VAT. As a personal shipment there's no duty-free allowance: up to USD 1,500, flat rates from 0% (printed books) to 25% (clothes, bags and shoes), plus VAT, and without an NPWP some items carry a higher income tax rate. Our price covers shipping; any duties and taxes are set by Indonesian Customs and charged separately. You don't need to choose a way now: when we review your booking, we'll point out the one that saves you the most, and the choice is yours. From your packing list, we tell you what's likely to be taxed, so you can leave it out if you'd rather.",
    },
  },
  {
    q: { id: "Berapa lama pengirimannya?", en: "How long does it take?" },
    a: {
      id: "Lewat udara dari Eropa, biasanya sekitar 4–8 hari perjalanan, ditambah sekitar 4–10 hari kerja untuk clearance di Indonesia. Jauh lebih cepat daripada kargo laut, yang biasanya butuh lima sampai enam minggu di laut saja. Estimasi untuk rutemu tampil saat kamu cek tarif.",
      en: "By air from Europe, usually around 4–8 days in transit, plus about 4–10 working days for customs clearance in Indonesia. That's much faster than sea freight, which usually spends five to six weeks at sea alone. You'll see the estimate for your route when you check your rate.",
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
 * Where every "Check your rate" on the expat page goes: the order flow's
 * first step, Check Rate (docs/expat-order-flow.md), which runs on to the
 * Eligibility Check, Personal Information and the Booking Summary.
 */
export const EXPAT_QUOTE_URL = "/expat-relocation/rates";

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
  cta: "Semua 'Check your rate' mengarah ke order flow di situs ini (/expat-relocation/rates): Check Rate, Eligibility Check, data diri, lalu Booking Summary dan email. Data harga, alamat, peta, dan pengiriman email masih dummy; lihat docs/expat-order-flow.md. Semua link WhatsApp sudah ke nomor live (+62 817 1717 7008).",
  reviews:
    "Ulasan Leticia Marina Bevilaqua (Inggris Raya ke Indonesia) adalah ulasan expat asli pertama. Ulasan ditampilkan utuh atas permintaan customer, dan dipotong dengan tombol 'Read more' di kartunya. Leticia tidak ingin memakai foto, jadi kartunya tanpa foto. Tiga ulasan lainnya masih placeholder dari WNI yang pulang, bukan expat, dan akan diganti ulasan asli dari customer expat yang sedang di-approach (EXPAT_REVIEWS di lib/data/expat.ts). Kartu pertama menunggu foto asli customer: isi `photo` dengan path fotonya (dengan izin). Selama belum ada foto, slot 'Photo to add' tampil di tempatnya untuk semua pengunjung, karena kartu foto tinggi itu bagian dari desain. Rating bintang dan link Google sengaja dihapus karena belum ada ulasan expat di Google.",
  ship:
    "DRAFT dari update ops (6 Nov 2026), diselaraskan dengan dokumen ops 'Ringkasan Product Import Rimkirim' sebagai source of truth. Susunannya: (A) lima tile barang yang paling sering dikirim, disusun sebagai bento (Pakaian dua kolom sebagai hero), tiap tile bisa dibuka (kartu Sepeda dihapus atas feedback Alvin, 10 Nov 2026: kemungkinan besar sepeda tidak bisa dikirim; sepeda juga dihapus dari FAQ, panduan pengemasan, dan tabel tarif); (B) 'How to pack your belongings', panduan pengemasan yang dituju link di order flow (#packing): customer mengemas semua barangnya sendiri, termasuk furnitur, lalu koper & tas, kardus, kemasan khusus di bawah aturan harga per koli, satu baris soal klaim, lalu panduan mengemas furnitur langkah demi langkah (bagian 10 dokumen ops); (C) 'Before you send': yang perlu konfirmasi dulu di samping yang tidak boleh dikirim. Dari dokumen ops: kartu Pakaian sekarang menyebut pakaian bekas curah (HS 6309) dilarang, jadi pakaian dikemas dilipat, jumlah wajar, dan dicatat per kardus; buku bea masuk 0% dan tanpa PPh untuk semua buku lewat barang kiriman, bukan hanya buku ilmu pengetahuan (revisi Alvin, 10 Nov 2026: buku cetak, dan PPN mungkin tetap berlaku tergantung jenis bukunya); furnitur bisa dikirim kalau 3PL punya layanannya dan customer mengemas sendiri. Yang perlu dikonfirmasi: (1) dua angka [X] dari dokumen ops sebelumnya masih diisi dari tabel surcharge: sisi terpanjang 121 cm dan 25 kg per kardus (di engine, 25 kg ambang biaya overweight, bukan batas); (2) dikonfirmasi tim (9 Nov 2026): tidak ada repack di gudang, semua barang dikemas customer, dan barang yang kemasannya tidak sesuai panduan tidak ditolak saat pickup, tapi kalau rusak tidak bisa diklaim sesuai nilai yang dideklarasikan. Panduan pengemasan Rimkirim dibuat dari packing guidelines FedEx: isi koper, kardus, dan kemasan khusus belum dicocokkan dengan dokumen itu; (3) biaya tambahan furnitur ('menyusul' di dokumen ops) belum ditampilkan; (4) tombol 'Cek Harga' mengarah ke kalkulator relocation (EXPAT_QUOTE_URL); (5) daftar 'Not allowed' (alkohol, rokok & vape, senjata & bahan peledak, barang mudah terbakar, uang tunai, perhiasan, tanaman) belum ada di dokumen mana pun: dokumen import hanya menyebut Barang Dilarang Impor (Permendag 47/2025, termasuk HS 6309), barang kena cukai yang tidak bebas bea, dan 11 jenis barang di Pasal 42 ayat (8) yang belum dirinci. Pastikan daftar ini, mungkin dari aturan carrier. Gambar di tiap tile adalah ilustrasi contoh, bukan foto kiriman asli: isi paket di tile Pakaian (Winter coats 3, Jeans 5, Trainers 2) dan pertanyaan di tile Barang lainnya (teleskop, piringan hitam, mesin kopi, mesin jahit) bukan data ops; mesin kopi dan mesin jahit memang elektronik yang perlu dicek dulu, sesuai pesan tile itu. Angka 0% di tile Buku dibaca langsung dari tabel tarif bea cukai, jadi keduanya selalu sama.",
  coordinate:
    "Konfirmasi pembagian tugas. Dokumen untuk barang pindahan sekarang mengikuti dokumen ops 'Ringkasan Product Import Rimkirim': ITAS kerja atau belajar berlaku 12 bulan atau lebih, plus pengesahan kerja atau izin belajar; 'Who does what' hanya menyebut ITAS untuk jalur bebas bea. Foto pickup adalah kiriman customer asli: pastikan ada izin customer. Wajah kurir, plat nomor, dan label AWB sudah disensor mosaik. Ilustrasi chat WhatsApp di iPhone (di samping daftar) adalah contoh, mengikuti order flow baru: tim sudah mereview packing list, meminta wine dikeluarkan dan memberi tahu HP baru kemungkinan kena pajak, lalu mengonfirmasi pickup di tanggal yang dipilih customer saat order, dengan rentang jam. Konfirmasi alurnya.",
  compare:
    "Usulan agency (04b), copy menunggu verifikasi ops: terutama 'estimasi dengan rincian biaya sebelum memesan', 'kabar status di setiap tahap, termasuk clearance', dan pendampingan personal. Kompetitor tidak disebut, dan packing sengaja tidak dibandingkan (dibahas di How it works). Kolom 'opsi umum' diriset dari halaman publik jasa kirim bagasi dan perusahaan pindahan internasional (2026-10-29). Klaim Rimkirim yang perlu dikonfirmasi: antar sampai pintu di semua kota tujuan (termasuk kota yang belum terlayani domestik seperti Makassar), customer tidak perlu datang ke bea cukai, dan kabar status lewat WhatsApp di setiap tahap.",
  pricing:
    "Ambang 25 kg dan ±120 cm diambil dari engine surcharge (dokumen carrier). Modal Surcharge Information sama dengan di situs utama (FedEx/DHL/UPS + biaya logistik lain). Konfirmasi semuanya berlaku untuk rute expat, terutama surcharge packaging untuk koper yang kini disebut di copy. Ilustrasi kini menggambarkan penimbangan di gudang ('Weighed at our warehouse'), karena Check Rate expat hanya menanyakan berat: angka hitungannya asli (60×40×40 ÷ 5000 = 19,2 kg; 75×50×30 ÷ 5000 = 22,5 kg), label kolomnya (Real, By size, Charged) dari kalkulator situs utama.",
  customs:
    "Diselaraskan dengan dokumen ops 'Ringkasan Product Import Rimkirim' (source of truth): tiga jalur, yaitu barang pindahan (PMK 25/2025), barang penumpang yang dikirim terpisah (PMK 203/2017 jo. PMK 34/2025), dan barang kiriman pribadi (PMK 4/2025), plus tabel tarif barang kiriman jalur CN sampai USD 1.500 (bagian 7). Revisi Alvin (10 Nov 2026): kartu barang pindahan mengikuti narasinya (barang rumah tangga dalam jumlah wajar, tiba 90 hari sebelum atau sesudah kedatangan, commercial invoice/packing list dengan template dari kami, kendaraan dan barang kena cukai tidak termasuk); kalimat WNI yang pulang dengan surat pindah dihapus karena layanan ini untuk WNA; daftar dokumen kini 'Documents needed', dengan satu baris di bawah ketiga kartu bahwa bea cukai sesekali meminta dokumen tambahan; buku di tabel tarif kini 'buku cetak', tanpa PPh dan PPN mungkin berlaku. Revisi Alvin kedua (10 Nov 2026): kartu barang penumpang dan barang kiriman pribadi juga mengikuti narasinya. Penumpang: bebas bea dan pajak sampai USD 500, di atasnya BM 10% plus PPN atas kelebihannya, dokumen paspor, tanggal kedatangan dan detail penerbangan, serta commercial invoice/packing list. Kiriman pribadi (nama jalurnya kini 'Barang Kiriman Pribadi'): tanpa pembebasan, tarif flat 0% sampai 25% plus PPN, paspor atau NPWP, commercial invoice/packing list, harga kami hanya ongkos kirim, PPh lebih tinggi tanpa NPWP. Ketiga kartu kini memuat aturannya sendiri, jadi blok 'Good to know' dihapus: 90 hari dan pengecualian kendaraan serta barang kena cukai ada di kartu barang pindahan, larangan pakaian bekas curah ada di kartu Pakaian dan FAQ. Catatan di bawah tabel tarif tidak lagi mengulang kalimat NPWP dan 'bea cukai menetapkan bea final'. Di kartu, '(template-nya kami kirimkan)' tampil sebagai baris kecil di bawah nama dokumennya. Dihapus karena tidak ada di dokumen: syarat 'barang terpakai', 'barang baru tidak bebas bea', kulkas/freezer/AC diblokir (dokumen: pindahan dan penumpang dikecualikan dari API/PI/LS lewat Permendag 16/2025 Pasal 42 ayat 4), dan tiket pesawat di daftar dokumen. Masih perlu dicek: (1) jendela waktu barang penumpang unaccompanied terhadap kedatangan (dokumen menandainya), jadi halaman hanya bilang 'diatur sesuai waktu kedatanganmu'; (2) apakah barang yang dibawa sendiri dan yang dikirim terpisah berbagi jatah USD 500; (3) PPN barang pindahan untuk WNA (dokumen: cakupan WNA perlu dicek), jadi halaman hanya menjanjikan bebas bea masuk, bukan bebas pajak; (4) tarif PPh tanpa NPWP (kartu hanya bilang 'lebih tinggi'); (5) 'sekitar 22% dari kelebihan' dihitung dari BM 10% + PPN 11% atas (kelebihan + BM), cocok dengan contoh USD 800 di dokumen; (6) template commercial invoice/packing list: dokumen terpisah yang kami kirim, atau dibuat dari data paket yang customer isi di order flow (langkah Packages, kode RKPL)?; (7) 'ditagihkan terpisah': bea dan pajak ditagih Rimkirim di invoice, atau customer membayar langsung ke bea cukai?",
  steps:
    "Urutan langkah mengikuti order flow baru: Check Rate, review packing list dan dokumen oleh tim lalu quotation (masih estimasi), pickup, lalu invoice dengan harga final setelah paket diukur dan ditimbang ulang di gudang. Ilustrasi adalah contoh: langkah 01 memakai kartu rate asli dari flow (tarif dummy), langkah 02 contoh review packing list (wine dikeluarkan, HP baru kemungkinan kena pajak).",
  examples:
    "Section 07 (contoh pengiriman nyata) disembunyikan sampai ada contoh asli: asal, jenis barang, komentar, foto. Isi SHIPMENT_EXAMPLES di lib/data/expat.ts.",
  closing:
    "Tiap langkah 'What happens next' menampilkan layar order flow yang asli, digambar oleh komponennya sendiri dengan data contoh: kartu Special Rate dari Inggris untuk 30 kg (tarif dummy), pertanyaan pertama Eligibility Check, dan kepala tiket Booking Summary dengan nomor dan email contoh.",
  faq: "Brief: semua jawaban wajib disetujui Rimkirim, terutama bea cukai & pengantaran. Waktu 4–8 hari + 4–10 hari kerja diambil dari FAQ & artikel yang sudah ada.",
} as const;
