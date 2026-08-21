/**
 * FAQ content for /faq, bilingual at the source: every question, answer,
 * category name, and checklist item carries { id, en }. Resolve one locale's
 * tree with faqTabs(locale). Anchor slugs are always derived from the
 * Indonesian question text so deep links stay stable across languages.
 *
 * Hierarchy: service tab -> category -> question/answer.
 */
import type { Locale } from "@/lib/i18n/messages";

/** one string in both languages */
interface Txt {
  id: string;
  en: string;
}

interface FaqItemSource {
  q: Txt;
  a: Txt;
  /** optional checklist rendered under the answer (e.g. document requirements) */
  list?: Txt[];
}
interface FaqCategorySource {
  name: Txt;
  faqs: FaqItemSource[];
}
interface FaqTabSource {
  /** matches the calculator service ids */
  id: "bfg" | "moving-abroad";
  label: string;
  categories: FaqCategorySource[];
}

/** resolved, single-locale shapes consumed by the page */
export interface FaqItem {
  /** stable anchor id, derived from the Indonesian question */
  slug: string;
  q: string;
  a: string;
  list?: string[];
}
export interface FaqCategory {
  /** locale-independent identity (React keys, future anchors) */
  slug: string;
  name: string;
  faqs: FaqItem[];
}
export interface FaqTab {
  id: "bfg" | "moving-abroad";
  label: string;
  categories: FaqCategory[];
}

/**
 * Stable anchor id for one question, shared by the page (element ids),
 * deep links sent over WhatsApp, and the FAQPage JSON-LD.
 */
export function faqSlug(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/, "");
}

