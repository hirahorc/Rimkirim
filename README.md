# Rimkirim — Customer-Facing Web

Frontend alur customer Rimkirim (jasa pengiriman & relokasi internasional).
**Next.js 16 (App Router) + TypeScript + Tailwind v4**, **dark mode only**, brand accent
`#C1FF00`, font Space Grotesk (display) + Inter (body). **Bilingual ID + EN** dengan toggle
di header. Belum ada backend — semua data harga & order di-mock dan disimpan lokal
(localStorage), diisolasi supaya gampang diganti API asli.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Halaman & alur

```
/            Landing (hero + shipment calculator)
   └─ "Cek Harga" ─► /cek-tarif        Price cards (special rate / 3PL compare)
        └─ CTA "Pilih/Lanjut pesan" ─► /pesan   Customer order (Back For Good)
             /pesan            Fase 1 — Questionnaire (kelayakan + branching)
             /pesan/clearance  Fase 2 — Clearance options (Personal / Passenger)
             /pesan/modul       Fase 3 — Module hub (4 modul draft)
             /pesan/modul/[id]  Form tiap modul
```

### Calculator (landing)
- **Toggle layanan:** Back For Good (impor: LN → Indonesia, tujuan terkunci Indonesia) &
  Moving Abroad (ekspor: Indonesia → LN, asal terkunci Indonesia).
- **Base:** asal/tujuan + alamat → **Special Rate** per-negara.
- **Advance:** Base + detail paket (berat, L×W×H, qty, tambah paket) + **chargeable weight**
  live (`(L×W×H)/5000`, ambil terbesar vs berat aktual) → **beberapa opsi 3PL** dengan
  breakdown base rate + surcharge.

### Check Rates (`/cek-tarif`)
- **Special Rate** (Base) — tarif khusus **per-negara & bertingkat (tier)**; tiap tier jadi
  card sendiri. Import & export punya tabel berbeda; sebagian negara belum punya special rate.
- **3PL compare** (Advance) — beberapa vendor (FedEx IP/IE, DHL, Aramex) + **Surcharge
  Information modal** (Additional Handling Surcharge per kelas Parcels/Express & Large,
  plus Other Logistic Costs). Bila chargeable weight masuk salah satu tier special rate,
  **special rate ikut muncul sebagai card** (pill "Special Rate") dan **kena surcharge yang
  sama** seperti card 3PL. Klik **Ubah** balik ke kalkulator dengan semua input utuh.

### Customer Order — Back For Good (`/pesan`)
- **Fase 1 Questionnaire:** 5 pertanyaan kelayakan dengan percabangan (tidak eligible /
  diarahkan ke relokasi WNA), negara pertanyaan dinamis dari kalkulator, dan **validasi
  kode Rimkirim Packing List** (mock lookup).
- **Fase 2 Clearance:** pilih **Personal Belongings** / **Passenger Goods** (di-gate oleh
  jawaban questionnaire) — select card lalu satu tombol Continue.
- **Fase 3 Module hub:** 4 modul draft (Customer Info, Item & Packages, Compliance,
  Pickup). Pickup terkunci sampai 3 modul lain selesai; indikator packing list "ready"
  setelah Customer Info + Items; submit akhir → konfirmasi (mock).
- **Item & Packages:** paket bisa di-**collapse** (header ringkasan + Tutup/Buka semua +
  chip loncat ke paket tertentu) dengan count paket di header. Tiap paket berisi kartu
  "items inside" (deskripsi · qty · nilai/item + total per baris) dan footer **jumlah
  barang + total nilai per paket**. Mata uang deklarasi default = negara asal pengiriman.

## Arsitektur data (mock — titik swap ke API asli)

Semua logika terisolasi di `lib/` sebagai fungsi murni. Untuk pakai API asli, **cukup ubah
isi file berikut tanpa menyentuh komponen UI**:

| File | Peran |
|------|-------|
| `lib/pricing/quote.ts` | `calculateQuotes(input)` — gabungan corridor rate × chargeable weight + surcharge + resolve special rate. **Entry point utama** yang dipanggil UI. |
| `lib/pricing/special-rates.ts` | Tabel special rate per-negara **bertingkat**, arah **import & export**, + carrier/service (default FedEx Economy). |
| `lib/pricing/corridor-rates.ts` | Rate per-kg per zona + ETA (dipakai opsi 3PL Advance). |
| `lib/pricing/surcharge-engine.ts` | Klasifikasi paket (Parcels/Express vs Large) + Additional Handling Surcharges. **Hanya 1 surcharge tertinggi per paket.** |
| `lib/utils/chargeable-weight.ts` | Volumetrik `/5000` + aturan `max(aktual, volumetrik)`. |
| `lib/data/countries.ts` | Daftar negara ISO 3166 (~225) + zona. Bendera = SVG di `public/flags/4x3` (lipis/flag-icons). |
| `lib/data/vendors.ts` | Vendor 3PL mock. |
| `lib/data/packing-list.ts` | `validatePackingCode()` — mock registry (ganti dgn API). Kode valid demo: `RK-PL-000123`. |

### State (zustand + persist / localStorage)
- `lib/store/useCalculatorStore.ts` — input kalkulator (`rimkirim:calc`).
- `lib/store/useOrderStore.ts` — draft order + jawaban questionnaire + status modul
  (`rimkirim:order`) + selector (`allowedClearance`, `isPickupUnlocked`, dll).

### Surcharge (dari dokumen resmi)
- **Parcels/Express:** Oversize (Rp1.072.000), Overdimension/Overweight/Packaging (Rp495.000).
- **Large:** Freight (Rp2.944.000), Non-Stackable (Rp3.700.000), Unauthorized Freight (Rp7.306.000).
- **Aturan:** hanya surcharge **tertinggi** yang dikenakan per paket (bukan dijumlah).
- **Girth** engine = `2 × (sisi kedua-terpanjang + sisi terpendek)`. *(Catatan: modal
  menampilkan rumus `L + 2W + 2H` sesuai sumber; penyelarasan ditunda.)*

## i18n

`lib/i18n/messages.ts` (katalog `id` + `en`, tipe di-derive dari `id` → parity di-enforce
compile-time) + `LanguageProvider` (context, `t("ns.key")`, persist `rimkirim:lang`) +
`LanguageToggle` di header. Mata uang tetap format `id-ID` (Rupiah) di dua bahasa.

## Struktur

```
app/            layout (dark shell) · page.tsx (landing) · cek-tarif/ · pesan/ (+ clearance, modul)
components/
  ui/           primitives (button, card, input, badge, checkbox, toggle-group, popover, dialog, tabs, tooltip)
  layout/       Logo, AppHeader, AppFooter, LanguageToggle
  landing/      Hero, InfoSections, ShipmentCalculator, PackageRow
  rates/        CheckRatesClient, RateInputSummary, SpecialRateCard, RateCard, PriceBreakdown, SurchargeInfoDialog
  order/        OrderShell, Questionnaire, ClearanceOptions, ModuleHub, ModuleForm, useStartOrder
  shared/       CountrySelect, Flag
lib/            pricing/ · data/ · store/ · schemas/ · i18n/ · utils/
public/         rimkirim logo, app icon, flags/4x3 (SVG)
```

## Catatan / ditunda
- Belum ada backend — order draft & validasi bersifat mock lokal.
- Generate PDF packing list, packing-list generator, upload dokumen asli, dan **order flow
  Moving Abroad** = fase berikutnya.
- Semua tarif = **estimasi**; siap diganti rate/carrier API asli.
