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
  details:
    "Peta di dialog pin adalah ilustrasi dummy, koordinatnya tidak nyata; produksi memakai peta asli. Semua field wajib (epic hanya menandai dua detail address), karena email dan nomor telepon dibutuhkan untuk konfirmasi dan follow-up.",
  booking:
    "Tidak ada backend: tiket tersimpan di localStorage dan tampil di /simulator (tab Pesanan expat) bersama flag dan seluruh jawaban eligibility. Email Booking Summary hanya pratinjau di simulator, dikirim sama ke customer dan hello@rimkirim.com, tanpa flag.",
} as const;
