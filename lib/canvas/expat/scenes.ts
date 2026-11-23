import { breakBookingNumber } from "@/components/expat-order/dev/break-fixtures";
import { messages } from "@/lib/i18n/messages";
import { EMPTY_CHECK, EMPTY_DETAILS, EMPTY_ELIGIBILITY } from "@/lib/order/expat-order";
import type { Board, Gap, Scene, Step, Target } from "../types";
import { booked, checked, dataset, days, demo, draft, pkg, placeOf, planned, seed, tickets } from "./seeds";

/**
 * The Expat Relocation order flow as scenes: every state its stories ask
 * for, each one a page opened on a seed and, where a stored draft can't
 * reach the state, a few steps. Lanes are the brief's tickets (RPW-290 to
 * RPW-297); a row is a story's positive path, its negative ones, or its
 * edge data.
 *
 * Steps find what they press by the flow's own copy (messages.en), so a
 * label that's reworded is still found. Notes and arrow labels are in
 * Indonesian, as the flow's review notes are; what's on the screen is
 * quoted as the screen says it.
 */

const M = messages.en.expatOrder;
/** the simulator is the team's, in Indonesian */
const OPS = messages.id.expatOrder.ops;
const LANDING = "/expat-relocation";
const SIMULATOR = "/simulator";
const RATES = "/expat-relocation/rates";
const PLAN = "/expat-relocation/plan";
const booking = (number: string) => `/expat-relocation/booking/${number}`;

/* what the steps press */
const button = (name: string, more: Partial<Target> = {}): Target => ({ role: "button", name, ...more });
const CHECK = button(M.rates.submit);
const CONTINUE = button(M.plan.continue);
const CONFIRM = button(M.plan.confirm);
const part = (k: "eligibility" | "details" | "packing") => button(M[k].title);
const WEIGHT: Target = { label: M.rates.weight };
const ORIGIN_ADDRESS: Target = { placeholder: M.rates.addressPh, nth: 0 };
const DIALOG: Target = { css: "[role='dialog']" };

/** a toast, or a moment the page paces, stays once the timer that ends it is held */
const HOLD: Step = { do: "hold", over: 2500 };
const click = (on: Target): Step => ({ do: "click", on });
const fill = (on: Target, text: string): Step => ({ do: "fill", on, text });
const wait = (ms: number): Step => ({ do: "wait", ms });

const d = demo();
const NUMBER = breakBookingNumber("demo");

/* --------------------------------------------------------------- Check Rate */

const rates: Scene[] = [
  {
    id: "rates-empty",
    title: "Form kosong",
    note: "Kunjungan pertama. Alamat terkunci sampai negara asal dipilih.",
    via: "Landing: “Check your rate”",
    path: RATES,
    seed: () => seed(draft()),
  },
  {
    id: "rates-address",
    title: "Saran alamat",
    note: "Mengetik di alamat membuka saran. Tempat tanpa kode pos ikut muncul, tapi ditolak saat dipilih.",
    via: "Pilih negara, ketik alamat",
    path: RATES,
    seed: () => seed(draft({ check: { ...EMPTY_CHECK, originCountry: "AU" } })),
    steps: [fill(ORIGIN_ADDRESS, "syd")],
  },
  {
    id: "rates-filled",
    title: "Form terisi",
    note: "Asal, tujuan dan berat sudah diisi. Tombolnya lime: ada yang bisa dicek.",
    via: "Pilih alamat, isi berat",
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: null })),
    steps: [fill(WEIGHT, "30")],
  },
  {
    id: "rates-checking",
    title: "Checking…",
    note: "Loading selama tarif diambil. Di prototype tarifnya lokal, jadi jedanya sengaja (pace.ts).",
    via: "Tekan “Check rates”",
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: null })),
    steps: [fill(WEIGHT, "30"), { do: "hold", over: 650 }, click(CHECK)],
  },
  {
    id: "rates-required",
    title: "Check rates saat kosong",
    note: "Tiap isian yang kurang ditandai di tempatnya, dan yang pertama mendapat fokus.",
    via: "Tekan “Check rates” tanpa mengisi",
    from: "rates-empty",
    path: RATES,
    seed: () => seed(draft()),
    steps: [click(CHECK)],
  },
  {
    id: "rates-no-results",
    title: "Alamat tidak ditemukan",
    note: "“No places found. Try a street name.”",
    via: "Ketik alamat yang tidak ada",
    from: "rates-address",
    path: RATES,
    seed: () => seed(draft({ check: { ...EMPTY_CHECK, originCountry: "AU" } })),
    steps: [fill(ORIGIN_ADDRESS, "zzzz")],
  },
  {
    id: "rates-no-postal",
    title: "Tempat tanpa kode pos",
    note: "Ditolak saat itu juga, bukan menunggu Check rates: tarif dihitung dari kode pos.",
    via: "Pilih “Sydney” (area, tanpa kode pos)",
    from: "rates-address",
    path: RATES,
    seed: () => seed(draft({ check: { ...EMPTY_CHECK, originCountry: "AU", origin: placeOf("AU", "syd", 0) } })),
  },
  {
    id: "rates-estimate",
    title: "Estimate: Special Rate",
    note: "Satu tarif, yang termurah. Negara asal punya Special Rate, jadi itu yang tampil dulu.",
    via: "Tarif ditemukan",
    from: "rates-checking",
    path: RATES,
    seed: () => seed(checked(d.check)),
  },
  {
    id: "rates-normal",
    title: "Estimate: tanpa Special Rate",
    note: "Brasil tidak punya Special Rate: Normal Rate termurah per kg yang tampil dulu.",
    via: "Negara tanpa Special Rate",
    from: null,
    path: RATES,
    seed: () => seed(checked({ ...d.check, originCountry: "BR", origin: placeOf("BR", "rio", 1) })),
  },
  {
    id: "rates-more",
    title: "See more rates",
    note: "Tarif lain terbuka di bawahnya, termurah dulu.",
    via: "Tekan “See more rates”",
    from: "rates-estimate",
    path: RATES,
    seed: () => seed(checked(d.check)),
    steps: [click(button("See more rates", { contains: true }))],
  },
  {
    id: "rates-rounded",
    title: "Berat dibulatkan",
    note: "30,4 kg dihitung sebagai 31 kg: “Priced at 31 kg”.",
    via: "Berat tidak bulat",
    from: null,
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: 30.4 })),
  },
  {
    id: "rates-below-tier",
    title: "Di bawah tier Special Rate",
    note: "10 kg belum masuk Special Rate (mulai 21 kg): Normal Rate tampil, dengan keterangan mulai berapa.",
    via: "Berat di bawah 21 kg",
    from: "rates-estimate",
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: 10 })),
  },
  {
    id: "rates-stale",
    title: "Form diubah setelah estimate",
    note: "Estimate lama redup dan tidak bisa dipilih sampai dicek lagi.",
    via: "Ubah berat",
    from: "rates-estimate",
    path: RATES,
    seed: () => seed(checked(d.check)),
    steps: [fill(WEIGHT, "45")],
  },
];

