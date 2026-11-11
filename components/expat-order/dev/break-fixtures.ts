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
 * screens render it untouched. Dev only: nothing in the app imports this but
 * the dev toggle.
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

const box = (id: string, over: Partial<PackingPackage> = {}): PackingPackage => ({
  id,
  packaging: "box",
  packagingOther: "",
  weight: "14",
  length: "60",
  width: "40",
  height: "40",
  items: [{ id: `${id}-a`, name: "Winter coats", quantity: "3", value: "120" }],
  photos: {},
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
    handover: "me",
    buildingType: "apartment",
    freightElevator: true,
    receptionist: true,
    pickupWindow: "10:00-14:00",
  },
  packing: {
    currency: "",
    packages: [
      box("d0", {
        items: [
          { id: "d0-a", name: "Winter coats", quantity: "3", value: "120" },
          { id: "d0-b", name: "Books", quantity: "12", value: "" },
        ],
      }),
      box("d1", {
        packaging: "suitcase",
        weight: "23",
        length: "75",
        width: "50",
        height: "30",
        items: [{ id: "d1-a", name: "Clothes", quantity: "20", value: "15" }],
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
    items: ["furniture", "personal", "fineArt", "electronics", "office", "others"],
    itemsOther:
      "A 1920s Bechstein upright piano, two Persian rugs, my grandmother's porcelain dinner service and forty framed maps",
    location: "indonesia",
    stayLength: "gt1y",
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
    // someone else hands over, with a name and number as long as the customer's
    handover: "other",
    picName: "Bartholomew Fitzgerald-Montgomery de la Fuente y Cumberbatch-Ollivierre",
    picDialIso: "VC",
    picPhone: "784 9876 5432 1098 765",
    buildingType: "coliving",
    freightElevator: false,
    receptionist: false,
    // 300 characters, the field's limit
    courierNotes:
      "The lane is too narrow for a van, so park on Murray's Road by the bakery and walk in. Ring the top bell twice. If Mr Fitzgerald-Montgomery is out, Mrs Cumberbatch at number 14 has the key and knows which boxes go. Please call ten minutes ahead; the dog barks but is friendly. Mind the loose step.",
    pickupWindow: "14:00-18:00",
  },
  packing: {
    currency: WORST_CURRENCY,
    packages: [
      // "Others" at its 60 characters, heavy and odd-sized, file names as cameras write them
      box("w0", {
        packaging: "other",
        packagingOther: "Custom plywood flight case with foam inserts, for a cello",
        weight: "999.99",
        length: "250",
        width: "120.5",
        height: "95.25",
        items: [
          {
            id: "w0-a",
            name: "Full-size cello by Jean-Baptiste Vuillaume with two bows, a carbon-fibre case, rosin and spare strings (insured)",
            quantity: "1",
            // what such a cello is worth, in rupiah
            value: "3700000000",
          },
          // a quantity at its five digits
          { id: "w0-b", name: "Spare screws and fittings", quantity: "99999", value: "250.5" },
        ],
        photos: {
          weight: "IMG_20250914_183022_HDR_portrait_edited_edited.HEIC",
          length: "Q3 Board Deck — FINAL (revised) v12 [approved by legal].pdf",
          width: "a.jpg",
        },
      }),
      // the smallest a package can be said to be
      box("w1", {
        weight: "0.1",
        length: "1",
        width: "1",
        height: "1",
        items: [{ id: "w1-a", name: "J", quantity: "1", value: "" }],
      }),
      // a long list, in the scripts and characters customers really type
      box("w2", {
        packaging: "suitcase",
        weight: "32",
        length: "81",
        width: "55",
        height: "36",
        items: [
          { id: "w2-a", name: "🦊 Fox plushie", quantity: "1", value: "75000.5" },
          { id: "w2-b", name: "王秀英的书", quantity: "40", value: "180000" },
          { id: "w2-c", name: "كتب نور الهدى عبد الرحمن", quantity: "7", value: "" },
          { id: "w2-d", name: "Đặng Thị Ngọc Hân's áo dài", quantity: "2", value: "6750000" },
          { id: "w2-e", name: "<script>alert(1)</script> & **bold**", quantity: "1", value: "1" },
          { id: "w2-f", name: "  Sam   Lee's   records ", quantity: "120", value: "375000" },
          { id: "w2-g", name: "Benachrichtigungseinstellungshandbuch", quantity: "1", value: "149999.99" },
          { id: "w2-h", name: "Shoes", quantity: "9", value: "1200000" },
          { id: "w2-i", name: "Kitchen knives (set)", quantity: "1", value: "9000000" },
          { id: "w2-j", name: "Yoga mat", quantity: "1", value: "" },
          { id: "w2-k", name: "Board games", quantity: "14", value: "450000" },
          { id: "w2-l", name: "Framed photographs", quantity: "25", value: "0" },
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
        items: [{ id: "w3-a", name: "Antique teak dining table", quantity: "1", value: "125000000" }],
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
    stayLength: "lt3m",
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
    handover: "me",
    buildingType: "house",
    pickupWindow: "10:00-14:00",
  },
  packing: {
    currency: "",
    packages: [
      box("o0", { weight: "1", length: "1", width: "1", height: "1", items: [{ id: "o0-a", name: "J", quantity: "1", value: "1" }] }),
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
        packaging: (["box", "suitcase", "plastic", "crate"] as const)[i % 4],
        weight: String(12 + (i % 9)),
        items: Array.from({ length: 1 + (i % 5) }, (_, j) => ({
          id: `m${i}-${j}`,
          name: ["Books", "Clothes", "Kitchenware", "Toys", "Bedding"][j],
          quantity: String(1 + ((i + j) % 12)),
          value: String(10 * (j + 1)),
        })),
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
