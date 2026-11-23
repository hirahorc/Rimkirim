import { CURRENCIES } from "@/lib/data/currencies";
import type { Place } from "@/lib/data/expat-places";
import { expatRates } from "@/lib/pricing/expat-rates";
import {
  EMPTY_DETAILS,
  EMPTY_ELIGIBILITY,
  EMPTY_PACKING,
  TEAM_INBOX,
  customsCategory,
  packedPricing,
  pickupDayAllowed,
  toItemsData,
  type CheckRateInput,
  type DetailsInput,
  type EligibilityAnswers,
  type ExpatBooking,
  type PackingInput,
  type PackingPackage,
} from "@/lib/order/expat-order";

/**
 * Datasets for breaking the expat order flow (the break-ui skill): the kind
 * data every screen was designed against, and the realistic worst a customer
 * can give it. Each one is a whole order, entered where real data enters, the
 * draft and its booking (BreakData loads it into useExpatOrderStore), so the
 * screens render it untouched. Never in production: nothing imports this but
 * the dev toggle and the canvas's scenes (lib/canvas/expat/seeds.ts), which
 * are built on the same demo order.
 *
 * Every worst value is one a customer could really type, or the longest the
 * form accepts: its `maxLength` where it has one (name 120, detail address
 * 200, an "Others" answer 120, what a package is packed in 60, an item 120,
 * a quantity 5 digits), something long but believable where it has none
 * (email, phone, every weight, size and value, how many packages and items).
 */

export const BREAK_SETS = ["demo", "worst", "empty", "one", "many"] as const;
export type BreakSet = (typeof BREAK_SETS)[number];

type Check = CheckRateInput & { origin: Place; destination: Place; weightKg: number };

interface Order {
  /** the booking's number, so its Booking Summary has an address */
  number: string;
  check: Check;
  eligibility: EligibilityAnswers;
  details: DetailsInput;
  packing: PackingInput;
  /** the order its booking was made from, when that isn't the draft: an
   *  untouched draft can't have been booked */
  booked?: Pick<Order, "eligibility" | "details">;
  /** a booking made before the packages were asked: it carries none */
  noPackages?: boolean;
}

const place = (id: string, label: string, detail: string, postalCode: string, lat: number, lng: number): Place => ({
  id,
  label,
  detail,
  postalCode,
  lat,
  lng,
});

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** the first bookable day that passes `want`, looking up to two years out */
function pickup(want: (d: Date) => boolean): string {
  const d = new Date();
  for (let i = 0; i < 730; i++) {
    d.setDate(d.getDate() + 1);
    if (pickupDayAllowed(iso(d)) && want(d)) return iso(d);
  }
  return iso(d);
}

const days = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** a row of a package: its category, how many, their value together; `name`
 *  is what's typed for "others" */
const row = (id: string, category: string, quantity: string, value: string, name = "") => ({
  id,
  category,
  name,
  quantity,
  value,
});

/** a package measured as Other unless `box` says a standard size */
const box = (id: string, over: Partial<PackingPackage> = {}): PackingPackage => ({
  id,
  box: "other",
  packaging: "box",
  packagingOther: "",
  weight: "14",
  length: "60",
  width: "40",
  height: "40",
  items: [row(`${id}-a`, "clothing", "3", "360")],
  ...over,
});

/* ------------------------------------------------------------------ demo */

const demo: Order = {
  number: "RKDEMO0001",
  check: {
    originCountry: "AU",
    origin: place("demo-o", "Bennelong Point", "Sydney NSW 2000, Australia", "2000", -33.857, 151.215),
    destCountry: "ID",
    destination: place("demo-d", "Jl. Sudirman", "Jakarta 10220, Indonesia", "10220", -6.2, 106.82),
    weightKg: 30,
  },
  eligibility: {
    items: ["personal", "electronics"],
    itemsOther: "",
    location: "abroad",
    arrivalDate: days(40),
    hasVisa: true,
    hasVitas: true,
    hasItas: false,
    reason: "working",
    reasonOther: "",
  },
  details: {
    destinationDetail: "Apt 12B, Sudirman Tower",
    originDetail: "Unit 4, 12 Macquarie Street",
    fullName: "Alex Morgan",
    email: "alex@example.com",
    dialIso: "AU",
    dialTouched: false,
    phone: "412 345 678",
    pickupDate: pickup(() => true),
  },
  packing: {
    currency: "",
    packages: [
      box("d0", {
        box: "B",
        items: [row("d0-a", "clothing", "3", "360"), row("d0-b", "books", "12", "")],
      }),
      box("d1", {
        packaging: "suitcase",
        weight: "23",
        length: "75",
        width: "50",
        height: "30",
        items: [row("d1-a", "clothing", "20", "300")],
      }),
    ],
  },
};

