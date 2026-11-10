/**
 * What the Expat Relocation order flow still needs Rimkirim to confirm, shown
 * only on `?review=1` (ReviewNote), in the team's language. Each note sits
 * where its rule applies. docs/expat-order-flow.md lists the same for dev.
 */
export const ORDER_REVIEW_NOTES = {
  rates:
    "Data dummy: tarif Special Rate dari tabel impor yang ada, normal rate FedEx/UPS dibuat-buat dan selalu lebih mahal per kg dari Special Rate. Berat dibulatkan ke atas ke kg utuh (aturan dummy, dev menentukan aturan aslinya). Saran alamat juga dummy, pengganti Google Places di live: alamat tanpa kode pos ditolak seperti di live.",
  eligibility:
    "Flag Customs Category (internal, tidak tampil ke customer) dari tabel dummy: 1) alasan Others → personal_shipment; 2) Working/Student tanpa visa → needs_review; 3) punya visa tapi tanpa VITAS dan ITAS → needs_review; 4) sudah di Indonesia → needs_review; 5) sisanya → eligible_pindahan. Q1, tanggal kedatangan, dan lama tinggal tidak mengubah flag. Perlu konfirmasi ops.",
  packing:
    "Langkah baru di luar epic, atas permintaan tim: Packages (dulu Packing List; diganti karena packing list adalah dokumen bea cukai, Commercial Invoice/Packing List) dengan field yang sama seperti modul Barang & Paket di flow WNI (kemasan, berat, panjang/lebar/tinggi, isi tiap paket dengan jumlah dan nilai, mata uang, empat foto ukuran). Kemasan Others membuka field teks bebas \"What's it packed in?\" dengan contoh di placeholder dan di bawah field (tas golf, hard case, tas ski, trunk, case alat musik). Yang wajib: berat, tiga sisi, nama barang, jumlah, dan isian kemasan Others kalau dipilih; nilai barang dan foto opsional, dan lanjut tanpa foto ditanyakan sekali, seperti di WNI. Setelah semua paket terukur, estimasi di Selected Service dihitung ulang untuk layanan yang sama dengan berat chargeable paket (dummy, rumus volumetrik /5000 seperti WNI); kalau layanan itu tidak tersedia di berat tersebut (Special Rate di bawah tier pertama), estimasi Check Rate dipertahankan. Perlu konfirmasi: (1) jumlah wajib dan nilai opsional; (2) foto ukuran memang diminta sebelum pickup, dan kalimat bahwa tanpa foto kami tidak bisa menyanggah hasil ukur kurir; (3) estimasi memang mengikuti berat paket; (4) catatan biaya handling untuk kemasan selain kardus.",
  details:
    "Peta di dialog pin adalah ilustrasi dummy, koordinatnya tidak nyata; produksi memakai peta asli. Semua field wajib (epic hanya menandai dua detail address), karena email dan nomor telepon dibutuhkan untuk konfirmasi dan follow-up. Tanggal pickup bisa dipilih mulai besok (H+1), hari kerja saja; epic menyebut H+3, diubah sesuai feedback tim.",
  booking:
    "Tidak ada backend: tiket tersimpan di localStorage dan tampil di /simulator (tab Pesanan expat) bersama flag dan seluruh jawaban eligibility. Email Booking Summary hanya pratinjau di simulator, dikirim sama ke customer dan hello@rimkirim.com, tanpa flag.",
} as const;
