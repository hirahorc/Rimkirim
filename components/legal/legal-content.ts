import type { LegalDocData } from "./LegalDoc";

/**
 * Placeholder legal copy for Rimkirim, grounded in the product as it exists
 * today (personal cross-border relocation, customs handled by Rimkirim, the
 * Rimkirim Packing List, rate estimates incl. daily FSI, WhatsApp support,
 * local-only drafts). Refine with counsel before production use.
 */

const UPDATED: LegalDocData["updated"] = {
  id: "Terakhir diperbarui: 2 Agustus 2026",
  en: "Last updated: August 2, 2026",
};

const CONTACT: LegalDocData["contact"] = {
  id: "Ada pertanyaan tentang dokumen ini? Hubungi kami di hello@rimkirim.com atau lewat WhatsApp customer support Rimkirim.",
  en: "Questions about this document? Contact us at hello@rimkirim.com or via Rimkirim customer support on WhatsApp.",
};

export const termsDoc: LegalDocData = {
  title: { id: "Ketentuan Layanan", en: "Terms of Service" },
  updated: UPDATED,
  intro: {
    id: "Ketentuan ini mengatur penggunaan layanan Rimkirim, asisten pengiriman internasional untuk relokasi barang pribadi lintas negara (Back For Good dan Moving Abroad). Dengan menggunakan layanan kami, kamu setuju dengan ketentuan di bawah ini.",
    en: "These terms govern your use of Rimkirim, an international shipping assistant for personal cross-border relocation (Back For Good and Moving Abroad). By using our services, you agree to the terms below.",
  },
  contact: CONTACT,
  sections: [
    {
      heading: { id: "Tentang Layanan", en: "About the Service" },
      paragraphs: [
        {
          id: "Rimkirim membantu individu dan keluarga memindahkan barang pribadi antara Indonesia dan luar negeri, serta mengambil alih proses bea cukai atas nama kamu. Kami adalah pendamping pengiriman, bukan marketplace atau maskapai kargo.",
          en: "Rimkirim helps individuals and families move personal belongings between Indonesia and abroad, and takes over the customs process on your behalf. We are a shipping assistant, not a marketplace or a cargo carrier.",
        },
      ],
    },
    {
      heading: { id: "Estimasi Tarif", en: "Rate Estimates" },
      paragraphs: [
        {
          id: "Semua harga yang ditampilkan di kalkulator dan halaman tarif adalah estimasi. Komponen harga termasuk Fuel Surcharge (FSI) yang diperbarui setiap hari, sehingga angka dapat berubah. Harga final dikonfirmasi saat kamu menyelesaikan pemesanan.",
          en: "All prices shown in the calculator and rate pages are estimates. The price includes a Fuel Surcharge (FSI) component that updates daily, so figures may change. The final price is confirmed when you complete a booking.",
        },
        {
          id: "Surcharge tambahan dapat muncul setelah paket diperiksa oleh mitra carrier, dan biaya logistik tertentu dikonfirmasi saat booking.",
          en: "Additional surcharges may apply after packages are inspected by our carrier partners, and certain logistics costs are confirmed at booking.",
        },
      ],
    },
    {
      heading: { id: "Tanggung Jawab Pengguna", en: "Your Responsibilities" },
      paragraphs: [
        {
          id: "Kamu bertanggung jawab memberikan data yang benar dan lengkap (identitas, alamat, isi & nilai barang, serta dokumen pendukung). Layanan ini hanya untuk barang pribadi yang legal untuk diekspor/impor.",
          en: "You are responsible for providing accurate and complete information (identity, addresses, item contents & values, and supporting documents). This service is only for personal belongings that are legal to export/import.",
        },
      ],
    },
    {
      heading: { id: "Barang Terlarang", en: "Prohibited Items" },
      paragraphs: [
        {
          id: "Kamu tidak boleh mengirim barang yang dilarang hukum, termasuk namun tidak terbatas pada narkotika, senjata & bahan peledak, uang tunai, barang mudah rusak tertentu, dan barang lain yang dibatasi oleh negara asal maupun negara tujuan.",
          en: "You may not ship items prohibited by law, including but not limited to narcotics, weapons & explosives, cash, certain perishables, and other goods restricted by the origin or destination country.",
        },
      ],
    },
    {
      heading: { id: "Bea Cukai & Dokumen", en: "Customs & Documents" },
      paragraphs: [
        {
          id: "Rimkirim menyiapkan dan menjalankan proses bea cukai serta menerbitkan Rimkirim Packing List (format RKPLXXXXXX) sebagai rujukan kiriman. Keputusan akhir atas pemeriksaan, pajak, dan pelepasan barang tetap berada di tangan otoritas bea cukai terkait.",
          en: "Rimkirim prepares and runs the customs process and issues a Rimkirim Packing List (format RKPLXXXXXX) as the shipment's reference. Final decisions on inspection, taxes, and release of goods remain with the relevant customs authorities.",
        },
      ],
    },
    {
      heading: { id: "Pembayaran", en: "Payment" },
      paragraphs: [
        {
          id: "Biaya dan metode pembayaran disepakati saat pemesanan. Kiriman diproses setelah pembayaran dikonfirmasi sesuai ketentuan yang berlaku pada saat booking.",
          en: "Fees and payment methods are agreed at booking. Shipments are processed once payment is confirmed according to the terms in effect at the time of booking.",
        },
      ],
    },
    {
      heading: { id: "Batasan Tanggung Jawab", en: "Limitation of Liability" },
      paragraphs: [
        {
          id: "Estimasi waktu dan biaya tidak mengikat. Rimkirim tidak bertanggung jawab atas keterlambatan atau biaya tambahan yang timbul dari proses bea cukai, kebijakan carrier, force majeure, atau data yang tidak akurat dari pengguna.",
          en: "Time and cost estimates are non-binding. Rimkirim is not liable for delays or additional costs arising from customs processes, carrier policies, force majeure, or inaccurate information provided by the user.",
        },
      ],
    },
    {
      heading: { id: "Perubahan Ketentuan", en: "Changes to These Terms" },
      paragraphs: [
        {
          id: "Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Versi terbaru berlaku sejak tanggal yang tertera di atas.",
          en: "We may update these terms from time to time. The latest version applies from the date shown above.",
        },
      ],
    },
  ],
};

