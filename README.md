# Rimkirim — Customer-Facing Revamp (Phase 1)

Frontend untuk alur customer Rimkirim (jasa pengiriman & relokasi internasional).
Fase 1 mencakup **2 halaman**:

1. **Landing page** (`/`) — hero + **shipment calculator**.
2. **Check Rates** (`/cek-tarif`) — hasil perhitungan berupa **price card**.

Dibangun dengan **Next.js 16 (App Router) + TypeScript + Tailwind v4**. **Dark mode only**,
brand accent `#C1FF00`, font Space Grotesk (display) + Inter (body).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Alur

```
/  (kalkulator)  ──submit "Cek Harga"──►  zustand store  ──►  /cek-tarif  (price cards)
```

### Calculator
- **Toggle layanan:** Back For Good (impor: LN → Indonesia, tujuan terkunci ke Indonesia)
  & Moving Abroad (ekspor: Indonesia → LN, asal terkunci ke Indonesia).
- **Mode Base:** asal/tujuan + alamat → menghasilkan **Special Rate** flat `Rp135.000/kg`,
  minimum 21 kg.
- **Mode Advance:** Base + detail paket (berat, L×W×H, qty, tambah paket) + **chargeable
  weight** live (`(L×W×H)/5000`, ambil nilai terbesar vs berat aktual) → menghasilkan
  **beberapa opsi 3PL** dengan breakdown base rate + surcharge.

## Arsitektur data (mock — titik swap ke API asli)

Semua logika harga terisolasi di `lib/` sebagai fungsi murni. Untuk mengganti ke rate/3PL
API asli, **cukup ubah isi file berikut tanpa menyentuh komponen UI**:

| File | Peran |
|------|-------|
| `lib/pricing/quote.ts` | `calculateQuotes(input)` — gabungan rate × chargeable weight + surcharge. **Entry point utama** yang dipanggil UI. |
| `lib/pricing/corridor-rates.ts` | Tabel rate per-kg per zona + ETA + `SPECIAL_RATE`. Ganti dengan hasil API rate. |
| `lib/pricing/surcharge-engine.ts` | Klasifikasi paket (Parcels/Express vs Large) + Additional Handling Surcharges, sesuai dokumen *Updated Surcharges & Conditions*. |
| `lib/utils/chargeable-weight.ts` | Volumetrik `/5000` + aturan `max(aktual, volumetrik)`. |
| `lib/data/countries.ts` | Daftar negara + zona + flag. |
| `lib/data/vendors.ts` | Vendor 3PL mock (FedEx IP/IE, DHL, Aramex). Ganti dengan daftar carrier asli. |

State kalkulator dibawa antar-halaman via `lib/store/useCalculatorStore.ts`
(zustand + persist, localStorage key `rimkirim:calc`).

### Surcharge (dari dokumen resmi)
- **Parcels/Express:** Oversize (Rp1.072.000), Overdimension (Rp495.000),
  Overweight (Rp495.000), Packaging (Rp495.000, opsional).
- **Large:** Freight (Rp2.944.000), Non-Stackable (Rp3.700.000, opsional),
  Unauthorized Freight (Rp7.306.000).
- **Girth** = `2 × (sisi kedua-terpanjang + sisi terpendek)`.
- Packaging & Non-Stackable tak bisa dihitung dari dimensi → checkbox opsional di Advance.

## Struktur

```
app/            layout (dark shell), page.tsx (landing), cek-tarif/page.tsx
components/
  ui/           primitives (button, card, input, badge, checkbox, toggle-group, popover)
  layout/       Logo, AppHeader, AppFooter
  landing/      Hero, InfoSections, ShipmentCalculator, PackageRow
  rates/        CheckRatesClient, RateInputSummary, SpecialRateCard, RateCard, PriceBreakdown
  shared/       CountrySelect (combobox negara)
lib/            pricing/ · data/ · store/ · schemas/ · utils/
```

## Catatan
- Belum ada backend — dashboard & order form adalah fase berikutnya.
- Tarif bersifat estimasi (mock) dan siap diganti dengan rate/carrier API asli.