/* ----------------------------------------------------------------- worst */

/** values given in rupiah, by someone already in Indonesia: the longest
 *  amounts a customer really types (the list's longest-named currency if
 *  rupiah ever leaves it) */
const WORST_CURRENCY = CURRENCIES.some((c) => c.code === "IDR")
  ? "IDR"
  : CURRENCIES.reduce((a, b) => (b.name.length > a.name.length ? b : a)).code;

const worst: Order = {
  number: "RKWORST001",
  check: {
    // the longest country name the list offers
    originCountry: "VC",
    origin: place(
      "worst-o",
      "Murray's Road at the corner of Level Garden Housing Scheme",
      "Kingstown VC0100, Saint Vincent and the Grenadines",
      "VC0100",
      13.1587,
      -61.2248,
    ),
    destCountry: "ID",
    destination: place(
      "worst-d",
      "Jalan Haji Rangkayo Rasuna Said Kavling C-22 Blok X-5 Nomor 12",
      "Kelurahan Karet Kuningan, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12940, Indonesia",
      "12940",
      -6.2215,
      106.8323,
    ),
    // a whole household by air; the field has no upper limit
    weightKg: 1284.5,
  },
  eligibility: {
    // every category, and both "Others" at their 120 characters
    items: ["furniture", "personal", "electronics", "office", "others"],
    itemsOther:
      "A 1920s Bechstein upright piano, two Persian rugs, my grandmother's porcelain dinner service and forty framed maps",
    location: "indonesia",
    // here a long while: the arrival years back
    arrivalDate: "2019-02-28",
    hasVisa: true,
    hasVitas: false,
    hasItas: true,
    reason: "others",
    reasonOther:
      "Joining my spouse, who was seconded to Jakarta by Northwind Industries Holdings, while I finish a remote doctorate",
  },
  details: {
    // 200 characters, the field's limit
    destinationDetail:
      "Menara Kuningan Residence, Tower Bougainvillea, Lantai 27 Unit 27-H, masuk dari lobi selatan di belakang Indomaret, titip ke resepsionis atas nama Ibu Wiśniewska kalau saya tidak ada, bel dua kali",
    // the origin's, at length too
    originDetail:
      "Flat 3B above the Level Garden bakery, blue door on the side lane, ring twice; if nobody answers ask for Mr Cumberbatch-Ollivierre at the shop next door",
    fullName: "Aleksandra Wiśniewska-Kowalczyk de la Fuente y Fernández-Montgomery III",
    // unbreakable (no hyphen to wrap at), and the field has no limit
    email: "aleksandra.wisniewskakowalczyk+relocation@northwindindustriesholdings.example.com",
    dialIso: "VC",
    dialTouched: true,
    phone: "784 4567 8901 2345 678",
    // the longest a date reads: a Wednesday in September
    pickupDate: pickup((d) => d.getDay() === 3 && d.getMonth() === 8),
  },
  packing: {
    currency: WORST_CURRENCY,
    packages: [
      // "Others" at its 60 characters, heavy and odd-sized
      box("w0", {
        packaging: "other",
        packagingOther: "Custom plywood flight case with foam inserts, for a cello",
        weight: "999.99",
        length: "250",
        width: "120.5",
        height: "95.25",
        items: [
          row(
            "w0-a",
            "others",
            "1",
            // what such a cello is worth, in rupiah
            "3700000000",
            "Full-size cello by Jean-Baptiste Vuillaume with two bows, a carbon-fibre case, rosin and spare strings (insured)",
          ),
          // a quantity at its five digits
          row("w0-b", "tools", "99999", "25047499.5"),
        ],
      }),
      // the smallest box, with the shortest thing Others can be
      box("w1", {
        box: "A",
        items: [row("w1-a", "others", "1", "", "J")],
      }),
      // a long list, in the scripts and characters customers really type
      box("w2", {
        packaging: "suitcase",
        weight: "32",
        length: "81",
        width: "55",
        height: "36",
        // every category once, and Others in the scripts and characters
        // customers really type
        items: [
          row("w2-a", "others", "1", "75000.5", "🦊 Fox plushie"),
          row("w2-b", "books", "40", "7200000"),
          row("w2-c", "others", "7", "", "كتب نور الهدى عبد الرحمن"),
          row("w2-d", "clothing", "2", "13500000"),
          row("w2-e", "others", "1", "1", "<script>alert(1)</script> & **bold**"),
          row("w2-f", "art", "120", "45000000"),
          row("w2-g", "others", "1", "149999.99", "Benachrichtigungseinstellungshandbuch"),
          row("w2-h", "bags", "9", "10800000"),
          row("w2-i", "kitchen", "1", "9000000"),
          row("w2-j", "sports", "1", ""),
          row("w2-k", "toys", "14", "6300000"),
          row("w2-l", "decor", "25", "0"),
          row("w2-m", "textiles", "6", "1800000"),
          row("w2-n", "furniture", "1", "2500000"),
          row("w2-o", "appliances", "2", "1700000"),
          row("w2-p", "electronics", "3", "21000000"),
          row("w2-q", "instruments", "1", "4500000"),
          row("w2-r", "stationery", "30", "300000"),
        ],
      }),
      // a crated dining table measured in millimetres, not centimetres: the
      // sizes have no limit, and a slip of a unit is a thousand times the volume
      box("w3", {
        packaging: "crate",
        weight: "128.4",
        length: "2400",
        width: "1200",
        height: "900",
        items: [row("w3-a", "furniture", "1", "125000000")],
      }),
    ],
  },
};