const NO_SERVICE: Gap = {
  gap: true,
  id: "rates-no-service",
  title: "No rate available / country not served",
  note: "Diminta RPW-290: pesan yang jelas dan langkah berikutnya. Belum ada di prototype (tarifnya lokal, jadi selalu ada); tercatat di “Still to build”.",
  via: "Rute tidak dilayani",
  from: "rates-checking",
};

/* --------------------------------------------------------------------- Plan */

const ELIG_INDONESIA = {
  ...EMPTY_ELIGIBILITY,
  items: ["personal" as const],
  location: "indonesia" as const,
  arrivalDate: days(-20),
  hasVisa: false,
  reason: "student" as const,
};
const ELIG_OTHERS = {
  ...EMPTY_ELIGIBILITY,
  items: ["personal" as const, "others" as const],
  itemsOther: "A digital piano",
  location: "abroad" as const,
  arrivalDate: days(30),
  hasVisa: true,
  hasVitas: false,
  hasItas: true,
  reason: "others" as const,
  reasonOther: "Joining my partner",
};

const plan: Scene[] = [
  /* RPW-297: the shell */
  {
    id: "plan-start",
    title: "Plan terbuka di Eligibility",
    note: "Tiga bagian di satu halaman, satu terbuka. Yang belum bisa dicapai berdiri di belakang.",
    via: "Check Rate: “Select this rate”",
    path: PLAN,
    seed: () => seed(planned()),
  },
  {
    id: "plan-part-done",
    title: "Bagian selesai, berikutnya terbuka",
    note: "Eligibility melipat jadi satu baris yang mengulang jawabannya; Your details terbuka di bawahnya.",
    via: "Jawab semua, tekan “Continue”",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
  },
  {
    id: "plan-all-done",
    title: "Semua selesai",
    note: "Ketiganya terlipat, tombolnya jadi “Confirm application”. Tiap bagian bisa dibuka lagi lewat “Edit”.",
    via: "Isi Your details dan Packages",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details, packing: d.packing })),
  },
  {
    id: "plan-welcome",
    title: "Kembali dengan draft",
    note: "Draft bertahan di perangkat sampai dikirim. Kunjungan berikutnya menyapa sekali: “Welcome back. Your answers are still here.”",
    via: "Tutup tab, buka lagi nanti",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility }), { returning: true, hold: 2500 }),
    view: "screen",
  },
  {
    id: "plan-no-rate",
    title: "Plan dibuka tanpa rate",
    note: "Dikembalikan ke Check Rate, dengan alasannya: “Check your rate first, then plan your relocation.”",
    via: "Buka /plan langsung, belum pilih rate",
    from: null,
    path: PLAN,
    seed: () => seed(checked(d.check), { hold: 2500 }),
    view: "screen",
  },
  {
    id: "plan-missing",
    title: "Continue saat belum lengkap",
    note: "Tombolnya tidak pernah mati: yang kurang ditandai, yang pertama mendapat fokus, dan toast menghitung sisanya.",
    via: "Tekan “Continue” tanpa menjawab",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [HOLD, click(CONTINUE)],
    view: "screen",
  },

  /* RPW-296: the customs guide */
  {
    id: "customs-first",
    title: "Kunjungan pertama: terbuka sendiri",
    note: "Setengah detik setelah plan tampil, panduan keluar dari tombolnya. Dialog di desktop, sheet di mobile.",
    via: "Masuk plan pertama kali",
    path: PLAN,
    seed: () => seed(planned(), { firstVisit: true }),
    steps: [{ do: "see", on: DIALOG }, wait(700)],
    view: "screen",
  },
  {
    id: "customs-hint",
    title: "Ditutup: tombolnya mengingatkan",
    note: "Panduan kembali ke tombolnya, dan pertama kali itu ada tulisan “Open this again here, any time.”",
    via: "Tekan “Got it”",
    path: PLAN,
    seed: () => seed(planned(), { firstVisit: true }),
    steps: [{ do: "see", on: DIALOG }, wait(600), { do: "hold", over: 3000 }, click(button(M.customs.gotIt)), wait(900)],
    view: "screen",
  },
  {
    id: "customs-reopen",
    title: "Dibuka lagi dari tombol",
    note: "Kunjungan berikutnya panduan tidak terbuka sendiri; tombolnya selalu ada di layar.",
    via: "Tekan “How your belongings clear customs”",
    from: null,
    path: PLAN,
    seed: () => seed(planned()),
    steps: [click(button(M.customs.title)), wait(600)],
    view: "screen",
  },

  /* RPW-292: the Eligibility Check */
  {
    id: "elig-abroad",
    title: "Belum tiba, punya VITAS",
    note: "Q2 “I have not arrived yet” meminta estimated arrival date; Q3 “Yes” membuka VITAS dan ITAS.",
    via: "Jawab Q1–Q4",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [click(part("eligibility"))],
  },
  {
    id: "elig-indonesia",
    title: "Sudah tinggal di Indonesia, tanpa visa",
    note: "Q2 meminta tanggal tiba (sampai hari ini); Q3 “No” menyembunyikan VITAS dan ITAS.",
    via: "Cabang lain Q2 dan Q3",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: ELIG_INDONESIA })),
    steps: [click(part("eligibility"))],
  },
  {
    id: "elig-others",
    title: "“Others” di Q1 dan Q4",
    note: "Keduanya meminta beberapa kata. Tidak ada jawaban yang menghentikan pesanan.",
    via: "Pilih “Others”",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: ELIG_OTHERS })),
    steps: [click(part("eligibility"))],
  },
  {
    id: "elig-missing",
    title: "Belum ada yang dijawab",
    note: "“Choose at least one.” di Q1, “Choose an answer.” di Q2–Q4.",
    via: "Tekan “Continue” tanpa menjawab",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [HOLD, click(CONTINUE)],
  },
  {
    id: "elig-followups",
    title: "Pertanyaan lanjutan kosong",
    note: "Tanggal tiba, VITAS/ITAS dan isi “Others” ikut wajib begitu jawabannya memunculkan mereka.",
    via: "Jawab, tapi lewati lanjutannya",
    from: "plan-start",
    path: PLAN,
    seed: () =>
      seed(
        planned({
          eligibility: { ...EMPTY_ELIGIBILITY, items: ["others"], location: "abroad", hasVisa: true, reason: "others" },
        }),
      ),
    steps: [HOLD, click(CONTINUE)],
  },

  /* RPW-292 + RPW-295: the furniture warning */
  {
    id: "furn-off",
    title: "Q1 tanpa furniture",
    note: "Catatan “You pack everything yourself” selalu ada di bawah Q1, apa pun yang dipilih.",
    via: "Pilih kategori selain furniture",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: { ...EMPTY_ELIGIBILITY, items: ["personal"] } })),
  },
  {
    id: "furn-on",
    title: "Q1 dengan furniture",
    note: "Catatannya bertambah “, furniture included” dan tautannya jadi “See how to pack furniture”.",
    via: "Pilih “Furniture & Large Household Goods”",
    path: PLAN,
    seed: () => seed(planned({ eligibility: { ...EMPTY_ELIGIBILITY, items: ["furniture", "personal"] } })),
  },

  /* RPW-293: Personal Information */
  {
    id: "details-address",
    title: "Kartu alamat diubah",
    note: "“Change” mengganti kartu dengan editornya di tempat: alamat (dalam negaranya) dan detail address, yang opsional.",
    via: "Tekan “Change” di kartu asal",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [click(button(M.details.change, { nth: 0 }))],
  },
  {
    id: "details-date",
    title: "Pickup date",
    note: "Hari kerja saja, mulai besok. Akhir pekan dan hari ini tidak bisa dipilih.",
    via: "Buka “Pickup date”",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [click(button(M.details.pickup)), wait(300)],
  },
  {
    id: "details-filled",
    title: "Your details terisi",
    note: "Nama, email, telepon (kode negara dari negara asal) dan pickup date; detail address di kedua kartu.",
    via: "Isi semuanya",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [click(part("details"))],
  },
  {
    id: "details-left",
    title: "Field ditinggal saat salah",
    note: "Salahnya muncul begitu field ditinggal, bukan menunggu tombol: “Enter an email like name@domain.com.”",
    via: "Isi email salah, pindah field",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [
      fill({ label: M.details.email }, "alex@rimkirim"),
      { do: "leave", on: { label: M.details.email } },
      { do: "leave", on: { label: M.details.fullName } },
    ],
  },
  {
    id: "details-required",
    title: "Continue saat kosong",
    note: "“Required.” di tiap isian, dan toast menghitung yang kurang.",
    via: "Tekan “Continue” tanpa mengisi",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [HOLD, click(CONTINUE)],
  },
  {
    id: "details-pickup-past",
    title: "Pickup date sudah lewat",
    note: "Draft dari beberapa hari lalu: tanggalnya tidak bisa dipakai lagi, dan itu dikatakan saat itu juga.",
    via: "Kembali ke draft lama",
    from: null,
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: { ...d.details, pickupDate: days(-2) } })),
  },
  {
    id: "details-changed",
    title: "Alamat diganti di Check Rate",
    note: "Detail address sisi itu dikosongkan, supaya kurir tidak dikirim ke unit alamat lama; kartunya bilang begitu.",
    via: "Ganti alamat tujuan di Check Rate",
    from: null,
    path: PLAN,
    seed: () =>
      seed(
        planned({
          eligibility: d.eligibility,
          details: { ...EMPTY_DETAILS, dialIso: d.check.originCountry },
          addressChanged: { origin: false, destination: true },
        }),
      ),
  },
  {
    id: "details-address-pick",
    title: "Simpan alamat tanpa memilih",
    note: "“Pick an address from the list, so we get its postal code.”",
    via: "Kosongkan alamat, tekan “Save address”",
    from: "details-address",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [
      click(button(M.details.change, { nth: 0 })),
      click(button(M.rates.addressClear)),
      click(button(M.details.save)),
    ],
  },

  /* RPW-295: the Packages */
  {
    id: "pack-start",
    title: "Package 1, belum diisi",
    note: "Bagian terakhir plan. Mulai dengan satu package; ukuran dipilih dulu, baru berat dan isinya.",
    via: "Your details selesai",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
  },
  {
    id: "pack-category",
    title: "Memilih kategori isi",
    note: "Enam belas kategori dengan contohnya, bisa dicari. “Others” meminta namanya.",
    via: "Buka “Category”",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [click({ text: M.packing.categoryPh }), wait(300)],
  },
  {
    id: "pack-filled",
    title: "Dua package terisi",
    note: "Satu Medium Box, satu Custom (suitcase). Total di bawahnya, dan estimate sekarang memakai berat package.",
    via: "Isi ukuran, berat dan isi",
    from: "pack-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details, packing: d.packing })),
    steps: [click(part("packing"))],
  },
  {
    id: "pack-missing",
    title: "Confirm saat package belum lengkap",
    note: "“Choose a package size.” dan “Required.” di tempatnya; package yang terlipat membuka diri.",
    via: "Tekan “Confirm application”",
    from: "pack-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [HOLD, click(CONFIRM)],
  },
  {
    id: "pack-odd",
    title: "Ukuran atau berat tidak wajar",
    note: "Sisi di atas 300 cm atau berat di atas 500 kg ditanyakan lagi, tidak pernah ditolak. Dua angka itu masih placeholder.",
    via: "Isi 400 cm dan 600 kg",
    from: "pack-filled",
    path: PLAN,
    seed: () =>
      seed(
        planned({
          eligibility: d.eligibility,
          details: d.details,
          packing: { currency: "", packages: [pkg("odd", { weight: "600", length: "400", width: "60", height: "60" })] },
        }),
      ),
    steps: [click(part("packing"))],
  },
  {
    id: "pack-remove",
    title: "Menghapus package",
    note: "Ditanya dulu: ukuran, berat dan isinya ikut hilang, dan tidak bisa dibatalkan.",
    via: "Tekan “Remove” di Package 2",
    from: "pack-filled",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details, packing: d.packing })),
    steps: [click(part("packing")), wait(400), click(button(M.packing.removePackage.replace("{n}", "2"))), wait(500)],
    view: "screen",
  },
  {
    id: "pack-category-empty",
    title: "Pencarian kategori tanpa hasil",
    note: "“Others” selalu tinggal di daftar, jadi pencarian yang tidak cocok tetap punya jalan: pilih Others, lalu sebut barangnya.",
    via: "Cari kategori yang tidak ada",
    from: "pack-category",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [click({ text: M.packing.categoryPh }), wait(300), fill({ placeholder: M.packing.categorySearch }, "zzz")],
  },
  {
    id: "pack-below-tier",
    title: "Package di bawah tier Special Rate",
    note: "Berat package (5 kg) belum masuk Special Rate, jadi estimate tetap di berat yang dicek (30 kg).",
    via: "Package lebih ringan dari 21 kg",
    from: "pack-filled",
    path: PLAN,
    seed: () =>
      seed(
        planned({
          eligibility: d.eligibility,
          details: d.details,
          packing: { currency: "", packages: [pkg("light", { box: "A", weight: "5" })] },
        }),
      ),
    steps: [click(part("packing"))],
  },

  /* the team's addition: changing the service on the plan */
  {
    id: "service-change",
    title: "Change your service",
    note: "Semua service untuk rutenya, Special Rate dulu lalu termurah. Yang sedang dipakai ditandai “Selected”.",
    via: "Tekan “Change” di Selected service",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [click(button(M.service.changeTitle)), wait(600)],
    view: "screen",
  },
  {
    id: "service-changed",
    title: "Service diganti",
    note: "Jawaban tetap; estimate dihitung ulang, dan toast bilang service apa yang sekarang dipakai.",
    via: "Tekan “Select this rate” di service lain",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [
      click(button(M.service.changeTitle)),
      wait(600),
      HOLD,
      click(button(M.rates.select, { contains: true, within: "[role='dialog']", nth: 0 })),
      wait(600),
    ],
    view: "screen",
  },

  /* edge data */
  {
    id: "plan-worst",
    title: "Worst case",
    note: "Nilai terpanjang yang diterima tiap field: nama 120 karakter, email yang tidak bisa dipotong, ukuran dalam satuan yang salah.",
    from: null,
    path: PLAN,
    seed: () => seed(dataset("worst")),
    steps: [click(part("details"))],
  },
  {
    id: "plan-many",
    title: "40 packages",
    note: "Satu rumah, package demi package. Yang sudah lengkap mulai terlipat.",
    from: null,
    path: PLAN,
    seed: () => seed(dataset("many")),
    steps: [click(part("packing"))],
  },

  /* RPW-294, on the plan's side */
  {
    id: "plan-confirming",
    title: "Confirming…",
    note: "Submitting: plan diam di bawah tombol yang bilang apa yang sedang terjadi.",
    via: "Tekan “Confirm application”",
    from: "plan-all-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details, packing: d.packing })),
    steps: [{ do: "hold", over: 1000 }, click(CONFIRM)],
    view: "screen",
  },
];

