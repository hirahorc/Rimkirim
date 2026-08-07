/**
 * Landing-page FAQ content. Kept out of `lib/i18n/messages.ts` on purpose:
 * this is a large body of copy and its EN translation lands later, so it lives
 * here as plain data (ID for now) rather than in the parity-enforced catalog.
 *
 * Hierarchy: service tab → category → question/answer.
 */
export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqCategory {
  name: string;
  faqs: FaqItem[];
}
export interface FaqTab {
  /** matches the calculator service ids */
  id: "bfg" | "moving-abroad";
  label: string;
  /** shown above the categories (e.g. the Moving Abroad "same as BFG" note) */
  note?: string;
  categories: FaqCategory[];
}

export const FAQ_TABS: FaqTab[] = [
  {
    id: "bfg",
    label: "Back For Good",
    categories: [
      {
        name: "Service & Coverage",
        faqs: [
          {
            q: "Apa itu layanan Back For Good (BFG)?",
            a: "Layanan pengiriman internasional untuk orang Indonesia yang pindah kembali ke Indonesia dan ingin mengirim barang pribadi secara aman dan legal dari luar negeri.",
          },
          {
            q: "Apakah Rimkirim melayani ekspor/impor selain barang pindahan pribadi?",
            a: "Ya, ada layanan terpisah untuk pengiriman barang umum (bukan barang pindahan).",
          },
          {
            q: "Dari negara mana saja layanan ini bisa diakses?",
            a: "Lebih dari 220 negara di 6 benua, kecuali negara yang sedang konflik aktif.",
          },
          {
            q: "Kurir internasional apa yang digunakan?",
            a: "Mitra kurir besar seperti FedEx dan DHL untuk pengiriman udara.",
          },
          {
            q: "Berapa lama waktu pengirimannya?",
            a: "Sekitar 4-8 hari perjalanan (contoh rute UK-Indonesia), ditambah proses bea cukai sekitar 4-10 hari kerja.",
          },
          {
            q: "Bagaimana alur prosesnya?",
            a: "Door-to-door: dijemput dari alamat asal di luar negeri, diantar langsung ke alamat tujuan di Indonesia.",
          },
        ],
      },
      {
        name: "Booking & Pickup",
        faqs: [
          {
            q: "Bagaimana cara booking pengiriman?",
            a: "Hubungi customer support dan selesaikan booking minimal 3 hari sebelum tanggal jemput.",
          },
          {
            q: "Berapa lama sebelumnya harus booking?",
            a: "Minimal H-3 dari tanggal penjemputan yang diinginkan.",
          },
          {
            q: "Bisa reschedule jadwal jemput?",
            a: "Bisa, dibantu customer support pada hari kerja.",
          },
          {
            q: "Bagaimana jika kurir gagal menjemput?",
            a: "Hubungi customer support untuk menjadwalkan ulang.",
          },
          {
            q: "Apakah ada penjemputan di akhir pekan/libur?",
            a: "Tidak, hanya hari kerja dan mengikuti libur lokal.",
          },
          {
            q: "Apa yang perlu disiapkan sebelum hari penjemputan?",
            a: "Barang sudah dikemas rapi dan dokumen impor yang diperlukan sudah lengkap.",
          },
          {
            q: "Syarat lokasi penjemputan?",
            a: "Harus ada area parkir untuk kendaraan kurir di lokasi asal.",
          },
          {
            q: "Perlu bukti dokumentasi barang sebelum dijemput?",
            a: "Ya, foto/dokumentasi jelas sebagai bukti kondisi barang sebelum dikirim.",
          },
        ],
      },
      {
        name: "Packing",
        faqs: [
          {
            q: "Apakah harus packing sendiri?",
            a: "Ya, pelanggan wajib mengemas barangnya sendiri sebelum dijemput.",
          },
          {
            q: "Cara packing terbaik?",
            a: "Disarankan pakai kardus/moving box; koper atau hard case juga boleh meski risiko rusak lebih tinggi.",
          },
          {
            q: "Ada rekomendasi kardus per negara?",
            a: "Ya, ada jenis/merek kardus tertentu yang disarankan tergantung negara asal.",
          },
          {
            q: "Boleh pakai bubble wrap/lakban berlebih di luar kardus?",
            a: "Boleh, tapi kena biaya tambahan (Additional Handling Surcharge) per kardus.",
          },
          {
            q: "Bagaimana kalau pakai koper?",
            a: "Diperbolehkan dengan biaya tambahan, dan koper wajib dikunci.",
          },
          {
            q: "Ada batas ukuran/berat?",
            a: "Tidak ada batas ketat, tapi paket berat/besar bisa kena biaya tambahan.",
          },
          {
            q: "Bagaimana cara membungkus kardus yang benar?",
            a: "Bungkus tiap barang dengan bubble wrap, gunakan lakban lebar dengan metode H-taping, dan tempel label pengiriman di sisi atas.",
          },
        ],
      },
      {
        name: "Prohibited Items",
        faqs: [
          {
            q: "Barang apa yang dilarang dikirim?",
            a: "Alkohol, rokok, vape, senjata, bahan peledak, uang tunai, perhiasan, dan tanaman.",
          },
          {
            q: "Boleh kirim makanan/minuman?",
            a: "Sebagian boleh asal dideklarasikan lebih dulu dan ada batasannya.",
          },
          {
            q: "Elektronik dengan baterai boleh dikirim?",
            a: "Boleh, asal diinfokan dulu karena dikategorikan barang khusus.",
          },
          {
            q: "Boleh kirim barang baru/oleh-oleh?",
            a: "Boleh, tapi bisa kena pajak impor; disarankan dipisah dari barang bekas.",
          },
          {
            q: "Barang apa yang wajib lapor dulu ke Rimkirim?",
            a: "Barang berbahaya, elektronik berbaterai, barang baru/oleh-oleh, dan makanan/minuman.",
          },
        ],
      },
      {
        name: "Customs & Docs",
        faqs: [
          {
            q: "Apakah paket akan dibuka petugas?",
            a: "Ya, bisa diperiksa fisik untuk mencocokkan isi dengan packing list.",
          },
          {
            q: "Apakah barang saya akan dikenakan pajak?",
            a: "Barang pribadi bekas bisa bebas pajak jika memenuhi syarat; barang baru tetap kena pajak.",
          },
          {
            q: "Syarat bebas pajak status 'Barang Pindahan'?",
            a: "Minimal tinggal/kuliah di luar negeri selama 1 tahun, dengan surat keterangan pindah dari KBRI dan bukti studi/tugas.",
          },
          {
            q: "Syarat status 'Barang Penumpang'?",
            a: "Jika nilai barang di atas sekitar USD 500, akan dikenakan pajak.",
          },
          {
            q: "Dokumen identitas untuk Barang Pindahan?",
            a: "Surat keterangan pindah KBRI, paspor, packing list, boarding pass, tiket, kartu kedatangan, bukti studi/kerja, NPWP/KTP, dan bukti dimensi.",
          },
          {
            q: "Dokumen identitas untuk Barang Penumpang?",
            a: "Paspor, packing list, boarding pass, tiket, kartu kedatangan, NPWP/KTP, dan bukti dimensi.",
          },
          {
            q: "Kenapa perlu E-NPWP?",
            a: "Tanpa E-NPWP, tarif pajak penghasilan yang berlaku lebih tinggi.",
          },
          {
            q: "Apa fungsi kartu kedatangan/boarding pass?",
            a: "Jadi syarat utama untuk pengajuan bebas pajak.",
          },
          {
            q: "Apa itu Commercial Invoice/Packing List?",
            a: "Dokumen berisi info pengirim-penerima, deskripsi barang, jumlah, dan total nilai barang.",
          },
          {
            q: "Apakah kiriman diperiksa bea cukai?",
            a: "Ya, ada verifikasi dokumen dan pemeriksaan fisik.",
          },
          {
            q: "Kapan harus tiba di Indonesia?",
            a: "Untuk status barang pindahan, maksimal 3 bulan sebelum/sesudah barang tiba; untuk barang penumpang, jendela waktunya lebih singkat.",
          },
        ],
      },
      {
        name: "Pricing & Payment",
        faqs: [
          {
            q: "Kapan invoice diterbitkan?",
            a: "Setelah berat/dimensi final dikonfirmasi kurir, biasanya saat barang tiba di Indonesia.",
          },
          {
            q: "Apakah pajak sudah termasuk tarif?",
            a: "Belum, pajak impor dibayar terpisah ke bea cukai; Rimkirim bisa bantu proses pengajuan bebas pajak.",
          },
          {
            q: "Siapa yang membayar pajak?",
            a: "Bisa pengirim atau penerima; FedEx bisa talangi dulu ke bea cukai dengan biaya tambahan.",
          },
          {
            q: "Bisakah biaya berubah setelah dijemput?",
            a: "Bisa, jika berat/dimensi aktual berbeda dari estimasi atau ada biaya gudang tambahan.",
          },
          {
            q: "Bagaimana cara hitung berat volumetrik?",
            a: "Panjang x Lebar x Tinggi (cm) dibagi 5000, sesuai standar FedEx.",
          },
          {
            q: "Kapan kena biaya tambahan (AHS)?",
            a: "Untuk kiriman yang butuh penanganan khusus di luar proses sortir otomatis standar.",
          },
          {
            q: "Apa itu biaya gudang (warehouse fee)?",
            a: "Biaya penyimpanan sementara selama pemeriksaan bea cukai; gratis beberapa hari pertama, lalu dikenakan biaya harian per kg.",
          },
        ],
      },
      {
        name: "Tracking",
        faqs: [
          {
            q: "Bagaimana cara melacak kiriman?",
            a: "Lewat website menggunakan nomor resi.",
          },
          {
            q: "Bisa lacak proses bea cukai secara spesifik?",
            a: "Bisa, update proses impor terlihat di halaman tracking setelah tiba di Indonesia.",
          },
        ],
      },
      {
        name: "Insurance & Claims",
        faqs: [
          {
            q: "Apakah asuransi sudah termasuk tarif?",
            a: "Tidak dijelaskan secara eksplisit; disarankan konfirmasi langsung ke customer support.",
          },
          {
            q: "Bagaimana antisipasi sengketa berat/dimensi?",
            a: "Dokumentasikan berat dan ukuran paket dengan foto/video sebelum dijemput.",
          },
          {
            q: "Bagaimana jika ada selisih pengukuran dari kurir?",
            a: "Ajukan dokumentasi sebagai bukti banding, Rimkirim akan membantu proses pengajuannya ke kurir.",
          },
          {
            q: "Bagaimana cara klaim barang hilang/rusak?",
            a: "Isi form klaim dengan video unboxing, foto barang, daftar nilai barang, dan invoice/CIPL sesuai jenis klaim.",
          },
          {
            q: "Barang apa yang tidak bisa diklaim?",
            a: "Barang bernilai sulit dipastikan atau rawan rusak seperti film foto, barang antik, kaca/pecah belah, perhiasan, logam mulia, alat musik tua, dan sejenisnya, mengikuti kebijakan kurir.",
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
        name: "Service & Coverage",
        faqs: [
          {
            q: "Apa itu layanan 'Moving Abroad'?",
            a: "Layanan pengiriman internasional untuk orang Indonesia yang pindah ke luar negeri dan ingin mengirim barang pribadi secara aman dan legal dari Indonesia.",
          },
          {
            q: "Apakah Rimkirim melayani ekspor/impor selain barang pindahan pribadi?",
            a: "Ya, ada layanan terpisah untuk pengiriman barang umum (bukan barang pindahan).",
          },
          {
            q: "Ke negara mana saja layanan ekspor ini tersedia?",
            a: "Lebih dari 220 negara di 6 benua, kecuali negara yang sedang konflik aktif.",
          },
          {
            q: "Kurir internasional apa yang digunakan?",
            a: "Mitra kurir besar seperti FedEx dan DHL untuk pengiriman udara.",
          },
          {
            q: "Berapa lama waktu pengirimannya?",
            a: "Estimasi 4-8 hari kerja, ditambah proses bea cukai sekitar 1-3 hari kerja, belum termasuk pengiriman domestik di negara tujuan.",
          },
          {
            q: "Bagaimana alur prosesnya?",
            a: "Door-to-door: dijemput dari alamat asal di Indonesia, diantar langsung ke alamat tujuan di luar negeri.",
          },
        ],
      },
      {
        name: "Booking & Pickup",
        faqs: [
          {
            q: "Bagaimana cara booking pengiriman ekspor?",
            a: "Hubungi customer support dan selesaikan booking minimal 3 hari sebelum tanggal jemput.",
          },
          {
            q: "Berapa lama sebelumnya harus booking?",
            a: "Minimal H-3 dari tanggal penjemputan yang diinginkan.",
          },
          {
            q: "Bisa reschedule jadwal jemput?",
            a: "Bisa, dibantu customer support pada hari kerja.",
          },
          {
            q: "Bagaimana jika kurir gagal menjemput?",
            a: "Hubungi customer support untuk menjadwalkan ulang.",
          },
          {
            q: "Apakah ada penjemputan di akhir pekan/libur?",
            a: "Tidak, hanya hari kerja dan mengikuti libur lokal.",
          },
          {
            q: "Apa yang perlu disiapkan sebelum hari penjemputan?",
            a: "Barang sudah dikemas rapi dan dokumen ekspor yang diperlukan sudah lengkap.",
          },
          {
            q: "Syarat lokasi penjemputan?",
            a: "Harus ada area parkir untuk kendaraan kurir di lokasi asal.",
          },
        ],
      },
      {
        name: "Packing",
        faqs: [
          {
            q: "Apakah harus packing sendiri?",
            a: "Ya, pelanggan wajib mengemas barangnya sendiri sebelum dijemput.",
          },
          {
            q: "Cara packing terbaik?",
            a: "Disarankan pakai kardus/moving box; koper atau hard case juga boleh meski risiko rusak lebih tinggi.",
          },
          {
            q: "Ada rekomendasi kardus khusus per negara tujuan?",
            a: "Tidak ada ketentuan khusus, kardus bisa dipilih bebas sesuai kebutuhan dan jenis barang.",
          },
          {
            q: "Boleh pakai bubble wrap/lakban berlebih di luar kardus?",
            a: "Boleh, tapi kena biaya tambahan (Additional Handling Surcharge) per kardus.",
          },
          {
            q: "Bagaimana kalau pakai koper?",
            a: "Diperbolehkan dengan biaya tambahan, dan koper wajib dikunci.",
          },
          {
            q: "Ada batas ukuran/berat?",
            a: "Tidak ada batas ketat, tapi paket berat/besar bisa kena biaya tambahan.",
          },
          {
            q: "Bagaimana cara membungkus kardus yang benar?",
            a: "Bungkus tiap barang dengan bubble wrap, gunakan lakban lebar dengan metode H-taping, dan tempel label pengiriman di sisi atas.",
          },
        ],
      },
      {
        name: "Prohibited Items",
        faqs: [
          {
            q: "Barang apa yang dilarang dikirim?",
            a: "Alkohol, rokok, vape, senjata, bahan peledak, uang tunai, perhiasan, dan tanaman. Aturan bisa beda-beda tergantung negara tujuan, jadi disarankan konfirmasi ke CS.",
          },
          {
            q: "Boleh kirim makanan/minuman?",
            a: "Sebagian boleh asal dideklarasikan lebih dulu dan ada batasannya.",
          },
          {
            q: "Elektronik dengan baterai boleh dikirim?",
            a: "Boleh, asal diinfokan dulu ke CS karena dikategorikan barang khusus.",
          },
          {
            q: "Boleh kirim barang baru/oleh-oleh?",
            a: "Boleh, tapi bisa kena pajak ekspor; disarankan dipisah dari barang bekas.",
          },
          {
            q: "Barang apa yang wajib lapor dulu ke Rimkirim?",
            a: "Barang berbahaya, elektronik berbaterai, barang baru/oleh-oleh, dan makanan/minuman. Aturan bisa beda tiap negara tujuan.",
          },
        ],
      },
      {
        name: "Customs & Docs",
        faqs: [
          {
            q: "Apakah barang saya akan dikenakan pajak?",
            a: "Tergantung regulasi negara tujuan, disarankan konfirmasi langsung ke CS.",
          },
          {
            q: "Syarat bebas pajak status 'Barang Pindahan'?",
            a: "Tergantung kelayakan sesuai aturan negara tujuan dan kelengkapan dokumen; syarat dan dokumen bisa berbeda per negara.",
          },
          {
            q: "Dokumen identitas untuk Barang Pindahan?",
            a: "Packing list, paspor, visa negara tujuan, tiket, bukti sewa tempat tinggal sementara, izin tinggal, NPWP/KTP, dokumen tujuan tinggal (studi/kerja/menikah), dan dokumen pengiriman.",
          },
          {
            q: "Dokumen untuk Barang Kiriman (bukan pindahan)?",
            a: "Packing list, AWB (diterbitkan Rimkirim setelah biaya kirim disetujui), NPWP/KTP, dan dokumen pengiriman.",
          },
          {
            q: "Apa itu Commercial Invoice/Packing List?",
            a: "Dokumen berisi info pengirim-penerima, deskripsi barang, jumlah, dan total nilai barang.",
          },
          {
            q: "Apakah kiriman diperiksa bea cukai?",
            a: "Ya, ada verifikasi dokumen dan pemeriksaan fisik.",
          },
          {
            q: "Perlu dokumen PEB (Pemberitahuan Ekspor Barang)?",
            a: "Tergantung jenis dan berat kiriman; di bawah 30 kg umumnya tidak perlu PEB, di atas itu wajib ada.",
          },
        ],
      },
      {
        name: "Pricing & Payment",
        faqs: [
          {
            q: "Kapan invoice diterbitkan?",
            a: "Invoice (belum termasuk pajak) diterbitkan di awal, dan pembayaran dilakukan sebelum pengiriman.",
          },
          {
            q: "Apakah pajak sudah termasuk tarif?",
            a: "Belum, pajak ekspor dibayar terpisah langsung ke FedEx; Rimkirim bisa bantu proses pengajuan bebas pajak untuk kategori barang pindahan.",
          },
          {
            q: "Siapa yang membayar pajak?",
            a: "Dibayar langsung oleh penerima ke FedEx.",
          },
          {
            q: "Bisakah biaya berubah setelah dijemput?",
            a: "Bisa, jika berat/dimensi aktual berbeda dari estimasi atau ada biaya gudang tambahan.",
          },
          {
            q: "Bagaimana cara hitung berat volumetrik?",
            a: "Panjang x Lebar x Tinggi (cm) dibagi 5000, sesuai standar FedEx.",
          },
          {
            q: "Kapan kena biaya tambahan (AHS)?",
            a: "Untuk kiriman yang butuh penanganan khusus di luar proses sortir otomatis standar.",
          },
          {
            q: "Apa itu biaya gudang (warehouse fee)?",
            a: "Biaya penyimpanan sementara selama pemeriksaan bea cukai; besarannya tergantung negara tujuan, disarankan konfirmasi ke CS.",
          },
        ],
      },
      {
        name: "Tracking",
        faqs: [
          {
            q: "Bagaimana cara melacak kiriman?",
            a: "Lewat website menggunakan nomor resi.",
          },
          {
            q: "Bisa lacak proses bea cukai secara spesifik?",
            a: "Bisa, update proses ekspor terlihat di halaman tracking setelah tiba di negara tujuan.",
          },
        ],
      },
      {
        name: "Insurance & Claims",
        faqs: [
          {
            q: "Apakah asuransi sudah termasuk tarif?",
            a: "Tidak dijelaskan secara eksplisit; disarankan konfirmasi langsung ke customer support.",
          },
          {
            q: "Bagaimana antisipasi sengketa berat/dimensi?",
            a: "Dokumentasikan berat dan ukuran paket dengan foto/video sebelum dijemput.",
          },
          {
            q: "Bagaimana jika ada selisih pengukuran dari kurir?",
            a: "Ajukan dokumentasi sebagai bukti banding, Rimkirim akan membantu proses pengajuannya ke kurir.",
          },
          {
            q: "Bagaimana cara klaim barang hilang/rusak?",
            a: "Isi form klaim sesuai jenis (hilang/rusak) dengan foto, video unboxing, dan invoice/CIPL sebagai bukti pendukung.",
          },
          {
            q: "Barang apa yang tidak bisa diklaim?",
            a: "Barang bernilai sulit dipastikan atau rawan rusak seperti film foto, barang antik, kaca/pecah belah, perhiasan, logam mulia, alat musik tua, dan sejenisnya, mengikuti kebijakan kurir.",
          },
        ],
      },
    ],
  },
];