/* ----------------------------------------------------------------- empty */

/** nothing given beyond the rate: the plan untouched, and a booking from
 *  before the packages were asked, with every optional thing absent */
const empty: Order = {
  number: "RKEMPTY001",
  check: demo.check,
  eligibility: EMPTY_ELIGIBILITY,
  details: { ...EMPTY_DETAILS, dialIso: "AU" },
  packing: EMPTY_PACKING,
  booked: { eligibility: demo.eligibility, details: demo.details },
  noPackages: true,
};

/* ------------------------------------------------------------------- one */

/** everything at exactly one, and every text at its shortest */
const one: Order = {
  number: "RKONE00001",
  check: { ...demo.check, weightKg: 1 },
  eligibility: {
    items: ["others"],
    itemsOther: "A",
    location: "indonesia",
    arrivalDate: "2026-11-01",
    hasVisa: false,
    reason: "others",
    reasonOther: "X",
  },
  details: {
    destinationDetail: "1",
    originDetail: "1",
    fullName: "Jo",
    email: "a@b.co",
    dialIso: "AU",
    dialTouched: false,
    phone: "1",
    pickupDate: pickup(() => true),
  },
  packing: {
    currency: "",
    packages: [
      box("o0", { box: "A", items: [row("o0-a", "books", "1", "1")] }),
    ],
  },
};

/* ------------------------------------------------------------------ many */

/** a whole house, package by package: nothing caps how many there are */
const many: Order = {
  number: "RKMANY0001",
  check: { ...demo.check, weightKg: 620 },
  eligibility: demo.eligibility,
  details: demo.details,
  packing: {
    currency: "",
    packages: Array.from({ length: 40 }, (_, i) =>
      box(`m${i}`, {
        // the three sizes and Other in turn, Other in a suitcase
        box: (["A", "B", "C", "other"] as const)[i % 4],
        packaging: "suitcase",
        weight: String(12 + (i % 9)),
        items: Array.from({ length: 1 + (i % 5) }, (_, j) => {
          const quantity = 1 + ((i + j) % 12);
          return row(
            `m${i}-${j}`,
            ["books", "clothing", "kitchen", "toys", "textiles"][j],
            String(quantity),
            String(10 * (j + 1) * quantity),
          );
        }),
      }),
    ),
  },
};

const ORDERS: Record<BreakSet, Order> = { demo, worst, empty, one, many };

/** where a dataset's Booking Summary lives */
export const breakBookingNumber = (set: BreakSet) => ORDERS[set].number;

/**
 * A dataset as the store holds it: the draft, with the lead rate Check Rate
 * would offer for it picked, and the booking that draft would register.
 */
export function breakState(set: BreakSet) {
  const o = ORDERS[set];
  const rate = expatRates(o.check.originCountry, o.check.weightKg).rates[0] ?? null;
  const booked = o.booked ?? o;
  const booking: ExpatBooking | null = rate && {
    number: o.number,
    createdAt: new Date().toISOString(),
    check: o.check,
    rate: packedPricing(o.check.originCountry, rate, o.packing).rate,
    eligibility: booked.eligibility,
    ...(o.noPackages ? {} : { packing: toItemsData(o.packing, o.check.originCountry) }),
    details: booked.details,
    customsCategory: customsCategory(booked.eligibility),
    emailTo: [booked.details.email.trim(), TEAM_INBOX],
  };
  return {
    check: o.check,
    rate,
    eligibility: o.eligibility,
    packing: o.packing,
    details: o.details,
    addressChanged: { destination: false },
    bookings: booking ? [booking] : [],
  };
}
