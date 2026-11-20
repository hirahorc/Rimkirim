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
import { DOMESTIC_DELIVERY_ROWS } from "@/lib/data/delivery-times";
import { resolveExtras, type AnswerExtras, type AnswerExtrasSource } from "@/lib/data/faq";

interface Txt {
  id: string;
  en: string;
}

/** an answer can carry a list, a table, a closing paragraph and a link, as /faq's do */
interface ExpatFaqSource extends AnswerExtrasSource {
  /** the question's anchor, for a question the page links to */
  slug?: string;
  q: Txt;
  a: Txt;
  /** points under the answer's paragraph, before what follows it */
  list?: Txt[];
}

export interface ExpatFaq extends AnswerExtras {
  slug?: string;
  q: string;
  a: string;
  list?: string[];
}

/**
 * Where every "Check your rate" on the expat page goes: the order flow's
 * start, Check Rate (docs/expat-order-flow.md), which runs on to the plan
 * (the Eligibility Check, Personal Information, the Packages) and the
 * Booking Summary. Above the FAQ, which links to it.
 */
export const EXPAT_QUOTE_URL = "/expat-relocation/rates";
/** the whole answer on packages being opened, until a page of its own is
 *  written: the FAQ's, which opens itself at its slug (ExpatFaq) */
export const EXPAT_INSPECTION_URL = "/expat-relocation#faq-inspection";

