/**
 * International dialing codes keyed by ISO 3166-1 alpha-2, covering every
 * country in `lib/data/countries.ts`. Used by the phone-number country-code
 * dropdown in the order forms. Kept as a separate map so the country list
 * stays focused on shipping zones.
 */

export const DIAL_BY_ISO: Record<string, string> = {
  ID: "+62", AU: "+61", NL: "+31", DE: "+49", FR: "+33", JP: "+81", SG: "+65",
  MY: "+60", TH: "+66", VN: "+84", PH: "+63", BN: "+673", KH: "+855", LA: "+856",
  MM: "+95", TL: "+670", CN: "+86", HK: "+852", MO: "+853", TW: "+886", KR: "+82",
  KP: "+850", MN: "+976", IN: "+91", PK: "+92", BD: "+880", LK: "+94", NP: "+977",
  BT: "+975", MV: "+960", AF: "+93", KZ: "+7", UZ: "+998", TM: "+993", KG: "+996",
  TJ: "+992", NZ: "+64", FJ: "+679", PG: "+675", SB: "+677", VU: "+678", NC: "+687",
  PF: "+689", WS: "+685", TO: "+676", KI: "+686", FM: "+691", MH: "+692", NR: "+674",
  PW: "+680", TV: "+688", CK: "+682", GU: "+1671", GB: "+44", IE: "+353", BE: "+32",
  LU: "+352", CH: "+41", AT: "+43", LI: "+423", IT: "+39", ES: "+34", PT: "+351",
  AD: "+376", MC: "+377", MT: "+356", SM: "+378", VA: "+39", SE: "+46", NO: "+47",
  DK: "+45", FI: "+358", IS: "+354", EE: "+372", LV: "+371", LT: "+370", PL: "+48",
  CZ: "+420", SK: "+421", HU: "+36", SI: "+386", HR: "+385", BA: "+387", RS: "+381",
  ME: "+382", MK: "+389", AL: "+355", XK: "+383", GR: "+30", BG: "+359", RO: "+40",
  MD: "+373", UA: "+380", BY: "+375", RU: "+7", CY: "+357", TR: "+90", GE: "+995",
  AM: "+374", AZ: "+994", AE: "+971", SA: "+966", QA: "+974", KW: "+965", BH: "+973",
  OM: "+968", YE: "+967", JO: "+962", LB: "+961", SY: "+963", IQ: "+964", IR: "+98",
  IL: "+972", PS: "+970", US: "+1", CA: "+1", MX: "+52", GT: "+502", BZ: "+501",
  SV: "+503", HN: "+504", NI: "+505", CR: "+506", PA: "+507", CU: "+53", JM: "+1876",
  HT: "+509", DO: "+1809", PR: "+1787", TT: "+1868", BS: "+1242", BB: "+1246",
  CO: "+57", VE: "+58", GY: "+592", SR: "+597", EC: "+593", PE: "+51", BR: "+55",
  BO: "+591", PY: "+595", CL: "+56", AR: "+54", UY: "+598", EG: "+20", MA: "+212",
  DZ: "+213", TN: "+216", LY: "+218", SD: "+249", SS: "+211", ET: "+251", ER: "+291",
  DJ: "+253", SO: "+252", KE: "+254", UG: "+256", TZ: "+255", RW: "+250", BI: "+257",
  NG: "+234", GH: "+233", CI: "+225", SN: "+221", ML: "+223", BF: "+226", NE: "+227",
  TD: "+235", GN: "+224", BJ: "+229", TG: "+228", SL: "+232", LR: "+231", GM: "+220",
  MR: "+222", CM: "+237", GA: "+241", CG: "+242", CD: "+243", AO: "+244", ZM: "+260",
  ZW: "+263", MW: "+265", MZ: "+258", BW: "+267", NA: "+264", ZA: "+27", LS: "+266",
  SZ: "+268", MG: "+261", MU: "+230", SC: "+248", CV: "+238", CF: "+236", GQ: "+240",
  GW: "+245", ST: "+239", KM: "+269", AG: "+1268", DM: "+1767", GD: "+1473",
  KN: "+1869", LC: "+1758", VC: "+1784", AW: "+297", CW: "+599", KY: "+1345",
  BM: "+1441", GL: "+299", FO: "+298", GI: "+350", JE: "+44", GG: "+44", IM: "+44",
  AS: "+1684", WF: "+681", NU: "+683", MP: "+1670", RE: "+262", TC: "+1649",
  VG: "+1284", AI: "+1264", MS: "+1664", SX: "+1721", FK: "+500",
};

/** Dialing code for an ISO country code (e.g. "ID" → "+62"); undefined if unknown. */
export function dialCodeFor(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return DIAL_BY_ISO[iso];
}