const FURNITURE_PACKAGES: Gap = {
  gap: true,
  id: "furn-packages",
  title: "Warning furniture di Shipment Information",
  note: "Diminta brief: callout yang sama muncul lagi saat furniture dideklarasikan di package. Di prototype, memilih kategori “Furniture” tidak memunculkan apa-apa.",
  via: "Pilih kategori “Furniture” di package",
};

/* ----------------------------------------------------------- Booking Summary */

const bookingScenes: Scene[] = [
  {
    id: "booking-fresh",
    title: "Baru dikonfirmasi",
    note: "Kepala “Booking received” menggambar centangnya sekali, lalu dialog “We’ll contact you within 1 working day”.",
    via: "Booking terdaftar",
    from: "plan-confirming",
    path: booking(NUMBER),
    seed: () => seed(booked("demo"), { justBooked: NUMBER }),
    steps: [{ do: "see", on: DIALOG }, wait(700)],
    view: "screen",
  },
  {
    id: "booking-summary",
    title: "Booking Summary",
    note: "Nomor booking, What happens next (tiga langkah, invoice menyusul), lalu catatan pesanannya. Customs Category tidak pernah tampil.",
    via: "Tekan “Got it”",
    path: booking(NUMBER),
    seed: () => seed(booked("demo")),
  },
  {
    id: "booking-docs",
    title: "Documents to get ready",
    note: "Tiga Customs Path dengan dokumennya, terlipat di bawah langkah yang memintanya.",
    via: "Buka “Documents to get ready”",
    from: "booking-summary",
    path: booking(NUMBER),
    seed: () => seed(booked("demo")),
    steps: [click(button(M.customs.docsTitle, { contains: true })), wait(500)],
  },
  {
    id: "booking-not-found",
    title: "Booking not found",
    note: "Booking hanya ada di perangkat yang membuatnya (mock). Nomor yang tidak dikenal diarahkan ke Check Rate.",
    via: "Buka tautan booking di perangkat lain",
    from: null,
    path: booking("RKNOPE0000"),
    seed: () => seed(draft()),
  },
  {
    id: "booking-no-packages",
    title: "Booking tanpa packages",
    note: "Booking yang dibuat sebelum Packages ada: bagian itu absen, sisanya utuh.",
    from: null,
    path: booking(breakBookingNumber("empty")),
    seed: () => seed(booked("empty")),
  },
  {
    id: "booking-many",
    title: "40 packages",
    note: "Lima pertama tampil; sisanya di balik “Show all 40 packages”.",
    from: null,
    path: booking(breakBookingNumber("many")),
    seed: () => seed(booked("many")),
    steps: [click(button(M.booking.packagesAll.replace("{n}", "40"))), wait(500)],
  },
  {
    id: "booking-worst",
    title: "Worst case",
    note: "Yang diketik customer tampil seperti diketik; email dan kata panjang boleh patah di mana saja.",
    from: null,
    path: booking(breakBookingNumber("worst")),
    seed: () => seed(booked("worst")),
  },
];