const FAQ: ExpatFaqSource[] = [
  {
    q: { id: "Bagaimana cara memesan?", en: "How do I book?" },
    a: {
      id: "Cek tarifmu dulu: pilih dari mana dan ke mana kamu pindah serta perkiraan beratnya, dan estimasinya langsung muncul. Pilih opsi pengiriman, jawab empat pertanyaan singkat tentang kepindahanmu, lalu isi data dirimu. Ringkasan pesanan kami kirim lewat email. Setelah itu tim kami memeriksa packing list-mu dan mengirim quotation.",
      en: "Check your rate first: pick where you're moving from and to and roughly what it weighs, and see an estimate straight away. Choose a shipping option, answer four quick questions about your move, and add your details. You'll get a booking summary by email. Our team then reviews your packing list and sends your quotation.",
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
      id: "Alkohol, rokok dan vape, senjata dan bahan peledak, barang mudah terbakar, uang tunai, perhiasan, tanaman, dan kendaraan bermotor. Larangan impor Indonesia juga berlaku di semua jalur, termasuk pakaian bekas yang dikirim curah. Elektronik, makanan, obat, suplemen, kosmetik, dan parfum perlu dikonfirmasi dulu, karena aturannya tergantung barang dan rutenya. Ragu soal sesuatu? Tanya kami sebelum dikemas.",
      en: "Alcohol, cigarettes and vapes, weapons and explosives, anything flammable, cash, jewellery, plants and motor vehicles. Indonesia's import bans apply on every route too, including used clothing sent in bulk. Electronics, food, medicine, supplements, cosmetics and perfume need a check with us first, since the rules depend on the item and the route. Not sure about something? Ask us before you pack it.",
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
      id: "Bisa, kalau carrier partner kami punya layanannya. Seperti barang lainnya, kamu yang mengemasnya: dikosongkan, dibongkar sebisa mungkin, dibungkus, lalu masuk kardus double wall atau crate kayu yang heat-treated dan berstempel ISPM 15. Sebagai barang pindahan, furnitur juga bebas bea.",
      en: "Yes, where our carrier partner offers it. Like everything else, you pack it yourself: emptied, taken apart where you can, wrapped, and in a double-wall box or a wooden crate heat-treated and stamped ISPM 15. As relocation goods, furniture is duty-free too.",
    },
  },
  {
    q: { id: "Dokumen apa yang perlu disiapkan?", en: "What documents will I need?" },
    a: {
      id: "Tergantung jalur bea cukaimu. Ini kebutuhan tiap jalur. Kami mereview pesananmu dulu, lalu merekomendasikan jalur yang paling cocok untukmu dan meminta dokumennya. Keputusannya selalu di kamu. Sebagai barang pindahan: paspor, ITAS kerja atau belajar (berlaku 12 bulan atau lebih) beserta pengesahan kerja atau izin belajar, commercial invoice/packing list dengan nilai tiap barang, dan surat kuasa supaya kami bisa mendeklarasikannya atas namamu. Sebagai barang penumpang yang dikirim terpisah: paspor, tanggal kedatangan dan detail penerbangan, serta commercial invoice/packing list dengan nilai tiap barang. Sebagai barang kiriman pribadi: paspor atau NPWP, serta commercial invoice/packing list dengan nilai tiap barang. Sesekali bea cukai meminta dokumen tambahan. Kalau itu terjadi, kami kabari.",
      en: "It depends on how your things clear customs. Here's what each way needs. We review your booking first, then recommend the way that suits you best and ask for its documents. The choice is always yours. As relocation goods: your passport, your work or study ITAS (valid 12 months or more) with your work approval or study permit, a commercial invoice/packing list with each item's value, and a power of attorney so we can declare on your behalf. As passenger goods sent separately: your passport, your arrival date and flight details, and a commercial invoice/packing list with each item's value. As a personal shipment: your passport or NPWP, and a commercial invoice/packing list with each item's value. Customs may occasionally ask for additional documents. We'll let you know if they do.",
    },
  },
  {
    q: { id: "Bagaimana harga dihitung?", en: "How is the price worked out?" },
    a: {
      id: "Chargeable weight × tarif per kilo untuk rutemu. Chargeable weight tiap barang adalah yang lebih besar antara berat aktual dan berat volumetriknya (panjang × lebar × tinggi dalam cm ÷ 5000). Barang yang sangat berat, terlalu besar, atau tidak dikemas dalam kardus polos kena surcharge penanganan. Tarif saat cek tarif adalah estimasi, belum termasuk surcharge. Harga finalnya ada di invoice, setelah paketmu tiba di gudang kami di Indonesia.",
      en: "Chargeable weight × the rate per kilo for your route. Each piece's chargeable weight is the higher of its actual weight and its volumetric weight (length × width × height in cm ÷ 5000). A piece that's very heavy, oversized or not in a plain cardboard box adds a handling surcharge. The rate you see when you check is an estimate, before surcharges. Your final price is on your invoice once your packages reach our warehouse in Indonesia.",
    },
  },
  {
    q: { id: "Apakah ada bea atau pajak impor?", en: "Do I pay import duty or tax?" },
    a: {
      id: "Tergantung jalurnya. Sebagai barang pindahan, dengan ITAS kerja atau belajar 12 bulan atau lebih, barang rumah tanggamu bebas bea masuk tanpa batas nilai. Sebagai barang penumpang yang dikirim terpisah, USD 500 pertama per orang per kedatangan bebas, dan kelebihannya kena bea masuk 10% plus PPN. Sebagai barang kiriman pribadi tidak ada pembebasan: sampai USD 1.500, tarif flat dari 0% (buku cetak) sampai 25% (pakaian, tas, dan alas kaki), plus PPN, dan tanpa NPWP beberapa barang kena tarif PPh yang lebih tinggi. Harga kami mencakup ongkos kirim; bea dan pajak ditetapkan oleh Bea Cukai Indonesia dan ditagihkan terpisah. Kamu tidak perlu memilih jalur sekarang: saat mereview pesananmu, kami tunjukkan jalur yang paling menguntungkan, dan keputusannya di kamu. Dari packing list-mu, kami beri tahu barang yang kemungkinan kena pajak, supaya bisa kamu keluarkan kalau mau.",
      en: "It depends on the route. As relocation goods, with a work or study ITAS of 12 months or more, your household things are duty-free with no value limit. As passenger goods sent separately, the first USD 500 per person per arrival is free, and the amount above it pays 10% duty plus VAT. As a personal shipment there's no duty-free allowance: up to USD 1,500, flat rates from 0% (printed books) to 25% (clothes, bags and shoes), plus VAT, and without an NPWP some items carry a higher income tax rate. Our price covers shipping; any duties and taxes are set by Indonesian Customs and charged separately. You don't need to choose a way now: when we review your booking, we'll point out the one that saves you the most, and the choice is yours. From your packing list, we tell you what's likely to be taxed, so you can leave it out if you'd rather.",
    },
  },
  // physical inspection, from ops' brief "Pemeriksaan Fisik Barang Impor"
  // (2026-11-20), in three questions; the first is where the order flow
  // links (EXPAT_INSPECTION_URL). Who closes the package and the damage
  // claim are Hira's (2026-11-18)
  {
    slug: "faq-inspection",
    q: { id: "Apakah paket saya bisa dibuka?", en: "Can my packages be opened?" },
    a: {
      id: "Bisa. Setiap kiriman yang masuk ke Indonesia bisa diperiksa fisik oleh Bea Cukai: paketnya dibuka dan isinya dicocokkan dengan dokumennya, yaitu jenis, jumlah, kondisi, dan nilainya. Tidak semua kiriman dibuka, tapi tidak ada yang bisa menjamin kiriman tidak dibuka, termasuk kami dan kurirnya, karena Bea Cukai memilih kiriman satu per satu berdasarkan risiko, dan sebagian secara acak. Kiriman yang sebelumnya lolos tanpa dibuka belum tentu lolos lagi. Dibuka bukan berarti ada masalah, dan pemeriksaan ini tidak menentukan bea masuk dan pajakmu, yang dihitung terpisah.",
      en: "Yes. Customs can physically inspect any shipment coming into Indonesia: the package is opened and what's inside is checked against its documents, for type, quantity, condition and value. Not every shipment is opened, but no one can rule it out, not us and not the courier, because customs picks shipments one by one, on risk and partly at random. A shipment that went through unopened before may be opened next time. Being opened doesn't mean anything's wrong, and it isn't what sets your duty and tax, which are worked out separately.",
    },
  },
  {
    slug: "faq-inspection-likely",
    q: { id: "Apa yang membuat paket lebih mungkin diperiksa?", en: "What makes an inspection more likely?" },
    a: {
      id: "Bea Cukai menilai setiap kiriman dari dokumennya, jenis barangnya, profil importir dan barangnya, serta hasil X-ray-nya, dan sebagian dipilih secara acak. Penilaiannya per kiriman, bukan per orang. Sebuah kiriman lebih mungkin dibuka kalau:",
      en: "Customs weighs each shipment's documents, the kind of goods, the importer's and the goods' profiles and the X-ray, and picks some at random. It's judged shipment by shipment, not person by person. A shipment is more likely to be opened when:",
    },
    list: [
      { id: "uraian, jenis, atau nilai barangnya tidak jelas", en: "what's inside, its type or its value isn't clear" },
      {
        id: "jumlah atau jenis barangnya diduga tidak sesuai dengan dokumen atau hasil X-ray",
        en: "the count or kind of goods doesn't seem to match the documents or the X-ray",
      },
      { id: "ada dugaan barang larangan atau pembatasan (lartas)", en: "it may hold prohibited or restricted goods" },
      {
        id: "isinya barang yang memang wajib diperiksa, seperti produk hewan dan tumbuhan, obat-obatan, atau barang non-pribadi",
        en: "it holds goods that are always checked, such as animal and plant products, medicines, or goods that aren't personal",
      },
    ],
    after: {
      id: "Jadi tulis isi setiap paket dengan jelas, beserta jumlah dan nilainya. Barang lartas tidak selalu dibuka, tapi izinnya selalu dicek lewat dokumen.",
      en: "So list what's in each package clearly, with how many and what it's worth. Restricted goods aren't always opened, but their permits are always checked on paper.",
    },
  },
  {
    slug: "faq-inspection-steps",
    q: { id: "Apa yang terjadi kalau paket diperiksa?", en: "What happens if a package is inspected?" },
    a: {
      id: "Petugas kurir (FedEx, DHL, atau lainnya) membukanya dengan disaksikan petugas Bea Cukai, mencocokkan isinya dengan dokumen, termasuk izin yang diperlukan, lalu menutupnya kembali. Kalau Bea Cukai butuh informasi tambahan, kami teruskan pertanyaannya ke kamu: balas dalam 5 hari kerja, karena kalau tidak, Bea Cukai menetapkan tarif dan nilainya dari informasi yang ada. Setelah itu, ada tiga kemungkinan:",
      en: "Staff from the courier (FedEx, DHL or another) open it while a customs officer watches, check what's inside against the documents, including any permits, and close it again. If customs needs more information, we'll pass the question on to you: reply within 5 working days, or customs sets the rate and value from what it already has. Then one of three things happens:",
    },
    list: [
      { id: "Semuanya cocok dan tanpa pungutan: barang dirilis.", en: "Everything matches and nothing is due: it's released." },
      {
        id: "Ada bea masuk atau pajak, atau nilainya ditetapkan ulang: barang dirilis setelah tagihannya dibayar. Kalau tidak setuju dengan tagihannya, minta penjelasan tertulis sebelum membayar, karena pembayaran bisa dianggap menerima penetapan.",
        en: "Duty or tax is due, or the value is set again: it's released once that's paid. If you disagree with the amount, ask for a written explanation before you pay, since paying can count as accepting it.",
      },
      {
        id: "Barang lartas yang izinnya belum ada: penuhi izinnya, keluarkan barang lain yang tidak kena lartas, atau ekspor kembali. Barang yang dilarang impor tidak bisa dikeluarkan sama sekali, jadi diekspor kembali atau dimusnahkan.",
        en: "Restricted goods without their permit: get the permit, release the rest without them, or send them back. Prohibited goods can't be released at all, so they're sent back or destroyed.",
      },
    ],
    after: {
      id: "Pemeriksaan fisik menambah waktu proses, dan bisa menambah biaya sewa gudang yang ditagihkan ke kamu. Kalau ada barang yang rusak dalam prosesnya, kamu bisa mengajukan klaim selama memenuhi syarat klaim kami. Kemas setiap paket supaya bisa dibuka dan ditutup lagi.",
      en: "An inspection adds time, and can add storage fees, which are billed to you. If anything is damaged in the process, you can claim for it, as long as your claim meets our claim requirements. Pack each package so it can be opened and closed again.",
    },
  },
  {
    // after OPS's ETA infographic (lib/data/delivery-times.ts), 2026-11-17
    q: { id: "Berapa lama pengirimannya?", en: "How long does it take?" },
    a: {
      id: "Totalnya adalah jumlah tiga tahap: perjalanan internasional sekitar 4–8 hari, clearance bea cukai di Indonesia sekitar 4–10 hari kerja, dan pengantaran ke alamatmu, yang lamanya tergantung daerah tujuan:",
      en: "It's three stages added up: about 4–8 days in transit, about 4–10 working days for customs clearance in Indonesia, and delivery to your door, which depends on where in Indonesia you're moving to:",
    },
    rows: DOMESTIC_DELIVERY_ROWS,
    after: {
      id: "Ini waktu rata-rata untuk kiriman dari Eropa, Australia dan Selandia Baru, Amerika, serta Asia (Malaysia, Thailand, Singapura, Jepang, Korea Selatan, dan Tiongkok). Waktunya bisa lebih cepat atau lebih lama, tergantung clearance dan kondisi operasional.",
      en: "These are averages for shipments from Europe, Australia and New Zealand, the Americas, and Asia (Malaysia, Thailand, Singapore, Japan, South Korea and China). Times can be shorter or longer, depending on customs clearance and operational conditions.",
    },
    cta: {
      lead: { id: "Pindah dari negara lain?", en: "Moving from somewhere else?" },
      label: { id: "Cek ETA dari negaramu", en: "Check the ETA from your country" },
      href: EXPAT_QUOTE_URL,
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
  return FAQ.map((f) => ({
    slug: f.slug,
    q: f.q[locale],
    a: f.a[locale],
    ...(f.list ? { list: f.list.map((x) => x[locale]) } : {}),
    ...resolveExtras(f, locale),
  }));
}

/**
 * The expat page's reviews, by `name` in lib/data/testimonials.ts (verbatim).
 * Leticia's is an expat's, given to us for this page; daelyn's and Phoebe's
 * are from Rimkirim's Google reviews (Bristol and Sydney to Jakarta), picked
 * 2026-11-16 because no expat has reviewed us on Google yet. They're
 * Indonesians who moved home, so the copy never calls the reviewers expats,
 * and the rating beside them is Rimkirim's whole Google rating, linked there.
 * No photos: the cards are words only (2026-11-16).
 */
export const EXPAT_REVIEWS: {
  name: string;
  /** a customer photo for this review: `null` asks for one (a placeholder
   *  shows until there is a real, consented photo), a path shows it */
  photo?: string | null;
}[] = [{ name: "Leticia Marina Bevilaqua" }, { name: "daelyn" }, { name: "Phoebe Abigaille" }];

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
    "Tiga ulasan, tanpa foto (2026-11-16). Ulasan Leticia Marina Bevilaqua (Inggris Raya ke Indonesia) adalah ulasan expat asli, ditampilkan utuh atas permintaannya dan dipotong dengan tombol 'Read more'. Dua lainnya diambil verbatim dari Google Review Rimkirim: daelyn (Bristol ke Jakarta) dan Phoebe Abigaille (Sydney ke Jakarta). Belum ada expat yang mengulas Rimkirim di Google, jadi keduanya WNI yang pulang, dan copy-nya tidak pernah menyebut mereka expat. Rating di bawah judul adalah rating Google Rimkirim secara keseluruhan (4.9), dengan link ke Google. Kalau ada ulasan expat baru di Google atau lewat WhatsApp (dengan izin), ganti daelyn atau Phoebe di EXPAT_REVIEWS (lib/data/expat.ts).",
  ship:
    "DRAFT dari update ops (6 Nov 2026), diselaraskan dengan dokumen ops 'Ringkasan Product Import Rimkirim' sebagai source of truth. Susunannya: (A) lima tile barang yang paling sering dikirim, disusun sebagai bento (Pakaian dua kolom sebagai hero), tiap tile bisa dibuka (kartu Sepeda dihapus atas feedback Alvin, 10 Nov 2026: kemungkinan besar sepeda tidak bisa dikirim; sepeda juga dihapus dari FAQ, panduan pengemasan, dan tabel tarif); (B) 'How to pack your belongings', panduan pengemasan yang dituju link di order flow (#packing): customer mengemas semua barangnya sendiri, termasuk furnitur, lalu koper & tas, kardus, kemasan khusus di bawah aturan harga per koli, satu baris soal klaim, lalu panduan mengemas furnitur langkah demi langkah (bagian 10 dokumen ops); (C) 'Before you send': yang perlu konfirmasi dulu di samping yang tidak boleh dikirim. Dari dokumen ops: kartu Pakaian sekarang menyebut pakaian bekas curah (HS 6309) dilarang, jadi pakaian dikemas dilipat, jumlah wajar, dan dicatat per kardus; buku bea masuk 0% dan tanpa PPh untuk semua buku lewat barang kiriman, bukan hanya buku ilmu pengetahuan (revisi Alvin, 10 Nov 2026: buku cetak, dan PPN mungkin tetap berlaku tergantung jenis bukunya); furnitur bisa dikirim kalau 3PL punya layanannya dan customer mengemas sendiri. Yang perlu dikonfirmasi: (1) dua angka [X] dari dokumen ops sebelumnya masih diisi dari tabel surcharge: sisi terpanjang 121 cm dan 25 kg per kardus (di engine, 25 kg ambang biaya overweight, bukan batas); (2) dikonfirmasi tim (9 Nov 2026): tidak ada repack di gudang, semua barang dikemas customer, dan barang yang kemasannya tidak sesuai panduan tidak ditolak saat pickup, tapi kalau rusak tidak bisa diklaim sesuai nilai yang dideklarasikan. Panduan pengemasan Rimkirim dibuat dari packing guidelines FedEx: isi koper, kardus, dan kemasan khusus belum dicocokkan dengan dokumen itu; (3) biaya tambahan furnitur ('menyusul' di dokumen ops) belum ditampilkan; (4) tombol 'Cek Harga' mengarah ke kalkulator relocation (EXPAT_QUOTE_URL); (5) daftar 'Not allowed' (alkohol, rokok & vape, senjata & bahan peledak, barang mudah terbakar, uang tunai, perhiasan, tanaman, dan kendaraan bermotor; kendaraan bermotor ditambahkan 16 Nov 2026 dari eligibility rule v1 PM, sama dengan info 'Cannot be shipped' di order flow) belum ada di dokumen mana pun: dokumen import hanya menyebut Barang Dilarang Impor (Permendag 47/2025, termasuk HS 6309), barang kena cukai yang tidak bebas bea, dan 11 jenis barang di Pasal 42 ayat (8) yang belum dirinci. Pastikan daftar ini, mungkin dari aturan carrier. Gambar di tiap tile adalah ilustrasi contoh (barang digambar sebagai SVG: baju terlipat, sneakers dan topi; tiga buku dengan pita lime; lampu, mangkuk dan panci; gitar akustik, raket, kok dan bola golf, tanpa garis ukuran; piringan hitam dan sampulnya), bukan foto kiriman asli: isi paket di tile Pakaian (Winter coats 3, Jeans 5, Trainers 2) dan pertanyaan di tile Barang lainnya (teleskop, piringan hitam, mesin kopi, mesin jahit) bukan data ops; mesin kopi dan mesin jahit memang elektronik yang perlu dicek dulu, sesuai pesan tile itu. Angka 0% di tile Buku dibaca langsung dari tabel tarif bea cukai, jadi keduanya selalu sama.",
  coordinate:
    "Konfirmasi pembagian tugas. Revisi copy (12 Nov 2026): deskripsi di bawah tiap poin dihapus, jadi tiap poin kini satu baris yang berdiri sendiri, dan lima judul dipertajam supaya infonya tidak hilang: 'Customs paperwork, filed on your behalf', 'Customs clearance, export and import', 'Pack everything yourself, furniture included', 'Send the documents we ask for', 'Be there on pickup day, or have someone there'. Dokumen tidak lagi dirinci di sini: tim mereview pesanan dulu, merekomendasikan jalur bea cukai, baru meminta dokumennya; rincian tiap jalur ada di section customs dan FAQ, mengikuti dokumen ops 'Ringkasan Product Import Rimkirim'. Foto pickup adalah kiriman customer asli: pastikan ada izin customer. Wajah kurir, plat nomor, dan label AWB sudah disensor mosaik. Ilustrasi chat WhatsApp di iPhone (di samping daftar) adalah contoh, mengikuti order flow baru: tim sudah mereview packing list, meminta wine dikeluarkan dan memberi tahu HP baru kemungkinan kena pajak, lalu mengonfirmasi pickup di tanggal yang dipilih customer saat order, dengan rentang jam. Konfirmasi alurnya.",
  compare:
    "Usulan agency (04b), copy menunggu verifikasi ops: terutama 'estimasi dengan rincian biaya sebelum memesan', 'kabar status di setiap tahap, termasuk clearance', dan pendampingan personal. Kompetitor tidak disebut, dan packing sengaja tidak dibandingkan (dibahas di How it works). Kolom 'opsi umum' diriset dari halaman publik jasa kirim bagasi dan perusahaan pindahan internasional (2026-10-29). Klaim Rimkirim yang perlu dikonfirmasi: antar sampai pintu di semua kota tujuan (termasuk kota yang belum terlayani domestik seperti Makassar), customer tidak perlu datang ke bea cukai, dan kabar status lewat WhatsApp di setiap tahap. Revisi 13 Nov 2026 (HP): di HP perbandingannya kini tabel dua kolom berdampingan; kolom opsi umum dapat headline pendek sendiri yang dirangkum dari kalimat risetnya (mis. 'Fees often billed on arrival', 'Import clearance often yours', 'Often ends at a port or warehouse'), jadi headline itu ikut perlu dicek; kalimat lengkap kedua sisi muncul saat aspeknya di-tap. Revisi 14 Nov 2026 (cek fakta): baris biaya tidak lagi menjanjikan 'harga sebelum memesan' (sebelum memesan hanya ada estimasi, quotation pun masih estimasi, dan bea serta pajak ditagih terpisah); pembedanya kini review sebelum pickup: barang yang kemungkinan kena pajak atau tidak bisa dikirim ditandai, dan Rimkirim memilihkan jalur bea cukai yang paling hemat dengan persetujuan customer. Dokumen tidak lagi dijanjikan 'lancar di clearance'. Opsi umum di baris pintu ke pintu tidak lagi menyebut pelabuhan atau bandara (tidak ada di riset). 'Sigap menjawab, meski beda zona waktu' diambil dari pujian customer untuk tim CX, mohon dikonfirmasi tim CX. Catatan kaki kini hanya menyebut urutannya (estimasi dari berat yang diisi, quotation dari paket yang didaftarkan, harga final di invoice); kalimat 'berdasarkan ukuranmu sendiri' dan soal menyanggah ukuran carrier dihapus dari semua copy (catatan kaki ini, FAQ harga, cek tarif, Selected Service, dan bagian harga) atas permintaan Hira, 16 Nov 2026.",
  pricing:
    "Ambang 25 kg dan 50 kg di ilustrasi diambil dari tabel FedEx di modal Surcharge Information (sama dengan engine surcharge). Modal Surcharge Information sama dengan di situs utama (FedEx/DHL/UPS + biaya logistik lain). Konfirmasi semuanya berlaku untuk rute expat, terutama surcharge packaging untuk koper yang kini disebut di copy dan ditandai di ilustrasi. Revisi (12 Nov 2026): section ini tidak lagi mendaftar faktor harga (Route, Weight, Dimension, Surcharges) tetapi menjelaskan cara hitungnya, urut: chargeable weight tiap barang, dijumlahkan, dikali tarif per kilo, ditambah surcharge penanganan kalau ada barang yang memerlukannya. Istilahnya disamakan dengan situs utama dan carrier: actual weight, volumetric weight, chargeable weight (bukan real, size, charged). Tiap langkah punya gambarnya sendiri, dan gambarnya bergerak (motion graphic), pakai satu contoh yang sama (revisi 13 Nov 2026): satu kiriman tiga barang, angkanya asli. Kardus 1 (8,4 kg, 50×40×38 cm, volumetrik 15,2 kg), koper dari sheet ops (20,97 kg), dan kardus buku (51,6 kg). Aturan pembulatan dari sheet ops: ROUNDUP(MAX(aktual, volumetrik), 0) per barang, baru dijumlahkan. Langkah 1 hanya Kardus 1: 15,2 kg dibulatkan ke atas jadi 16 kg; langkah 2 menjumlahkan 16 + 21 + 52 = 89 kg; langkah 3 memakai kartu tarif asli dari Check Rate tanpa angka rupiah (harganya garis kosong), berganti asal lalu layanan; langkah 4 adalah rincian surcharge di quotation untuk ketiga barang, dengan nama dari tabel FedEx di modal: Kardus 1 tidak kena, koper kena Suitcase/Bag, kardus buku kena Overweight (di atas 25 kg) dan Oversize (di atas 50 kg), lalu hanya Oversize yang ditagih dan Overweight dicoret. Di layar lebar keempatnya main estafet sekali (sekitar 10 detik) dengan tombol pause dan replay; di tablet dan HP tiap gambar main waktu masuk layar; klik gambar untuk mengulang langkahnya. Tanpa angka rupiah karena tarif masih dummy dan beda tiap negara, dan nominal surcharge tetap di modal sampai ops mengonfirmasinya. Geraknya perlu dilihat langsung: tempo tiap langkah masih angka awal. Yang perlu dikonfirmasi: surcharge memang belum termasuk estimasi Check Rate dan tercantum di quotation.",
  customs:
    "Diselaraskan dengan dokumen ops 'Ringkasan Product Import Rimkirim' (source of truth): tiga jalur, yaitu barang pindahan (PMK 25/2025), barang penumpang yang dikirim terpisah (PMK 203/2017 jo. PMK 34/2025), dan barang kiriman pribadi (PMK 4/2025), plus tabel tarif barang kiriman jalur CN sampai USD 1.500 (bagian 7). Revisi Alvin (10 Nov 2026): kartu barang pindahan mengikuti narasinya (barang rumah tangga dalam jumlah wajar, tiba 90 hari sebelum atau sesudah kedatangan, commercial invoice/packing list dengan template dari kami, kendaraan dan barang kena cukai tidak termasuk); kalimat WNI yang pulang dengan surat pindah dihapus karena layanan ini untuk WNA; daftar dokumen kini 'Documents needed', dengan satu baris di bawah ketiga kartu bahwa bea cukai sesekali meminta dokumen tambahan; buku di tabel tarif kini 'buku cetak', tanpa PPh dan PPN mungkin berlaku. Revisi Alvin kedua (10 Nov 2026): kartu barang penumpang dan barang kiriman pribadi juga mengikuti narasinya. Penumpang: bebas bea dan pajak sampai USD 500, di atasnya BM 10% plus PPN atas kelebihannya, dokumen paspor, tanggal kedatangan dan detail penerbangan, serta commercial invoice/packing list. Kiriman pribadi (nama jalurnya kini 'Barang Kiriman Pribadi'): tanpa pembebasan, tarif flat 0% sampai 25% plus PPN, paspor atau NPWP, commercial invoice/packing list, harga kami hanya ongkos kirim, PPh lebih tinggi tanpa NPWP. Ketiga kartu kini memuat aturannya sendiri, jadi blok 'Good to know' dihapus: 90 hari dan pengecualian kendaraan serta barang kena cukai ada di kartu barang pindahan, larangan pakaian bekas curah ada di kartu Pakaian dan FAQ. Catatan di bawah tabel tarif tidak lagi mengulang kalimat NPWP dan 'bea cukai menetapkan bea final'. Revisi 13 Nov 2026: janji template commercial invoice/packing list dihapus dari kartu, order flow, dan FAQ. Dihapus karena tidak ada di dokumen: syarat 'barang terpakai', 'barang baru tidak bebas bea', kulkas/freezer/AC diblokir (dokumen: pindahan dan penumpang dikecualikan dari API/PI/LS lewat Permendag 16/2025 Pasal 42 ayat 4), dan tiket pesawat di daftar dokumen. Masih perlu dicek: (1) jendela waktu barang penumpang unaccompanied terhadap kedatangan (dokumen menandainya), jadi halaman hanya bilang 'diatur sesuai waktu kedatanganmu'; (2) apakah barang yang dibawa sendiri dan yang dikirim terpisah berbagi jatah USD 500; (3) PPN barang pindahan untuk WNA (dokumen: cakupan WNA perlu dicek), jadi halaman hanya menjanjikan bebas bea masuk, bukan bebas pajak; (4) tarif PPh tanpa NPWP (kartu hanya bilang 'lebih tinggi'); (5) 'sekitar 22% dari kelebihan' dihitung dari BM 10% + PPN 11% atas (kelebihan + BM), cocok dengan contoh USD 800 di dokumen; (6) template commercial invoice/packing list: dokumen terpisah yang kami kirim, atau dibuat dari data paket yang customer isi di order flow (langkah Packages, kode RKPL)?; (7) 'ditagihkan terpisah': bea dan pajak ditagih Rimkirim di invoice, atau customer membayar langsung ke bea cukai?",
  steps:
    "Urutan langkah mengikuti order flow baru: melengkapi form (Check Rate bagian pertamanya, lalu empat pertanyaan, data diri dan paket), review packing list oleh tim lalu quotation (masih estimasi), pickup dan pengiriman, lalu antar. Revisi copy (11 Nov 2026): langkah 01 kini 'Complete the form', bukan 'Check your rate'; teks langkah 02 dan 03 diringkas, jadi cek dokumen, rekomendasi jalur bea cukai, instruksi label, dan harga final di invoice tidak lagi disebut di sini (masih ada di bagian harga, customs dan FAQ); tim mereview sendiri, bukan 'bersama' customer; kalimat clearance di langkah 03 memakai wording Alvin, sama dengan daftar 'We take care of'. Ilustrasi adalah contoh: langkah 01 memakai kartu rate asli dari flow (tarif dummy), langkah 02 contoh review packing list (wine dikeluarkan, HP baru kemungkinan kena pajak).",
  examples:
    "Section 07 (contoh pengiriman nyata) disembunyikan sampai ada contoh asli: asal, jenis barang, komentar, foto. Isi SHIPMENT_EXAMPLES di lib/data/expat.ts.",
  closing:
    "Tiap langkah 'What happens next' menampilkan layar order flow yang asli, digambar oleh komponennya sendiri dengan data contoh: kartu Special Rate dari Inggris untuk 30 kg (tarif dummy), pertanyaan pertama Eligibility Check, dan kepala tiket Booking Summary dengan nomor dan email contoh.",
  faq: "Brief: semua jawaban wajib disetujui Rimkirim, terutama bea cukai & pengantaran. Revisi 17 Nov 2026: 'How long' mengikuti infografis ETA dari tim OPS (sama dengan FAQ /faq): transit 4–8 hari, clearance 4–10 hari kerja, lalu pengantaran domestik per daerah dalam tabel, dijumlahkan; berlaku untuk kiriman dari Eropa, Australia dan Selandia Baru, Amerika, dan enam negara Asia, dan dari negara lain pembaca diarahkan ke Check Rate ('Check the ETA from your country'). Tabel diurutkan dari yang tercepat (urutan infografis berbeda), dan 'Jawa' di infografis berarti di luar Jabodetabek. 'By air' dan kalimat 'estimasi tampil saat cek tarif' dihapus: infografis tidak menyebut moda, dan Check Rate hanya menampilkan waktu transit. Draft 18 Nov 2026: 'Can my packages be opened?' ditulis dari info Hira, sebelum info lengkap OPS: yang membuka paket adalah 3PL atas rekomendasi Bea Cukai (biasanya setelah ada kejanggalan di X-ray) dan diawasi Bea Cukai; 3PL juga yang menutup kembali; Rimkirim tidak mendampingi pemeriksaan; kerusakan bisa diklaim selama memenuhi syarat klaim. Belum ada halaman lengkap, jadi link 'How inspections work' di order flow mengarah ke jawaban ini (#faq-inspection). Revisi 20 Nov 2026: draft itu diganti tiga pertanyaan dari brief ops 'Pemeriksaan Fisik Barang Impor' (berlaku untuk semua produk impor; sumber PMK 203/2017 Pasal 1 angka 8–9 dan 17–19, PMK 25/2025 Pasal 9–13, PMK 96/2023 Pasal 24–27, 31–32, 36, 40): (1) 'Can my packages be opened?': semua kiriman bisa diperiksa fisik, tidak bisa dihindari atau dijamin, dipilih per kiriman berdasarkan manajemen risiko dan sebagian acak, bukan berarti ada masalah, tidak menentukan bea dan pajak; (2) 'What makes an inspection more likely?': pemicu dari brief dan catatan lartas; (3) 'What happens if a package is inspected?': dibuka petugas kurir disaksikan Bea Cukai, permintaan informasi tambahan dijawab dalam 5 hari kerja, tiga kemungkinan hasil, tambahan waktu dan biaya gudang. Dari Hira (20 Nov 2026): kiriman expat selalu lewat kurir udara (FedEx, DHL, Aramex, dan lainnya), jadi jalur kargo dari brief tidak ditulis; permintaan informasi Bea Cukai diteruskan Rimkirim ke customer; biaya gudang tambahan ditagihkan ke customer; bea dan pajak kadang dibayar lewat Rimkirim, kadang langsung ke Bea Cukai, dan sengaja tidak dijelaskan. Tetap dari Hira (18 Nov): 3PL menutup kembali paketnya, kerusakan bisa diklaim. Masih kosong: link ke syarat klaim, dan halaman lengkap (brief ini cukup untuk satu halaman yang juga dipakai flow WNI).",
} as const;
