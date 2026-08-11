# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dua audiens dengan bobot **setara** — tidak ada yang jadi prioritas kedua:

- **Back For Good (LN → Indonesia).** Orang Indonesia yang selesai studi atau kerja di luar
  negeri dan pulang untuk menetap. Situasinya: sedang membereskan hidup di satu negara
  sambil mengurus kepindahan dari jarak jauh, sering di bawah tekanan tanggal (kontrak habis,
  visa berakhir, kelulusan). Job-nya: memindahkan seluruh barang pribadi lintas negara tanpa
  harus paham bea cukai.
- **Moving Abroad (Indonesia → LN).** Orang atau keluarga Indonesia yang relokasi ke luar
  negeri untuk kerja, studi, atau menetap. Job-nya sama, arah berlawanan.

Keduanya adalah individu/keluarga, bukan pembeli korporat. Keduanya berbelanja harga sebelum
berkomitmen, dan keduanya masuk ke produk dalam kondisi belum tahu berapa biaya sebenarnya.

## Product Purpose

Rimkirim membuat pengiriman barang pribadi lintas negara bisa diselesaikan sendiri oleh orang
biasa: cek tarif dengan angka yang jelas di depan, lalu jalankan proses order sampai barang
sampai rumah — dengan urusan bea cukai diambil alih sepenuhnya oleh Rimkirim.

Sukses = customer tahu total biaya yang harus dibayar **sebelum** komitmen, dan tidak pernah
harus berhadapan sendiri dengan dokumen atau pejabat bea cukai.

## Positioning

Tiga hal yang tidak bisa diklaim jujur oleh forwarder atau agregator tarif sebelah:

1. **Clearance ditangani penuh, termasuk pemilihan jalurnya.** Rimkirim tidak sekadar
   "membantu dokumen" — ia menentukan dan menjalankan jalur clearance yang tepat
   (Personal Belongings vs Passenger Goods) berdasarkan kelayakan customer, lalu
   mengeksekusinya. Customer tidak menyentuh dokumen.
2. **Rimkirim Packing List.** Sistem kode packing list milik Rimkirim (format `RK-PL-XXXXXX`)
   yang membuat isi kiriman terdata dan terverifikasi sebelum barang berangkat, dan menjadi
   rujukan yang sama di sisi clearance. Ini artefak khas Rimkirim, bukan praktik industri umum.
3. **Transparansi harga total.** Base rate, chargeable weight, dan surcharge dibuka sebagai
   breakdown, ditambah perbandingan beberapa 3PL berdampingan — termasuk saat angkanya tidak
   menguntungkan Rimkirim.

Special rate per-negara memang ada di produk, tetapi **belum dikonfirmasi sebagai klaim
pembeda** dan tidak boleh diposisikan sebagai keunggulan yang eksklusif.

## Operating Context

- Customer masuk lewat **kalkulator di landing**, bukan lewat sales. Alur nyatanya:
  landing → `/cek-tarif` (bandingkan harga) → `/pesan` (order). Keputusan harga terjadi
  sebelum ada kontak manusia.
- Kalkulator punya dua kedalaman: **Base** (asal/tujuan saja → special rate) dan **Advance**
  (+ dimensi & berat paket → opsi 3PL dengan breakdown). Banyak customer belum tahu dimensi
  barangnya saat pertama datang.
- Order Back For Good berjalan dalam tiga fase: **Questionnaire** (kelayakan, bercabang, bisa
  memvonis customer tidak eligible), **Clearance** (pilih jalur, di-gate oleh jawaban
  questionnaire), lalu **Module hub** (Customer Info, Item & Packages, Compliance, Pickup —
  Pickup terkunci sampai tiga modul lain selesai).
- Pengisian order tidak selesai dalam satu duduk. Draft bertahan di localStorage; customer
  menutup tab lalu kembali.
- Barang fisik diukur ulang oleh 3PL di lapangan. Foto pengukuran dari customer adalah bukti
  untuk sengketa berat — opsional, tapi konsekuensinya nyata.
- Pendampingan berjalan lewat **WhatsApp** di luar aplikasi; web bukan satu-satunya kanal.

## Capabilities and Constraints

**Sudah berjalan.** Kalkulator dua arah (Back For Good / Moving Abroad); halaman cek tarif
dengan special rate bertingkat dan perbandingan 3PL (FedEx IP/IE, DHL, Aramex); modal
Surcharge Information; alur order Back For Good tiga fase lengkap dengan validasi kode packing
list; bilingual ID + EN.

**Batasan teknis.**
- Next.js 16 (App Router) + TypeScript + Tailwind v4. Versi Next.js ini punya breaking changes
  terhadap konvensi lama — lihat `AGENTS.md`.
- **Belum ada backend.** Semua harga, validasi kode, dan draft order bersifat mock lokal
  (zustand + persist ke localStorage: `rimkirim:calc`, `rimkirim:order`, `rimkirim:lang`).
- Logika terisolasi di `lib/` sebagai fungsi murni supaya bisa ditukar API asli tanpa menyentuh
  UI. Titik swap: `lib/pricing/quote.ts` (entry point), `special-rates.ts`, `corridor-rates.ts`,
  `surcharge-engine.ts`, `lib/data/packing-list.ts`.