const SOURCE: FaqTabSource[] = [
  {
    id: "bfg",
    label: "Back For Good",
    categories: [
      {
        name: { id: "Layanan & Jangkauan", en: "Service & Coverage" },
        faqs: [
          {
            q: {
              id: "Apa itu layanan Back For Good (BFG)?",
              en: "What is the Back For Good (BFG) service?",
            },
            a: {
              id: "Layanan pengiriman internasional untuk orang Indonesia yang pindah kembali ke Indonesia dan ingin mengirim barang pribadi secara aman dan legal dari luar negeri.",
              en: "An international shipping service for Indonesians moving back to Indonesia who want to ship their personal belongings safely and legally from abroad.",
            },
          },
          {
            q: {
              id: "Apakah Rimkirim melayani ekspor/impor selain barang pindahan pribadi?",
              en: "Does Rimkirim handle exports/imports other than personal moving goods?",
            },
            a: {
              id: "Ya, ada layanan terpisah untuk pengiriman barang umum (bukan barang pindahan).",
              en: "Yes, there is a separate service for general cargo (non-moving goods).",
            },
          },
          {
            q: {
              id: "Dari negara mana saja layanan ini bisa diakses?",
              en: "Which countries can I ship from?",
            },
            a: {
              id: "Lebih dari 220 negara di 6 benua, kecuali negara yang sedang konflik aktif.",
              en: "More than 220 countries across 6 continents, except countries in active conflict.",
            },
          },
          {
            q: {
              id: "Kurir internasional apa yang digunakan?",
              en: "Which international couriers are used?",
            },
            a: {
              id: "Mitra kurir besar seperti FedEx dan DHL untuk pengiriman udara.",
              en: "Major courier partners such as FedEx and DHL for air freight.",
            },
          },
          {
            q: {
              id: "Berapa lama waktu pengirimannya?",
              en: "How long does shipping take?",
            },
            a: {
              id: "Sekitar 4-8 hari perjalanan (contoh rute UK-Indonesia), ditambah proses bea cukai sekitar 4-10 hari kerja.",
              en: "Around 4-8 days in transit (UK-Indonesia route as an example), plus a customs process of around 4-10 working days.",
            },
          },
          {
            q: {
              id: "Bagaimana alur prosesnya?",
              en: "How does the process work?",
            },
            a: {
              id: "Door-to-door: dijemput dari alamat asal di luar negeri, diantar langsung ke alamat tujuan di Indonesia.",
              en: "Door-to-door: picked up from your address abroad, delivered straight to your destination address in Indonesia.",
            },
          },
        ],
      },
      {
        name: { id: "Booking & Penjemputan", en: "Booking & Pickup" },
        faqs: [
          {
            q: {
              id: "Bagaimana cara booking pengiriman?",
              en: "How do I book a shipment?",
            },
            a: {
              id: "Hubungi customer support dan selesaikan booking minimal 3 hari sebelum tanggal jemput.",
              en: "Contact customer support and complete your booking at least 3 days before the pickup date.",
            },
          },
          {
            q: {
              id: "Berapa lama sebelumnya harus booking?",
              en: "How far in advance should I book?",
            },
            a: {
              id: "Minimal H-3 dari tanggal penjemputan yang diinginkan.",
              en: "At least 3 days (H-3) before your preferred pickup date.",
            },
          },
          {
            q: {
              id: "Bisa reschedule jadwal jemput?",
              en: "Can I reschedule the pickup?",
            },
            a: {
              id: "Bisa, dibantu customer support pada hari kerja.",
              en: "Yes, customer support can help reschedule on working days.",
            },
          },
          {
            q: {
              id: "Bagaimana jika kurir gagal menjemput?",
              en: "What if the courier fails to pick up?",
            },
            a: {
              id: "Hubungi customer support untuk menjadwalkan ulang.",
              en: "Contact customer support to arrange a new schedule.",
            },
          },
          {
            q: {
              id: "Apakah ada penjemputan di akhir pekan/libur?",
              en: "Is there weekend/holiday pickup?",
            },
            a: {
              id: "Tidak, hanya hari kerja dan mengikuti libur lokal.",
              en: "No, pickups run on working days only and follow local holidays.",
            },
          },
          {
            q: {
              id: "Apa yang perlu disiapkan sebelum hari penjemputan?",
              en: "What should be ready before pickup day?",
            },
            a: {
              id: "Barang sudah dikemas rapi dan dokumen impor yang diperlukan sudah lengkap.",
              en: "Items packed and ready, and the required import documents complete.",
            },
          },
          {
            q: {
              id: "Syarat lokasi penjemputan?",
              en: "Any requirements for the pickup location?",
            },
            a: {
              id: "Harus ada area parkir untuk kendaraan kurir di lokasi asal.",
              en: "The origin location must have parking space for the courier vehicle.",
            },
          },
          {
            q: {
              id: "Perlu bukti dokumentasi barang sebelum dijemput?",
              en: "Do I need photo documentation before pickup?",
            },
            a: {
              id: "Ya, foto/dokumentasi jelas sebagai bukti kondisi barang sebelum dikirim.",
              en: "Yes, clear photos/documentation as proof of the items' condition before shipping.",
            },
          },
        ],
      },
      {
        name: { id: "Packing", en: "Packing" },
        faqs: [
          {
            q: {
              id: "Apakah harus packing sendiri?",
              en: "Do I have to pack my own items?",
            },
            a: {
              id: "Ya, pelanggan wajib mengemas barangnya sendiri sebelum dijemput.",
              en: "Yes, customers must pack their own items before pickup.",
            },
          },
          {
            q: {
              id: "Cara packing terbaik?",
              en: "What is the best way to pack?",
            },
            a: {
              id: "Disarankan pakai kardus/moving box; koper atau hard case juga boleh meski risiko rusak lebih tinggi.",
              en: "Cardboard/moving boxes are recommended; suitcases or hard cases are allowed too, though the risk of damage is higher.",
            },
          },
          {
            q: {
              id: "Ada rekomendasi kardus per negara?",
              en: "Any box recommendations per country?",
            },
            a: {
              id: "Ya, ada jenis/merek kardus tertentu yang disarankan tergantung negara asal.",
              en: "Yes, certain box types/brands are recommended depending on the origin country.",
            },
          },
          {
            q: {
              id: "Boleh pakai bubble wrap/lakban berlebih di luar kardus?",
              en: "Can I use extra bubble wrap/tape outside the box?",
            },
            a: {
              id: "Boleh, tapi kena biaya tambahan (Additional Handling Surcharge) per kardus.",
              en: "Yes, but it adds a fee (Additional Handling Surcharge) per box.",
            },
          },
          {
            q: {
              id: "Bagaimana kalau pakai koper?",
              en: "What about using a suitcase?",
            },
            a: {
              id: "Diperbolehkan dengan biaya tambahan, dan koper wajib dikunci.",
              en: "Allowed with an extra fee, and the suitcase must be locked.",
            },
          },
          {
            q: {
              id: "Ada batas ukuran/berat?",
              en: "Any size/weight limits?",
            },
            a: {
              id: "Tidak ada batas ketat, tapi paket berat/besar bisa kena biaya tambahan.",
              en: "No strict limits, but heavy/oversized packages may incur extra fees.",
            },
          },
          {
            q: {
              id: "Bagaimana cara membungkus kardus yang benar?",
              en: "How do I seal a box properly?",
            },
            a: {
              id: "Bungkus tiap barang dengan bubble wrap, gunakan lakban lebar dengan metode H-taping, dan tempel label pengiriman di sisi atas.",
              en: "Wrap each item in bubble wrap, seal with wide tape using the H-taping method, and put the shipping label on top.",
            },
          },
        ],
      },
      {
        name: { id: "Barang Terlarang", en: "Prohibited Items" },
        faqs: [
          {
            q: {
              id: "Barang apa yang dilarang dikirim?",
              en: "Which items are prohibited?",
            },
            a: {
              id: "Alkohol, rokok, vape, senjata, bahan peledak, uang tunai, perhiasan, dan tanaman.",
              en: "Alcohol, cigarettes, vapes, weapons, explosives, cash, jewelry, and plants.",
            },
          },
          {
            q: {
              id: "Boleh kirim makanan/minuman?",
              en: "Can I ship food/drinks?",
            },
            a: {
              id: "Sebagian boleh asal dideklarasikan lebih dulu dan ada batasannya.",
              en: "Some are allowed if declared in advance, with restrictions.",
            },
          },
          {
            q: {
              id: "Elektronik dengan baterai boleh dikirim?",
              en: "Can I ship electronics with batteries?",
            },
            a: {
              id: "Boleh, asal diinfokan dulu karena dikategorikan barang khusus.",
              en: "Yes, as long as you tell us first, since they are classified as special goods.",
            },
          },
          {
            q: {
              id: "Boleh kirim barang baru/oleh-oleh?",
              en: "Can I ship new items/gifts?",
            },
            a: {
              id: "Boleh, tapi bisa kena pajak impor; disarankan dipisah dari barang bekas.",
              en: "Yes, but they may be subject to import tax; keep them separate from used items.",
            },
          },
          {
            q: {
              id: "Barang apa yang wajib lapor dulu ke Rimkirim?",
              en: "Which items must be reported to Rimkirim first?",
            },
            a: {
              id: "Barang berbahaya, elektronik berbaterai, barang baru/oleh-oleh, dan makanan/minuman.",
              en: "Dangerous goods, battery-powered electronics, new items/gifts, and food/drinks.",
            },
          },
        ],
      },
      {
        name: { id: "Bea Cukai & Dokumen", en: "Customs & Docs" },
        faqs: [
          {
            q: {
              id: "Apakah paket akan dibuka petugas?",
              en: "Will officers open my package?",
            },
            a: {
              id: "Bisa, petugas berhak memeriksa fisik untuk mencocokkan isi dengan packing list. Kamu tidak perlu hadir atau berhadapan dengan petugas; tim Rimkirim yang mendampingi seluruh proses pemeriksaannya.",
              en: "They can; officers may physically inspect the package to match its contents against the packing list. You do not need to be there or face the officers; the Rimkirim team accompanies the entire inspection.",
            },
          },
          {
            q: {
              id: "Apakah barang saya akan dikenakan pajak?",
              en: "Will my goods be taxed?",
            },
            a: {
              id: "Barang pribadi bekas bisa bebas pajak jika memenuhi syarat; barang baru tetap kena pajak. Tim Rimkirim yang menilai kelayakanmu, memilihkan jalur clearance yang tepat, dan mengurus pengajuannya.",
              en: "Used personal items can be tax-free if they meet the requirements; new items are always taxed. The Rimkirim team assesses your eligibility, picks the right clearance route, and handles the application.",
            },
          },
          {
            q: {
              id: "Syarat bebas pajak status 'Barang Pindahan'?",
              en: "Requirements for tax-free 'Personal Belongings' status?",
            },
            a: {
              id: "Minimal tinggal/kuliah di luar negeri selama 1 tahun, dengan surat keterangan pindah dari KBRI dan bukti studi/tugas. Pengajuan status ini diurus tim Rimkirim; kamu cukup menyiapkan dokumennya.",
              en: "At least 1 year living/studying abroad, with a moving certificate from KBRI (the Indonesian Embassy) and proof of study/assignment. The Rimkirim team files this application; you only prepare the documents.",
            },
          },
          {
            q: {
              id: "Syarat status 'Barang Penumpang'?",
              en: "Requirements for 'Passenger Goods' status?",
            },
            a: {
              id: "Jika nilai barang di atas sekitar USD 500, akan dikenakan pajak.",
              en: "If the goods are worth more than about USD 500, tax applies.",
            },
          },
          {
            q: {
              id: "Dokumen identitas untuk Barang Pindahan?",
              en: "Identity documents for Personal Belongings?",
            },
            a: {
              id: "Siapkan dokumen berikut, lalu serahkan ke tim Rimkirim; pengajuan ke bea cukai kami yang jalankan:",
              en: "Prepare the following documents and hand them to the Rimkirim team; we file them with customs:",
            },
            list: [
              { id: "Surat keterangan pindah dari KBRI", en: "Moving certificate from KBRI (the Indonesian Embassy)" },
              { id: "Paspor", en: "Passport" },
              { id: "Packing list", en: "Packing list" },
              { id: "Boarding pass", en: "Boarding pass" },
              { id: "Tiket", en: "Ticket" },
              { id: "Kartu kedatangan", en: "Arrival card" },
              { id: "Bukti studi/kerja", en: "Proof of study/work" },
              { id: "NPWP/KTP", en: "NPWP/KTP (Indonesian tax/ID number)" },
              { id: "Bukti dimensi paket", en: "Proof of package dimensions" },
            ],
          },
          {
            q: {
              id: "Dokumen identitas untuk Barang Penumpang?",
              en: "Identity documents for Passenger Goods?",
            },
            a: {
              id: "Siapkan dokumen berikut, lalu serahkan ke tim Rimkirim; pengajuan ke bea cukai kami yang jalankan:",
              en: "Prepare the following documents and hand them to the Rimkirim team; we file them with customs:",
            },
            list: [
              { id: "Paspor", en: "Passport" },
              { id: "Packing list", en: "Packing list" },
              { id: "Boarding pass", en: "Boarding pass" },
              { id: "Tiket", en: "Ticket" },
              { id: "Kartu kedatangan", en: "Arrival card" },
              { id: "NPWP/KTP", en: "NPWP/KTP (Indonesian tax/ID number)" },
              { id: "Bukti dimensi paket", en: "Proof of package dimensions" },
            ],
          },
          {
            q: {
              id: "Kenapa perlu E-NPWP?",
              en: "Why is an E-NPWP needed?",
            },
            a: {
              id: "Tanpa E-NPWP, tarif pajak penghasilan yang berlaku lebih tinggi.",
              en: "Without an E-NPWP, a higher income tax rate applies.",
            },
          },
          {
            q: {
              id: "Apa fungsi kartu kedatangan/boarding pass?",
              en: "What are the arrival card/boarding pass for?",
            },
            a: {
              id: "Jadi syarat utama pengajuan bebas pajak yang diajukan tim Rimkirim atas namamu.",
              en: "They are the key requirement for the tax exemption the Rimkirim team files on your behalf.",
            },
          },
          {
            q: {
              id: "Apa itu Commercial Invoice/Packing List?",
              en: "What is a Commercial Invoice/Packing List?",
            },
            a: {
              id: "Dokumen berisi info pengirim-penerima, deskripsi barang, jumlah, dan total nilai barang.",
              en: "A document listing sender-receiver details, item descriptions, quantities, and the total value of the goods.",
            },
          },
          {
            q: {
              id: "Apakah kiriman diperiksa bea cukai?",
              en: "Will customs inspect my shipment?",
            },
            a: {
              id: "Ya, ada verifikasi dokumen dan pemeriksaan fisik. Seluruh komunikasi dengan petugas bea cukai dijalankan tim Rimkirim, bukan kamu.",
              en: "Yes, documents are verified and goods physically inspected. All communication with customs officers is handled by the Rimkirim team, not you.",
            },
          },
          {
            q: {
              id: "Kapan harus tiba di Indonesia?",
              en: "When must I arrive in Indonesia?",
            },
            a: {
              id: "Untuk status barang pindahan, maksimal 3 bulan sebelum/sesudah barang tiba; untuk barang penumpang, jendela waktunya lebih singkat.",
              en: "For Personal Belongings status, within 3 months before/after the goods arrive; for Passenger Goods the window is shorter.",
            },
          },
        ],
      },
      {
        name: { id: "Harga & Pembayaran", en: "Pricing & Payment" },
        faqs: [
          {
            q: {
              id: "Kapan invoice diterbitkan?",
              en: "When is the invoice issued?",
            },
            a: {
              id: "Setelah berat/dimensi final dikonfirmasi kurir, biasanya saat barang tiba di Indonesia.",
              en: "After the courier confirms the final weight/dimensions, usually when the goods arrive in Indonesia.",
            },
          },
          {
            q: {
              id: "Apakah pajak sudah termasuk tarif?",
              en: "Are taxes included in the rate?",
            },
            a: {
              id: "Belum, pajak impor dibayar terpisah ke bea cukai; Rimkirim bisa bantu proses pengajuan bebas pajak.",
              en: "Not yet; import tax is paid separately to customs. Rimkirim can help file the tax exemption.",
            },
          },
          {
            q: {
              id: "Siapa yang membayar pajak?",
              en: "Who pays the taxes?",
            },
            a: {
              id: "Bisa pengirim atau penerima; FedEx bisa talangi dulu ke bea cukai dengan biaya tambahan.",
              en: "Either the sender or the receiver; FedEx can advance the payment to customs for an extra fee.",
            },
          },
          {
            q: {
              id: "Bisakah biaya berubah setelah dijemput?",
              en: "Can costs change after pickup?",
            },
            a: {
              id: "Bisa, jika berat/dimensi aktual berbeda dari estimasi atau ada biaya gudang tambahan.",
              en: "Yes, if the actual weight/dimensions differ from the estimate or extra warehouse fees apply.",
            },
          },
          {
            q: {
              id: "Bagaimana cara hitung berat volumetrik?",
              en: "How is volumetric weight calculated?",
            },
            a: {
              id: "Panjang x Lebar x Tinggi (cm) dibagi 5000, sesuai standar FedEx.",
              en: "Length x Width x Height (cm) divided by 5000, per the FedEx standard.",
            },
          },
          {
            q: {
              id: "Kapan kena biaya tambahan (AHS)?",
              en: "When does Additional Handling Surcharge (AHS) apply?",
            },
            a: {
              id: "Untuk kiriman yang butuh penanganan khusus di luar proses sortir otomatis standar.",
              en: "For shipments that need special handling outside the standard automated sorting process.",
            },
          },
          {
            q: {
              id: "Apa itu biaya gudang (warehouse fee)?",
              en: "What is the warehouse fee?",
            },
            a: {
              id: "Biaya penyimpanan sementara selama pemeriksaan bea cukai; gratis beberapa hari pertama, lalu dikenakan biaya harian per kg.",
              en: "A temporary storage fee during customs inspection; free for the first few days, then a daily fee per kg.",
            },
          },
        ],
      },
      {
        name: { id: "Tracking", en: "Tracking" },
        faqs: [
          {
            q: {
              id: "Bagaimana cara melacak kiriman?",
              en: "How do I track my shipment?",
            },
            a: {
              id: "Lewat website menggunakan nomor resi.",
              en: "On the website, using your tracking number.",
            },
          },
          {
            q: {
              id: "Bisa lacak proses bea cukai secara spesifik?",
              en: "Can I track the customs process specifically?",
            },
            a: {
              id: "Bisa, update proses impor terlihat di halaman tracking setelah tiba di Indonesia.",
              en: "Yes, import process updates appear on the tracking page once the goods arrive in Indonesia.",
            },
          },
        ],
      },
      {
        name: { id: "Asuransi & Klaim", en: "Insurance & Claims" },
        faqs: [
          {
            q: {
              id: "Apakah asuransi sudah termasuk tarif?",
              en: "Is insurance included in the rate?",
            },
            a: {
              id: "Tidak dijelaskan secara eksplisit; disarankan konfirmasi langsung ke customer support.",
              en: "This is not explicitly covered; please confirm directly with customer support.",
            },
          },
          {
            q: {
              id: "Bagaimana antisipasi sengketa berat/dimensi?",
              en: "How do I prepare for weight/dimension disputes?",
            },
            a: {
              id: "Dokumentasikan berat dan ukuran paket dengan foto/video sebelum dijemput.",
              en: "Document your package's weight and dimensions with photos/videos before pickup.",
            },
          },
          {
            q: {
              id: "Bagaimana jika ada selisih pengukuran dari kurir?",
              en: "What if the courier's measurement differs?",
            },
            a: {
              id: "Ajukan dokumentasi sebagai bukti banding, Rimkirim akan membantu proses pengajuannya ke kurir.",
              en: "Submit your documentation as appeal evidence; Rimkirim will help file it with the courier.",
            },
          },
          {
            q: {
              id: "Bagaimana cara klaim barang hilang/rusak?",
              en: "How do I claim lost/damaged items?",
            },
            a: {
              id: "Isi form klaim dengan video unboxing, foto barang, daftar nilai barang, dan invoice/CIPL sesuai jenis klaim.",
              en: "Fill in the claim form with an unboxing video, item photos, a list of item values, and the invoice/CIPL depending on the claim type.",
            },
          },
          {
            q: {
              id: "Barang apa yang tidak bisa diklaim?",
              en: "Which items cannot be claimed?",
            },
            a: {
              id: "Barang bernilai sulit dipastikan atau rawan rusak seperti film foto, barang antik, kaca/pecah belah, perhiasan, logam mulia, alat musik tua, dan sejenisnya, mengikuti kebijakan kurir.",
              en: "Items whose value is hard to verify or that are fragile by nature, such as photographic film, antiques, glassware, jewelry, precious metals, old musical instruments, and the like, per courier policy.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "moving-abroad",
    label: "Moving Abroad",
    categories: [
      {
        name: { id: "Layanan & Jangkauan", en: "Service & Coverage" },
        faqs: [
          {
            q: {
              id: "Apa itu layanan 'Moving Abroad'?",
              en: "What is the 'Moving Abroad' service?",
            },
            a: {
              id: "Layanan pengiriman internasional untuk orang Indonesia yang pindah ke luar negeri dan ingin mengirim barang pribadi secara aman dan legal dari Indonesia.",
              en: "An international shipping service for Indonesians moving abroad who want to ship their personal belongings safely and legally from Indonesia.",
            },
          },
          {
            q: {
              id: "Apakah Rimkirim melayani ekspor/impor selain barang pindahan pribadi?",
              en: "Does Rimkirim handle exports/imports other than personal moving goods?",
            },
            a: {
              id: "Ya, ada layanan terpisah untuk pengiriman barang umum (bukan barang pindahan).",
              en: "Yes, there is a separate service for general cargo (non-moving goods).",
            },
          },
          {
            q: {
              id: "Ke negara mana saja layanan ekspor ini tersedia?",
              en: "Which countries can I ship to?",
            },
            a: {
              id: "Lebih dari 220 negara di 6 benua, kecuali negara yang sedang konflik aktif.",
              en: "More than 220 countries across 6 continents, except countries in active conflict.",
            },
          },
          {
            q: {
              id: "Kurir internasional apa yang digunakan?",
              en: "Which international couriers are used?",
            },
            a: {
              id: "Mitra kurir besar seperti FedEx dan DHL untuk pengiriman udara.",
              en: "Major courier partners such as FedEx and DHL for air freight.",
            },
          },
          {
            q: {
              id: "Berapa lama waktu pengirimannya?",
              en: "How long does shipping take?",
            },
            a: {
              id: "Estimasi 4-8 hari kerja, ditambah proses bea cukai sekitar 1-3 hari kerja, belum termasuk pengiriman domestik di negara tujuan.",
              en: "An estimated 4-8 working days, plus a customs process of around 1-3 working days, excluding domestic delivery in the destination country.",
            },
          },
          {
            q: {
              id: "Bagaimana alur prosesnya?",
              en: "How does the process work?",
            },
            a: {
              id: "Door-to-door: dijemput dari alamat asal di Indonesia, diantar langsung ke alamat tujuan di luar negeri.",
              en: "Door-to-door: picked up from your address in Indonesia, delivered straight to your destination address abroad.",
            },
          },
        ],
      },
      {
        name: { id: "Booking & Penjemputan", en: "Booking & Pickup" },
        faqs: [
          {
            q: {
              id: "Bagaimana cara booking pengiriman ekspor?",
              en: "How do I book an export shipment?",
            },
            a: {
              id: "Hubungi customer support dan selesaikan booking minimal 3 hari sebelum tanggal jemput.",
              en: "Contact customer support and complete your booking at least 3 days before the pickup date.",
            },
          },
          {
            q: {
              id: "Berapa lama sebelumnya harus booking?",
              en: "How far in advance should I book?",
            },
            a: {
              id: "Minimal H-3 dari tanggal penjemputan yang diinginkan.",
              en: "At least 3 days (H-3) before your preferred pickup date.",
            },
          },
          {
            q: {
              id: "Bisa reschedule jadwal jemput?",
              en: "Can I reschedule the pickup?",
            },
            a: {
              id: "Bisa, dibantu customer support pada hari kerja.",
              en: "Yes, customer support can help reschedule on working days.",
            },
          },
          {
            q: {
              id: "Bagaimana jika kurir gagal menjemput?",
              en: "What if the courier fails to pick up?",
            },
            a: {
              id: "Hubungi customer support untuk menjadwalkan ulang.",
              en: "Contact customer support to arrange a new schedule.",
            },
          },
          {
            q: {
              id: "Apakah ada penjemputan di akhir pekan/libur?",
              en: "Is there weekend/holiday pickup?",
            },
            a: {
              id: "Tidak, hanya hari kerja dan mengikuti libur lokal.",
              en: "No, pickups run on working days only and follow local holidays.",
            },
          },
          {
            q: {
              id: "Apa yang perlu disiapkan sebelum hari penjemputan?",
              en: "What should be ready before pickup day?",
            },
            a: {
              id: "Barang sudah dikemas rapi dan dokumen ekspor yang diperlukan sudah lengkap.",
              en: "Items packed and ready, and the required export documents complete.",
            },
          },
          {
            q: {
              id: "Syarat lokasi penjemputan?",
              en: "Any requirements for the pickup location?",
            },
            a: {
              id: "Harus ada area parkir untuk kendaraan kurir di lokasi asal.",
              en: "The origin location must have parking space for the courier vehicle.",
            },
          },
        ],
      },
      {
        name: { id: "Packing", en: "Packing" },
        faqs: [
          {
            q: {
              id: "Apakah harus packing sendiri?",
              en: "Do I have to pack my own items?",
            },
            a: {
              id: "Ya, pelanggan wajib mengemas barangnya sendiri sebelum dijemput.",
              en: "Yes, customers must pack their own items before pickup.",
            },
          },
          {
            q: {
              id: "Cara packing terbaik?",
              en: "What is the best way to pack?",
            },
            a: {
              id: "Disarankan pakai kardus/moving box; koper atau hard case juga boleh meski risiko rusak lebih tinggi.",
              en: "Cardboard/moving boxes are recommended; suitcases or hard cases are allowed too, though the risk of damage is higher.",
            },
          },
          {
            q: {
              id: "Ada rekomendasi kardus khusus per negara tujuan?",
              en: "Any box requirements per destination country?",
            },
            a: {
              id: "Tidak ada ketentuan khusus, kardus bisa dipilih bebas sesuai kebutuhan dan jenis barang.",
              en: "No specific requirements; choose any box that suits your items.",
            },
          },
          {
            q: {
              id: "Boleh pakai bubble wrap/lakban berlebih di luar kardus?",
              en: "Can I use extra bubble wrap/tape outside the box?",
            },
            a: {
              id: "Boleh, tapi kena biaya tambahan (Additional Handling Surcharge) per kardus.",
              en: "Yes, but it adds a fee (Additional Handling Surcharge) per box.",
            },
          },
          {
            q: {
              id: "Bagaimana kalau pakai koper?",
              en: "What about using a suitcase?",
            },
            a: {
              id: "Diperbolehkan dengan biaya tambahan, dan koper wajib dikunci.",
              en: "Allowed with an extra fee, and the suitcase must be locked.",
            },
          },
          {
            q: {
              id: "Ada batas ukuran/berat?",
              en: "Any size/weight limits?",
            },
            a: {
              id: "Tidak ada batas ketat, tapi paket berat/besar bisa kena biaya tambahan.",
              en: "No strict limits, but heavy/oversized packages may incur extra fees.",
            },
          },
          {
            q: {
              id: "Bagaimana cara membungkus kardus yang benar?",
              en: "How do I seal a box properly?",
            },
            a: {
              id: "Bungkus tiap barang dengan bubble wrap, gunakan lakban lebar dengan metode H-taping, dan tempel label pengiriman di sisi atas.",
              en: "Wrap each item in bubble wrap, seal with wide tape using the H-taping method, and put the shipping label on top.",
            },
          },
        ],
      },
      {
        name: { id: "Barang Terlarang", en: "Prohibited Items" },
        faqs: [
          {
            q: {
              id: "Barang apa yang dilarang dikirim?",
              en: "Which items are prohibited?",
            },
            a: {
              id: "Alkohol, rokok, vape, senjata, bahan peledak, uang tunai, perhiasan, dan tanaman. Aturan bisa beda-beda tergantung negara tujuan, jadi disarankan konfirmasi ke CS.",
              en: "Alcohol, cigarettes, vapes, weapons, explosives, cash, jewelry, and plants. Rules vary by destination country, so please confirm with our support team.",
            },
          },
          {
            q: {
              id: "Boleh kirim makanan/minuman?",
              en: "Can I ship food/drinks?",
            },
            a: {
              id: "Sebagian boleh asal dideklarasikan lebih dulu dan ada batasannya.",
              en: "Some are allowed if declared in advance, with restrictions.",
            },
          },
          {
            q: {
              id: "Elektronik dengan baterai boleh dikirim?",
              en: "Can I ship electronics with batteries?",
            },
            a: {
              id: "Boleh, asal diinfokan dulu ke CS karena dikategorikan barang khusus.",
              en: "Yes, as long as you tell our support team first, since they are classified as special goods.",
            },
          },
          {
            q: {
              id: "Boleh kirim barang baru/oleh-oleh?",
              en: "Can I ship new items/gifts?",
            },
            a: {
              id: "Boleh, tapi bisa kena pajak ekspor; disarankan dipisah dari barang bekas.",
              en: "Yes, but they may be subject to export tax; keep them separate from used items.",
            },
          },
          {
            q: {
              id: "Barang apa yang wajib lapor dulu ke Rimkirim?",
              en: "Which items must be reported to Rimkirim first?",
            },
            a: {
              id: "Barang berbahaya, elektronik berbaterai, barang baru/oleh-oleh, dan makanan/minuman. Aturan bisa beda tiap negara tujuan.",
              en: "Dangerous goods, battery-powered electronics, new items/gifts, and food/drinks. Rules can differ per destination country.",
            },
          },
        ],
      },
      {
        name: { id: "Bea Cukai & Dokumen", en: "Customs & Docs" },
        faqs: [
          {
            q: {
              id: "Apakah barang saya akan dikenakan pajak?",
              en: "Will my goods be taxed?",
            },
            a: {
              id: "Tergantung regulasi negara tujuan, disarankan konfirmasi langsung ke CS.",
              en: "It depends on the destination country's regulations; please confirm with our support team.",
            },
          },
          {
            q: {
              id: "Syarat bebas pajak status 'Barang Pindahan'?",
              en: "Requirements for tax-free 'Personal Belongings' status?",
            },
            a: {
              id: "Tergantung kelayakan sesuai aturan negara tujuan dan kelengkapan dokumen; syarat dan dokumen bisa berbeda per negara.",
              en: "It depends on eligibility under the destination country's rules and document completeness; requirements and documents can differ per country.",
            },
          },
          {
            q: {
              id: "Dokumen identitas untuk Barang Pindahan?",
              en: "Identity documents for Personal Belongings?",
            },
            a: {
              id: "Siapkan dokumen berikut, lalu serahkan ke tim Rimkirim; pengajuannya kami yang jalankan:",
              en: "Prepare the following documents and hand them to the Rimkirim team; we handle the filing:",
            },
            list: [
              { id: "Packing list", en: "Packing list" },
              { id: "Paspor", en: "Passport" },
              { id: "Visa negara tujuan", en: "Destination country visa" },
              { id: "Tiket", en: "Ticket" },
              { id: "Bukti sewa tempat tinggal sementara", en: "Proof of temporary housing rental" },
              { id: "Izin tinggal", en: "Residence permit" },
              { id: "NPWP/KTP", en: "NPWP/KTP (Indonesian tax/ID number)" },
              { id: "Dokumen tujuan tinggal (studi/kerja/menikah)", en: "Purpose-of-stay documents (study/work/marriage)" },
              { id: "Dokumen pengiriman", en: "Shipping documents" },
            ],
          },
          {
            q: {
              id: "Dokumen untuk Barang Kiriman (bukan pindahan)?",
              en: "Documents for general shipments (non-moving)?",
            },
            a: {
              id: "Siapkan dokumen berikut, lalu serahkan ke tim Rimkirim:",
              en: "Prepare the following documents and hand them to the Rimkirim team:",
            },
            list: [
              { id: "Packing list", en: "Packing list" },
              { id: "AWB (diterbitkan Rimkirim setelah biaya kirim disetujui)", en: "AWB (issued by Rimkirim once shipping costs are approved)" },
              { id: "NPWP/KTP", en: "NPWP/KTP (Indonesian tax/ID number)" },
              { id: "Dokumen pengiriman", en: "Shipping documents" },
            ],
          },
          {
            q: {
              id: "Apa itu Commercial Invoice/Packing List?",
              en: "What is a Commercial Invoice/Packing List?",
            },
            a: {
              id: "Dokumen berisi info pengirim-penerima, deskripsi barang, jumlah, dan total nilai barang.",
              en: "A document listing sender-receiver details, item descriptions, quantities, and the total value of the goods.",
            },
          },
          {
            q: {
              id: "Apakah kiriman diperiksa bea cukai?",
              en: "Will customs inspect my shipment?",
            },
            a: {
              id: "Ya, ada verifikasi dokumen dan pemeriksaan fisik. Seluruh komunikasi dengan petugas bea cukai dijalankan tim Rimkirim, bukan kamu.",
              en: "Yes, documents are verified and goods physically inspected. All communication with customs officers is handled by the Rimkirim team, not you.",
            },
          },
          {
            q: {
              id: "Perlu dokumen PEB (Pemberitahuan Ekspor Barang)?",
              en: "Is a PEB (export declaration) document needed?",
            },
            a: {
              id: "Tergantung jenis dan berat kiriman; di bawah 30 kg umumnya tidak perlu PEB, di atas itu wajib ada.",
              en: "It depends on the shipment type and weight; under 30 kg a PEB is usually not needed, above that it is mandatory.",
            },
          },
        ],
      },
      {
        name: { id: "Harga & Pembayaran", en: "Pricing & Payment" },
        faqs: [
          {
            q: {
              id: "Kapan invoice diterbitkan?",
              en: "When is the invoice issued?",
            },
            a: {
              id: "Invoice (belum termasuk pajak) diterbitkan di awal, dan pembayaran dilakukan sebelum pengiriman.",
              en: "The invoice (excluding tax) is issued upfront, and payment is made before shipping.",
            },
          },
          {
            q: {
              id: "Apakah pajak sudah termasuk tarif?",
              en: "Are taxes included in the rate?",
            },
            a: {
              id: "Belum, pajak ekspor dibayar terpisah langsung ke FedEx; Rimkirim bisa bantu proses pengajuan bebas pajak untuk kategori barang pindahan.",
              en: "Not yet; export tax is paid separately, directly to FedEx. Rimkirim can help file the tax exemption for the moving-goods category.",
            },
          },
          {
            q: {
              id: "Siapa yang membayar pajak?",
              en: "Who pays the taxes?",
            },
            a: {
              id: "Dibayar langsung oleh penerima ke FedEx.",
              en: "Paid directly by the receiver to FedEx.",
            },
          },
          {
            q: {
              id: "Bisakah biaya berubah setelah dijemput?",
              en: "Can costs change after pickup?",
            },
            a: {
              id: "Bisa, jika berat/dimensi aktual berbeda dari estimasi atau ada biaya gudang tambahan.",
              en: "Yes, if the actual weight/dimensions differ from the estimate or extra warehouse fees apply.",
            },
          },
          {
            q: {
              id: "Bagaimana cara hitung berat volumetrik?",
              en: "How is volumetric weight calculated?",
            },
            a: {
              id: "Panjang x Lebar x Tinggi (cm) dibagi 5000, sesuai standar FedEx.",
              en: "Length x Width x Height (cm) divided by 5000, per the FedEx standard.",
            },
          },
          {
            q: {
              id: "Kapan kena biaya tambahan (AHS)?",
              en: "When does Additional Handling Surcharge (AHS) apply?",
            },
            a: {
              id: "Untuk kiriman yang butuh penanganan khusus di luar proses sortir otomatis standar.",
              en: "For shipments that need special handling outside the standard automated sorting process.",
            },
          },
          {
            q: {
              id: "Apa itu biaya gudang (warehouse fee)?",
              en: "What is the warehouse fee?",
            },
            a: {
              id: "Biaya penyimpanan sementara selama pemeriksaan bea cukai; besarannya tergantung negara tujuan, disarankan konfirmasi ke CS.",
              en: "A temporary storage fee during customs inspection; the amount depends on the destination country, please confirm with our support team.",
            },
          },
        ],
      },
      {
        name: { id: "Tracking", en: "Tracking" },
        faqs: [
          {
            q: {
              id: "Bagaimana cara melacak kiriman?",
              en: "How do I track my shipment?",
            },
            a: {
              id: "Lewat website menggunakan nomor resi.",
              en: "On the website, using your tracking number.",
            },
          },
          {
            q: {
              id: "Bisa lacak proses bea cukai secara spesifik?",
              en: "Can I track the customs process specifically?",
            },
            a: {
              id: "Bisa, update proses ekspor terlihat di halaman tracking setelah tiba di negara tujuan.",
              en: "Yes, export process updates appear on the tracking page once the goods arrive in the destination country.",
            },
          },
        ],
      },
      {
        name: { id: "Asuransi & Klaim", en: "Insurance & Claims" },
        faqs: [
          {
            q: {
              id: "Apakah asuransi sudah termasuk tarif?",
              en: "Is insurance included in the rate?",
            },
            a: {
              id: "Tidak dijelaskan secara eksplisit; disarankan konfirmasi langsung ke customer support.",
              en: "This is not explicitly covered; please confirm directly with customer support.",
            },
          },
          {
            q: {
              id: "Bagaimana antisipasi sengketa berat/dimensi?",
              en: "How do I prepare for weight/dimension disputes?",
            },
            a: {
              id: "Dokumentasikan berat dan ukuran paket dengan foto/video sebelum dijemput.",
              en: "Document your package's weight and dimensions with photos/videos before pickup.",
            },
          },
          {
            q: {
              id: "Bagaimana jika ada selisih pengukuran dari kurir?",
              en: "What if the courier's measurement differs?",
            },
            a: {
              id: "Ajukan dokumentasi sebagai bukti banding, Rimkirim akan membantu proses pengajuannya ke kurir.",
              en: "Submit your documentation as appeal evidence; Rimkirim will help file it with the courier.",
            },
          },
          {
            q: {
              id: "Bagaimana cara klaim barang hilang/rusak?",
              en: "How do I claim lost/damaged items?",
            },
            a: {
              id: "Isi form klaim sesuai jenis (hilang/rusak) dengan foto, video unboxing, dan invoice/CIPL sebagai bukti pendukung.",
              en: "Fill in the claim form for the claim type (lost/damaged) with photos, an unboxing video, and the invoice/CIPL as supporting evidence.",
            },
          },
          {
            q: {
              id: "Barang apa yang tidak bisa diklaim?",
              en: "Which items cannot be claimed?",
            },
            a: {
              id: "Barang bernilai sulit dipastikan atau rawan rusak seperti film foto, barang antik, kaca/pecah belah, perhiasan, logam mulia, alat musik tua, dan sejenisnya, mengikuti kebijakan kurir.",
              en: "Items whose value is hard to verify or that are fragile by nature, such as photographic film, antiques, glassware, jewelry, precious metals, old musical instruments, and the like, per courier policy.",
            },
          },
        ],
      },
    ],
  },
];

const cache = new Map<Locale, FaqTab[]>();

/** the FAQ tree in one language, memoized per locale */
export function faqTabs(locale: Locale): FaqTab[] {
  const hit = cache.get(locale);
  if (hit) return hit;
  const tabs: FaqTab[] = SOURCE.map((tab) => ({
    id: tab.id,
    label: tab.label,
    categories: tab.categories.map((cat) => ({
      slug: faqSlug(cat.name.en),
      name: cat.name[locale],
      faqs: cat.faqs.map((f) => ({
        slug: faqSlug(f.q.id),
        q: f.q[locale],
        a: f.a[locale],
        ...(f.list ? { list: f.list.map((x) => x[locale]) } : {}),
      })),
    })),
  }));
  cache.set(locale, tabs);
  return tabs;
}