const CONFIRM_FAILED: Gap = {
  gap: true,
  id: "plan-confirm-failed",
  title: "Confirm gagal",
  note: "Diminta RPW-294 (state error). Toast-nya sudah ada (“We couldn’t confirm your application…”), tapi belum bisa terjadi: tanpa server, submit hanya gagal pada draft yang belum lengkap.",
  via: "Server menolak",
  from: "plan-confirming",
};

/* --------------------------------------------------------- Internal ticket */

const TICKETS = () =>
  tickets([
    { number: "RKREVIEW01", eligibility: ELIG_INDONESIA },
    { number: "RKPERSONAL", eligibility: ELIG_OTHERS },
  ]);
const EXPAT_TAB: Step = click({ role: "tab", name: OPS.tab });

const ops: Scene[] = [
  {
    id: "ops-tickets",
    title: "Ticket per Customs Category",
    note: "Tiga booking, tiga flag: eligible_pindahan, needs_review, personal_shipment. Flag ini hanya ada di sini, tidak pernah di sisi customer.",
    via: "Booking terdaftar",
    from: null,
    path: SIMULATOR,
    seed: () => seed(TICKETS()),
    steps: [EXPAT_TAB, wait(400)],
  },
  {
    id: "ops-email",
    title: "Preview email konfirmasi",
    note: "Email yang sama dikirim ke customer dan ke hello@rimkirim.com. Di prototype hanya bisa dilihat di sini.",
    via: `Tekan “${OPS.preview}”`,
    path: SIMULATOR,
    seed: () => seed(TICKETS()),
    steps: [EXPAT_TAB, wait(400), click(button(OPS.preview, { nth: 0 })), wait(700)],
    view: "screen",
  },
  {
    id: "ops-empty",
    title: "Belum ada booking",
    note: "Sebelum ada yang dikonfirmasi di perangkat ini.",
    from: null,
    path: SIMULATOR,
    seed: () => seed(draft()),
    steps: [EXPAT_TAB, wait(400)],
  },
];