**Aturan domain yang mengikat.**
- Chargeable weight = `max(berat aktual, (L×W×H)/5000)`.
- Hanya **satu surcharge tertinggi** yang dikenakan per paket — tidak dijumlahkan.
- Semua tarif yang ditampilkan adalah **estimasi**, bukan harga final yang mengikat.
- Kelayakan clearance ditentukan oleh jawaban questionnaire; customer yang tidak eligible
  diarahkan ke jalur relokasi WNA.

**Terminologi produk** (jangan diterjemahkan atau diganti sinonim): Back For Good,
Moving Abroad, Personal Belongings, Passenger Goods, chargeable weight, special rate,
surcharge, packing list.

**Belum diputuskan / belum dibangun.**
- Alur order **Moving Abroad** — belum ada, meskipun audiensnya setara prioritas.
- Generate PDF packing list, packing-list generator, dan upload dokumen asli.
- Rumus girth: engine memakai `2 × (sisi kedua-terpanjang + sisi terpendek)`, sementara modal
  menampilkan `L + 2W + 2H` sesuai dokumen sumber. Penyelarasan sengaja ditunda.
- Model bisnis, harga layanan Rimkirim sendiri (di luar tarif carrier), dan SLA belum tercatat.

## Brand Commitments

- **Nama & tagline:** Rimkirim — "International Shipping Assistant". Kata *assistant* dipilih;
  produk memposisikan diri sebagai pendamping, bukan marketplace atau portal self-service.
- **Aset:** logo di `public/rimkirim-logo{,-dark,-white}.png`, app icon `app/icon.png`,
  bendera SVG `public/flags/4x3` (flag-icons).
- **Visual yang sudah mengikat** (tercatat sebagai fakta, bukan arahan estetika baru):
  **light mode only** (kanvas putih), aksen brand `#C1FF00` dengan pendamping pastel `#ccfa59`,
  Space Grotesk untuk display + Inter untuk body + JetBrains Mono untuk kode & rupiah.
  Lime dipakai **hanya sebagai fill di balik teks gelap**, tidak pernah sebagai warna teks.
  (Sebelumnya dark mode only; diganti sengaja — lihat DESIGN.md "The Open Desk".)
- **Bahasa:** bilingual Indonesia + Inggris, **ID sebagai source of truth** dan parity
  di-enforce compile-time lewat tipe di `lib/i18n/messages.ts`. Mata uang tetap format `id-ID`
  (Rupiah) di kedua bahasa.
- **Voice:** kasual dan langsung, menyapa "kamu", anti-jargon, meredakan kecemasan tanpa
  menjual berlebihan. Contoh yang sudah disetujui: *"Pulang atau pindah, tanpa drama."*

## Evidence on Hand

**Faktual dan boleh dipakai:**
- **Pendampingan WhatsApp** — tim asisten mendampingi customer dari awal sampai barang tiba.
  Sudah berjalan hari ini.
- Angka surcharge di `lib/pricing/surcharge-engine.ts` dan modal Surcharge Information berasal
  dari dokumen resmi carrier.

**Belum terverifikasi — JANGAN dijadikan fakta, jangan diperkuat, jangan dikarang turunannya:**
- **"Ribuan orang mempercayakan kepindahan mereka ke kami"** (`why.subtitle`) — belum ada data
  pendukung. Perlakukan sebagai copy placeholder.
- **"220+ negara"** (`hero.trustCountries`) — `lib/data/countries.ts` memang memuat ~225 negara
  ISO 3166, tapi itu daftar pilihan di kalkulator, **bukan bukti coverage layanan**.
- **"Asuransi opsional"** (`why.r1Body`) — belum dikonfirmasi ada produk atau partner asuransi.

**Tidak ada sama sekali** (jangan diciptakan): testimonial, nama customer, studi kasus,
liputan pers, sertifikasi, izin PPJK, benchmark kecepatan, jumlah kiriman, dan rating.

## Product Principles

1. **Harga dibuka sebelum diminta.** Angka muncul lebih dulu, komitmen belakangan. Breakdown
   ditampilkan meskipun bikin harga terlihat lebih mahal.
2. **Kompleksitas bea cukai adalah beban Rimkirim, bukan beban customer.** Setiap kali produk
   harus memilih antara mengedukasi customer soal regulasi atau menyerap keputusannya,
   pilih menyerap.
3. **Kedua arah dapat perlakuan setara.** Back For Good yang lebih matang di kode adalah
   utang implementasi, bukan pernyataan prioritas.
4. **Estimasi disebut estimasi.** Jangan pernah menampilkan angka mock atau perkiraan dengan
   kepastian yang tidak dimilikinya.
5. **Progres customer tidak boleh hilang.** Alur order panjang dan terpotong-potong; produk
   harus selalu bisa dilanjutkan dari tempat customer berhenti.

## Accessibility & Inclusion

- **Parity ID/EN wajib.** Setiap string baru harus ada di kedua katalog — dilanggar =
  compile error. Audiensnya tinggal di negara berbahasa Inggris; EN bukan pelengkap.
- **Light mode only** adalah keputusan produk yang sudah diambil. Konsekuensinya kontras teks
  harus dijaga ketat di satu tema itu; tidak ada fallback tema gelap yang menyelamatkan.
  Konsekuensi khas kanvas terang: warna brand lime `#C1FF00` **gagal kontras sebagai teks,
  ikon, border, maupun focus ring** (~1.1:1 di atas putih), jadi semuanya memakai tinta gelap
  dan lime hanya jadi fill.
- Tidak ada standar formal (WCAG level tertentu) yang ditetapkan sejauh ini.