export const privacyDoc: LegalDocData = {
  title: { id: "Kebijakan Privasi", en: "Privacy Policy" },
  updated: UPDATED,
  intro: {
    id: "Kebijakan ini menjelaskan data apa yang Rimkirim kumpulkan, bagaimana kami menggunakannya, dan pilihan yang kamu miliki. Kami mengumpulkan data hanya sejauh yang diperlukan untuk menjalankan pengiriman dan proses bea cukai kamu.",
    en: "This policy explains what data Rimkirim collects, how we use it, and the choices you have. We collect data only to the extent needed to run your shipment and customs process.",
  },
  contact: CONTACT,
  sections: [
    {
      heading: { id: "Data yang Kami Kumpulkan", en: "Data We Collect" },
      paragraphs: [
        {
          id: "Data kontak & identitas (nama, email, nomor telepon, nomor KTP/paspor beserta dokumen), alamat asal dan tujuan, serta detail kiriman (jenis, berat, dimensi, dan nilai barang yang kamu deklarasikan).",
          en: "Contact & identity data (name, email, phone number, KTP/passport number and documents), origin and destination addresses, and shipment details (type, weight, dimensions, and the item values you declare).",
        },
      ],
    },
    {
      heading: { id: "Cara Kami Menggunakan Data", en: "How We Use Your Data" },
      paragraphs: [
        {
          id: "Untuk menghitung estimasi tarif, memproses pemesanan dan pengiriman, menyiapkan dokumen & proses bea cukai, serta berkomunikasi dengan kamu terkait kiriman.",
          en: "To calculate rate estimates, process bookings and shipments, prepare documents & the customs process, and communicate with you about your shipment.",
        },
      ],
    },
    {
      heading: { id: "Berbagi Data", en: "Data Sharing" },
      paragraphs: [
        {
          id: "Kami membagikan data seperlunya kepada mitra carrier (misalnya FedEx, DHL, UPS, Aramex) dan otoritas bea cukai di negara terkait untuk menyelesaikan pengiriman. Kami tidak menjual data pribadi kamu.",
          en: "We share data as needed with carrier partners (e.g. FedEx, DHL, UPS, Aramex) and customs authorities in the relevant countries to complete your shipment. We do not sell your personal data.",
        },
      ],
    },
    {
      heading: { id: "Penyimpanan & Keamanan", en: "Storage & Security" },
      paragraphs: [
        {
          id: "Saat ini, draft pesanan yang belum dikirim disimpan secara lokal di browser kamu (localStorage) agar progres tidak hilang. Kami menerapkan langkah keamanan yang wajar untuk melindungi data yang kami proses.",
          en: "For now, unsubmitted order drafts are stored locally in your browser (localStorage) so your progress isn't lost. We apply reasonable safeguards to protect the data we process.",
        },
      ],
    },
    {
      heading: { id: "Cookie", en: "Cookies" },
      paragraphs: [
        {
          id: "Kami menggunakan cookie untuk meningkatkan pengalaman kamu di situs. Kamu dapat mengatur preferensi cookie melalui banner yang muncul saat kamu mengunjungi situs.",
          en: "We use cookies to improve your experience on the site. You can manage cookie preferences via the banner shown when you visit the site.",
        },
      ],
    },
    {
      heading: { id: "Hak Kamu", en: "Your Rights" },
      paragraphs: [
        {
          id: "Kamu dapat meminta akses, koreksi, atau penghapusan data pribadi kamu dengan menghubungi kami. Kami akan menanggapi sesuai peraturan yang berlaku.",
          en: "You may request access to, correction of, or deletion of your personal data by contacting us. We will respond in line with applicable regulations.",
        },
      ],
    },
    {
      heading: { id: "Retensi Data", en: "Data Retention" },
      paragraphs: [
        {
          id: "Kami menyimpan data selama diperlukan untuk memberikan layanan dan memenuhi kewajiban hukum & kepatuhan bea cukai, lalu menghapus atau menganonimkannya.",
          en: "We keep data for as long as needed to provide the service and meet legal & customs-compliance obligations, then delete or anonymize it.",
        },
      ],
    },
  ],
};