/* ------------------------------------------------------------------ Landing */

/** a section of the landing, at the top of the screen once its reveal has played */
const section = (css: string, nth = 0): Step[] => [{ do: "to", on: { css, nth } }, wait(1600)];
const labelled = (heading: string) => `section[aria-labelledby='${heading}']`;
const landingScene = (id: string, title: string, note: string, steps: Step[], more: Partial<Scene> = {}): Scene => ({
  id,
  title,
  note,
  path: LANDING,
  seed: () => seed(draft()),
  steps,
  view: "screen",
  ...more,
});

const landing: Scene[] = [
  landingScene("land-hero", "Hero", "Layar pertama: apa yang dikirim, ke mana, dan “Check your rate”.", [wait(1600)], { from: null }),
  landingScene("land-reviews", "Reviews", "Bukti dari customer yang sudah mengirim.", section("#reviews"), { from: null }),
  landingScene("land-ship", "What you can ship", "Apa yang bisa dikirim.", section(labelled("ship-heading")), { from: null }),
  landingScene("land-packing", "Packing guide", "Customer selalu packing sendiri, furniture termasuk.", section("#packing"), {
    via: "Scroll ke bawah",
  }),
  landingScene("land-not-allowed", "Not allowed", "Daftar yang tidak bisa dikirim; Q1 di Eligibility Check menautkan ke sini.", section("#not-allowed"), {
    via: "Scroll ke bawah",
  }),
  landingScene("land-coordinate", "Who does what", "Bagian Rimkirim dan bagian customer.", section(labelled("coordinate-heading")), { from: null }),
  landingScene("land-why", "Why Rimkirim", "Apa bedanya Rimkirim untuk pindahan ke Indonesia.", section(labelled("compare-heading")), { from: null }),
  landingScene("land-pricing", "Pricing information", "Apa yang membentuk harga: rute, berat, ukuran, dan chargeable weight (L × W × H ÷ 5000).", section(labelled("pricing-heading")), {
    from: null,
  }),
  landingScene("land-steps", "How it works", "Langkah dari Check Rate sampai barang diantar.", section("#how-it-works"), { from: null }),
  landingScene("land-customs", "Customs", "Tiga Customs Path. Ditambahkan setelah brief, dari review ops.", section(labelled("customs-heading")), {
    via: "Scroll ke bawah",
  }),
  landingScene("land-faq", "FAQ", "Pertanyaan umum, di halaman yang sama.", section("#faq"), { from: null }),
  landingScene(
    "land-faq-open",
    "FAQ: satu jawaban terbuka",
    "Jawaban terbuka di tempatnya.",
    [...section("#faq"), click({ css: "#faq summary", nth: 0 }), wait(600)],
    { via: "Tekan sebuah pertanyaan" },
  ),
  landingScene("land-closing", "Closing CTA", "Ajakan terakhir ke Check Rate, tanpa harus scroll ke atas.", section(labelled("closing-heading")), { from: null }),
];

export const EXPAT_SCENES: Scene[] = [...rates, ...plan, ...bookingScenes, ...ops, ...landing];

/* ------------------------------------------------------------------- Boards */

export const EXPAT_BOARDS: Board[] = [
  {
    id: "overview",
    title: "Overview",
    route: "Expat Relocation order flow",
    lead: "Jalur mulus dari Check Rate sampai Booking Summary, satu frame per langkah. Detail tiap halaman ada di board-nya.",
    lanes: [
      {
        id: "happy",
        ticket: "RPW-280",
        title: "Happy path, ujung ke ujung",
        story: "Check Rate, Select Rate, lalu plan (Eligibility Check, Personal Information, Packages), Confirm application, Booking Summary.",
        rows: [
          {
            kind: "positive",
            cells: [
              "rates-empty",
              "rates-estimate",
              "plan-start",
              "plan-part-done",
              "pack-start",
              "plan-all-done",
              "plan-confirming",
              "booking-fresh",
              "booking-summary",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rates",
    title: "Check Rate",
    route: RATES,
    lead: "Tempat pesanan dimulai: dari mana, ke mana, kira-kira berapa berat. Lalu satu tarif, dengan yang lain kalau diminta.",
    lanes: [
      {
        id: "rpw-290",
        ticket: "RPW-290",
        title: "Rate Check",
        story:
          "As a visitor, I want to enter where I am moving from and to, plus a rough weight, so that I get a price without filling in a long form first.",
        rows: [
          { kind: "positive", cells: ["rates-empty", "rates-address", "rates-filled", "rates-checking"] },
          { kind: "negative", cells: ["rates-required", "rates-no-results", "rates-no-postal", NO_SERVICE] },
        ],
      },
      {
        id: "rpw-291",
        ticket: "RPW-291",
        title: "Rate Population",
        story:
          "As a customer, I want one recommended price rather than a wall of options, so that I can decide quickly without comparing everything.",
        differs: [
          "Brief: “final price confirmed at quotation”. Prototype: quotation masih estimate; harga final ada di invoice (koreksi tim).",
        ],
        rows: [
          { kind: "positive", cells: ["rates-estimate", "rates-more", "rates-normal", "rates-rounded"] },
          { kind: "negative", cells: ["rates-below-tier", "rates-stale"] },
        ],
      },
    ],
  },
  {
    id: "plan",
    title: "Plan",
    route: PLAN,
    lead: "Eligibility Check, Personal Information dan Packages: tiga bagian di satu halaman, satu terbuka, dengan satu tombol.",
    lanes: [
      {
        id: "rpw-297",
        ticket: "RPW-297",
        title: "Shell and stepper",
        story:
          "As a customer partway through booking, I want to see which step I am on and move back without losing anything, so that a long form does not feel risky.",
        differs: [
          "Brief: step indicator lima langkah dengan back/next. Prototype: tanpa stepper; plan satu halaman, bagian yang selesai melipat dan dibuka lagi lewat “Edit”.",
          "Brief: urutan Shipment Information lalu Personal Information. Prototype: Your details dulu, Packages terakhir.",
          "Tanpa footer di seluruh flow (keputusan tim).",
        ],
        rows: [
          { kind: "positive", cells: ["plan-start", "plan-part-done", "plan-all-done", "plan-welcome"] },
          { kind: "negative", cells: ["plan-no-rate", "plan-missing"] },
        ],
      },
      {
        id: "rpw-296",
        ticket: "RPW-296",
        title: "Customs Education Modal",
        story:
          "As a customer, I want to understand the clearance paths and what each needs, so that I know whether to expect duty, and which documents to gather.",
        differs: [
          "Brief: dua path (Moving Goods, Personal Shipment). Prototype: tiga Customs Path, dengan Passenger Goods (diputuskan bersama PM).",
          "Brief menutup dengan “Which path applies is confirmed by the Rimkirim team.” Prototype: tim merekomendasikan satu path saat review, customer yang memutuskan (ADR 0002).",
        ],
        rows: [{ kind: "positive", cells: ["customs-first", "customs-hint", "customs-reopen"] }],
      },
      {
        id: "rpw-292",
        ticket: "RPW-292",
        title: "Eligibility Check",
        story:
          "As a business, I want the eligibility answers to decide which customs path a booking takes, so that ops can process it correctly without the customer needing to understand Indonesian customs.",
        differs: [
          "Brief: Q1 enam opsi. Prototype: lima; “Fine Art & High-Value Items” dicabut 2026-11-20.",
          "Brief: Q2 “In Indonesia” menanyakan lama tinggal. Prototype: tanggal di kedua cabang (aturan PM v1).",
          "Di bawah Q1 ada blok “Cannot be shipped”: informasi, bukan pertanyaan, dan tidak menghentikan pesanan.",
        ],
        rows: [
          { kind: "positive", cells: ["elig-abroad", "elig-indonesia", "elig-others"] },
          { kind: "negative", cells: ["elig-missing", "elig-followups"] },
        ],
      },
      {
        id: "rpw-292-295",
        ticket: "RPW-292 + RPW-295",
        title: "Furniture warning",
        story:
          "As a customer who owns furniture or large items, I want a clear warning as soon as I declare them, so that I am not refused at collection because I assumed Rimkirim would pack them.",
        differs: [
          "Brief: callout dengan copy persis (“Please note: Rimkirim does not provide a packing service for furniture or large items…”) yang muncul saat furniture dipilih dan hilang saat dilepas. Prototype: catatan “You pack everything yourself” selalu tampil; furniture hanya menambah “, furniture included”.",
          "Brief: warning yang sama muncul lagi di Shipment Information. Prototype: belum ada.",
        ],
        rows: [{ kind: "positive", cells: ["furn-off", "furn-on", FURNITURE_PACKAGES] }],
      },
      {
        id: "rpw-293",
        ticket: "RPW-293",
        title: "Personal Information",
        story:
          "As a customer, I want to enter my details and when I am moving, so that Rimkirim can arrange pickup and reach me about the shipment.",
        differs: [
          "Brief: detail address wajib di kedua sisi, dengan map pin. Prototype: opsional, tanpa pin (keputusan tim).",
          "Brief: tanggal dalam 2 hari dari hari ini tertutup. Prototype: pickup mulai besok; akhir pekan tetap tertutup.",
          "Brief: “Confirm Application” aktif hanya saat semua valid. Prototype: tombolnya tidak pernah mati, dan menunjukkan apa yang kurang.",
        ],
        rows: [
          { kind: "positive", cells: ["plan-part-done", "details-address", "details-date", "details-filled"] },
          {
            kind: "negative",
            cells: ["details-left", "details-required", "details-address-pick", "details-pickup-past", "details-changed"],
          },
        ],
      },
      {
        id: "rpw-295",
        ticket: "RPW-295",
        title: "Shipment Information (Packages)",
        story:
          "As a customer, I want to list every package with its size, weight and contents, so that my quote and customs paperwork match what I am actually sending.",
        differs: [
          "Brief: tiap package diisi panjang, lebar, tinggi dan berat. Prototype: pilih ukuran terdekat (Small, Medium, Large Box) atau Custom; hanya Custom yang diukur (revisi tim 2026-11-20).",
          "Brief: tiap item punya deskripsi dan nilai. Prototype: satu baris per kategori, dengan jumlah dan nilai totalnya.",
          "Brief: empty state dengan “Add package”. Prototype: langsung mulai dengan Package 1.",
        ],
        rows: [
          { kind: "positive", cells: ["pack-start", "pack-category", "pack-filled"] },
          { kind: "negative", cells: ["pack-missing", "pack-category-empty", "pack-odd", "pack-remove", "pack-below-tier"] },
          { kind: "edge", cells: ["plan-worst", "plan-many"] },
        ],
      },
      {
        id: "service",
        ticket: "Tambahan tim",
        title: "Change service",
        story: "Di luar brief: service bisa diganti dari plan tanpa kembali ke Check Rate, dan semua jawaban tetap.",
        rows: [{ kind: "positive", cells: ["service-change", "service-changed"] }],
      },
    ],
  },
  {
    id: "booking",
    title: "Booking Summary",
    route: "/expat-relocation/booking/[number]",
    lead: "Yang dilihat customer setelah Confirm application: bukti pesanannya masuk, dan apa yang terjadi berikutnya.",
    lanes: [
      {
        id: "rpw-294",
        ticket: "RPW-294",
        title: "Booking submit and summary",
        story:
          "As a customer who just submitted, I want immediate confirmation and a record of what I booked, so that I know it worked and what happens next.",
        differs: [
          "Di luar brief: dialog “We’ll contact you within 1 working day” saat baru tiba (permintaan tim, 2026-11-23).",
          "What happens next berhenti di pickup; invoice datang setelah barang sampai di gudang Rimkirim (koreksi tim).",
        ],
        rows: [
          { kind: "positive", cells: ["plan-confirming", "booking-fresh", "booking-summary", "booking-docs"] },
          { kind: "negative", cells: [CONFIRM_FAILED, "booking-not-found"] },
          { kind: "edge", cells: ["booking-no-packages", "booking-many", "booking-worst"] },
        ],
      },
    ],
  },
  {
    id: "ops",
    title: "Internal ticket",
    route: "/simulator · tab “Pesanan expat”",
    lead: "Yang sampai ke tim setelah Confirm application: ticket dengan jawaban, packages, kontak dan Customs Category, plus email konfirmasinya.",
    lanes: [
      {
        id: "rpw-294-ops",
        ticket: "RPW-294",
        title: "Handover ke ops",
        story:
          "Everything reaches the internal ticket: eligibility answers, packages and contact details are carried to ops, including the internal customs flag the customer never sees.",
        differs: [
          "Customs Category di sini memakai aturan dummy tim (lima aturan, docs/expat-order-flow.md), menunggu konfirmasi ops.",
          "Ticket dan email masih tiruan: ticket disimpan di perangkat, email hanya dipratinjau.",
        ],
        rows: [
          { kind: "positive", cells: ["ops-tickets", "ops-email"] },
          { kind: "negative", cells: ["ops-empty"] },
        ],
      },
    ],
  },
  {
    id: "landing",
    title: "Landing",
    route: LANDING,
    lead: "Landing Expat Relocation, satu lane per story. Tiap frame adalah satu layar dari section-nya; klik dua kali untuk scroll di dalamnya.",
    lanes: [
      {
        id: "rpw-281",
        ticket: "RPW-281",
        title: "Hero",
        story:
          "As a relocating expat landing on the page, I want to grasp in seconds that Rimkirim ships my belongings to Indonesia, and where to start, so that I can get a quote without hunting around the page.",
        differs: ["Brief: CTA “Get a quote”. Prototype: “Check your rate”, karena angkanya Estimate, bukan quote (CONTEXT.md)."],
        rows: [{ kind: "positive", cells: ["land-hero"] }],
      },
      {
        id: "rpw-282",
        ticket: "RPW-282",
        title: "Testimonials",
        story:
          "As a cautious first-time shipper, I want to see real customers who already moved their belongings, so that I trust Rimkirim with things I cannot replace.",
        rows: [{ kind: "positive", cells: ["land-reviews"] }],
      },
      {
        id: "rpw-283",
        ticket: "RPW-283",
        title: "What you can ship",
        story:
          "As a visitor deciding whether Rimkirim fits, I want to see clearly what is allowed and what is not, so that I do not start a booking that will be refused later.",
        differs: [
          "Brief: daftar cannot-ship masih provisional. Prototype: daftar “Not allowed” yang sekarang (alkohol, rokok dan vape, senjata, bahan mudah terbakar, uang tunai, perhiasan, tanaman, kendaraan bermotor).",
        ],
        rows: [{ kind: "positive", cells: ["land-ship", "land-packing", "land-not-allowed"] }],
      },
      {
        id: "rpw-284",
        ticket: "RPW-284",
        title: "Who does what",
        story:
          "As a customer, I want to see exactly which parts Rimkirim handles and which are mine, so that nothing surprises me on pickup day.",
        rows: [{ kind: "positive", cells: ["land-coordinate"] }],
      },
      {
        id: "rpw-285",
        ticket: "RPW-285",
        title: "Why Rimkirim",
        story:
          "As a customer comparing shipping options, I want to see what makes Rimkirim different for Indonesia specifically, so that I can choose without reading three competitor sites.",
        rows: [{ kind: "positive", cells: ["land-why"] }],
      },
      {
        id: "rpw-286",
        ticket: "RPW-286",
        title: "Pricing information",
        story:
          "As a customer, I want to understand what actually shapes my price, so that the number does not feel arbitrary when I see it.",
        differs: ["Brief: “final price confirmed at quotation”. Prototype: quotation masih estimate; harga final ada di invoice (koreksi tim)."],
        rows: [{ kind: "positive", cells: ["land-pricing"] }],
      },
      {
        id: "rpw-287",
        ticket: "RPW-287",
        title: "How it works",
        story:
          "As a customer, I want a simple step-by-step of what happens from quote to delivery, so that I know what I am committing to before I start.",
        differs: ["Brief: dua jalur duty (moving goods, personal shipment). Prototype: tiga Customs Path, di section sendiri setelah langkah-langkahnya."],
        rows: [{ kind: "positive", cells: ["land-steps", "land-customs"] }],
      },
      {
        id: "rpw-288",
        ticket: "RPW-288",
        title: "FAQs",
        story:
          "As a customer with specific questions, I want answers to the common questions in one place, so that I do not have to open WhatsApp to learn the basics.",
        rows: [{ kind: "positive", cells: ["land-faq", "land-faq-open"] }],
      },
      {
        id: "rpw-289",
        ticket: "RPW-289",
        title: "Closing CTA",
        story: "As a visitor who has read to the bottom, I want an obvious way to begin, so that I do not have to scroll back to the top to act.",
        rows: [{ kind: "positive", cells: ["land-closing"] }],
      },
    ],
  },
];
