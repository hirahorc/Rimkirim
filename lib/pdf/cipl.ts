/**
 * Commercial Invoice / Packing List (CIPL) PDF.
 *
 * Labels are always English — customs requires the document to be completed
 * in English regardless of the app locale. jspdf + autotable are imported
 * lazily so the PDF toolchain never lands in the main bundle.
 *
 * Known limitation: jspdf's built-in Helvetica covers Latin scripts only, so
 * non-Latin characters in user text (e.g. CJK addresses) will not render.
 */
import type { jsPDF } from "jspdf";
import type { CellHookData } from "jspdf-autotable";
import { dialCodeFor } from "@/lib/data/dial-codes";
import type { ItemsData, PackingList, Party, ShipmentPurpose } from "@/lib/types/packing";
import type { OrderContext } from "@/lib/store/useOrderStore";

export interface CiplInput {
  code: string | null;
  sender: Partial<Party>;
  receiver: Partial<Party>;
  /** yyyy-mm-dd; blank prints as an empty field */
  shippingDate: string;
  /** already-resolved English label */
  purpose: string;
  items: Partial<ItemsData>;
}

/** English wording of each purpose, as it should print on the document. */
export const PURPOSE_PDF_LABEL: Record<ShipmentPurpose, string> = {
  household: "Household Goods - Barang Pindahan (Personal Effect)",
  gift: "Gift",
  commercial: "Commercial Goods",
  documents: "Documents",
  sample: "Commercial Sample",
  return: "Returned Goods / Repair",
  other: "Others",
};

const PACKAGING_PDF_LABEL: Record<string, string> = {
  box: "Box",
  suitcase: "Suitcase",
  plastic: "Plastic Bag",
  crate: "Wooden Crate",
  other: "Other",
};

export function packingListToCipl(pl: PackingList): CiplInput {
  const d = pl.data;
  const purpose =
    d.purpose === "other" && d.purposeOther?.trim()
      ? `Others - ${d.purposeOther.trim()}`
      : PURPOSE_PDF_LABEL[d.purpose] ?? "";
  return {
    code: pl.code,
    sender: d.sender,
    receiver: d.receiver,
    shippingDate: d.shippingDate,
    purpose,
    items: d.items,
  };
}

/** Build the input from an order's saved modules (Customer Info + Items). */
export function orderModulesToCipl(args: {
  code: string | null;
  customerInfo: Record<string, unknown> | undefined;
  items: Record<string, unknown> | undefined;
  pickup: Record<string, unknown> | undefined;
  context: OrderContext | null;
}): CiplInput {
  const ci = (args.customerInfo ?? {}) as { sender?: Party; receiver?: Party };
  const pickupDate = (args.pickup as { date?: string } | undefined)?.date ?? "";
  // DRAFT copy — both Rimkirim services move personal effects today; the owner
  // will confirm the wording (or add a purpose field to the order flow).
  const purpose = args.context ? PURPOSE_PDF_LABEL.household : "";
  return {
    code: args.code,
    sender: ci.sender ?? {},
    receiver: ci.receiver ?? {},
    shippingDate: pickupDate,
    purpose,
    items: (args.items ?? {}) as Partial<ItemsData>,
  };
}

/** File name for the download, e.g. RK-PL-483920_CIPL_2026-08-18.pdf */
export function ciplFilename(input: CiplInput): string {
  const date = input.shippingDate || new Date().toISOString().slice(0, 10);
  return `${input.code ?? "packing-list"}_CIPL_${date}.pdf`;
}

function countryName(code: string | undefined): string {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function phoneLine(p: Partial<Party>): string {
  if (!p.phone) return "";
  const dial = dialCodeFor(p.phoneCountry);
  return dial ? `${dial} ${p.phone}` : p.phone;
}

function partyLines(p: Partial<Party>): string[] {
  return [p.fullName, phoneLine(p), p.email, p.address, countryName(p.country)]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);
}

// English number style ("5,415" / "22.4") regardless of the app locale
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
function fmt(n: number): string {
  return NUM.format(n);
}

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch("/rimkirim-logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    // downscale the 1796px wordmark — at print size ~360px is plenty and it
    // keeps the PDF small
    const bmp = await createImageBitmap(blob);
    const w = 360;
    const h = Math.round((bmp.height / bmp.width) * w);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** Build the PDF and hand it to the browser as a download. */
export async function downloadCiplPdf(input: CiplInput): Promise<void> {
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadLogo(),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 14; // page margin
  const W = pageW - M * 2;
  const INK = 20;
  const MUTED = 110;
  const RULE = 200;

  // ---- header block (first page only) --------------------------------------
  let y = M;
  if (logo) {
    // wordmark is 1796×618 → keep the ratio at 26mm wide
    doc.addImage(logo, "PNG", M, y, 26, 26 * (618 / 1796));
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(INK);
  doc.text("Commercial Invoice / Packing List", pageW / 2, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED);
  doc.text("This invoice must be completed in English", pageW / 2, y + 11, {
    align: "center",
  });
  if (input.code) {
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(INK);
    doc.text(input.code, pageW - M, y + 6, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(`Issued ${new Date().toISOString().slice(0, 10)}`, pageW - M, y + 10.5, {
      align: "right",
    });
  }
  y += 18;

  // sender / receiver boxes with the shipment strip on the right
  const colL = W * 0.52;
  const colR = W - colL;
  const boxText = (label: string, lines: string[], x: number, top: number, w: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(label.toUpperCase(), x + 3, top + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(INK);
    const wrapped = lines.flatMap((l) => doc.splitTextToSize(l, w - 6) as string[]);
    doc.text(wrapped, x + 3, top + 9.5, { lineHeightFactor: 1.35 });
    return 9.5 + wrapped.length * 9 * 0.3528 * 1.35 + 3;
  };
  const measure = (lines: string[], w: number) =>
    9.5 + lines.flatMap((l) => doc.splitTextToSize(l, w - 6) as string[]).length * 9 * 0.3528 * 1.35 + 3;

  const senderLines = partyLines(input.sender);
  const receiverLines = partyLines(input.receiver);
  const hSender = Math.max(22, measure(senderLines, colL));
  const hReceiver = Math.max(22, measure(receiverLines, colL));
  const hLeft = hSender + hReceiver;

  doc.setDrawColor(RULE);
  doc.setLineWidth(0.3);
  doc.rect(M, y, colL, hSender);
  doc.rect(M, y + hSender, colL, hReceiver);
  doc.rect(M + colL, y, colR, hLeft);
  boxText("Sender", senderLines, M, y, colL);
  boxText("Receiver", receiverLines, M, y + hSender, colL);
  // right column: shipping date + purpose
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("SHIPPING DATE", M + colL + 3, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK);
  doc.text(input.shippingDate || "—", M + colL + 3, y + 9.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("PURPOSE OF SHIPMENT", M + colL + 3, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK);
  doc.text(doc.splitTextToSize(input.purpose || "—", colR - 6) as string[], M + colL + 3, y + 22, {
    lineHeightFactor: 1.35,
  });
  y += hLeft + 6;

  // ---- table --------------------------------------------------------------
  const currency = input.items.currency ?? "";
  const pkgs = input.items.packages ?? [];
  const rows = pkgs.map((p, i) => {
    const items = p.items ?? [];
    const totalItem = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    const totalValue = items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.value) || 0),
      0,
    );
    const desc = items
      .filter((it) => (it.name ?? "").trim())
      .map((it) => `${it.name.trim()} (${Number(it.quantity) || 0} pcs)`)
      .join(", ");
    return {
      cells: [
        String(i + 1),
        PACKAGING_PDF_LABEL[p.packaging] ?? p.packaging ?? "",
        fmt(Number(p.weight) || 0),
        `${Number(p.length) || 0} x ${Number(p.width) || 0} x ${Number(p.height) || 0} cm`,
        desc,
        String(totalItem),
        fmt(totalValue),
      ],
      weight: Number(p.weight) || 0,
      totalItem,
      totalValue,
    };
  });

  const grand = rows.reduce(
    (a, r) => ({
      packages: a.packages + 1,
      weight: a.weight + r.weight,
      items: a.items + r.totalItem,
      value: a.value + r.totalValue,
    }),
    { packages: 0, weight: 0, items: 0, value: 0 },
  );

  // per-page sums, keyed by autotable's page number
  const perPage = new Map<number, { packages: number; weight: number; items: number; value: number }>();
  const FOOTER_H = 34; // reserved for page totals + declaration

  const totalsBlock = (
    title: string,
    v: { packages: number; weight: number; items: number; value: number },
    top: number,
  ) => {
    const cols = ["Total Packages", "Total Weight (Kg)", "Total Item", title === "Consignment Total" ? "Invoice Total" : "Subtotal"];
    const vals = [String(v.packages), fmt(v.weight), String(v.items), fmt(v.value)];
    const cw = W / 4;
    doc.setDrawColor(RULE);
    doc.rect(M, top, W, 4.5);
    doc.setFillColor(245, 245, 245);
    doc.rect(M, top, W, 4.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(INK);
    doc.text(title, M + W / 2, top + 3.2, { align: "center" });
    for (let i = 0; i < 4; i++) {
      const x = M + cw * i;
      doc.rect(x, top + 4.5, cw, 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(MUTED);
      doc.text(cols[i], x + cw / 2, top + 7.5, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(INK);
      doc.text(vals[i], x + cw / 2, top + 11.3, { align: "center" });
    }
    return 12.5;
  };

  const totalPagesToken = "{total_pages}";

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: M, bottom: FOOTER_H + M },
    head: [[
      "No.",
      "Packing Type",
      "Weight (Kg)",
      "Dimension (Cm)",
      "Description of Goods",
      "Total Item",
      `Total Value${currency ? ` (${currency})` : ""}`,
    ]],
    body: rows.map((r) => r.cells),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 1.8,
      textColor: INK,
      lineColor: RULE,
      lineWidth: 0.25,
      valign: "middle",
    },
    headStyles: { fillColor: 245, textColor: INK, fontStyle: "bold", halign: "center" },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 17, halign: "right" },
      3: { cellWidth: 27, halign: "center" },
      4: { cellWidth: "auto" },
      5: { cellWidth: 15, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
    },
    rowPageBreak: "auto",
    didDrawCell: (data: CellHookData) => {
      // count each body row once per page it lands on (col 0 is drawn first)
      if (data.section !== "body" || data.column.index !== 0) return;
      const r = rows[data.row.index];
      const cur = perPage.get(data.pageNumber) ?? { packages: 0, weight: 0, items: 0, value: 0 };
      cur.packages += 1;
      cur.weight += r.weight;
      cur.items += r.totalItem;
      cur.value += r.totalValue;
      perPage.set(data.pageNumber, cur);
    },
    didDrawPage: (data) => {
      const pageTotals = perPage.get(data.pageNumber) ?? { packages: 0, weight: 0, items: 0, value: 0 };
      let top = pageH - M - FOOTER_H;
      top += totalsBlock("Total This Page", pageTotals, top) + 2;
      // declaration + currency box, every page
      doc.setDrawColor(RULE);
      doc.rect(M, top, W, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(INK);
      doc.text(
        "I declare that all the information contained in this invoice is true and correct.",
        M + 3,
        top + 4.2,
      );
      doc.setTextColor(MUTED);
      doc.setFontSize(7);
      const who = (input.sender.fullName ?? "").trim() || "—";
      doc.text(
        doc.splitTextToSize(
          `Originator or name of company representative if the invoice is being completed on behalf of a company or individual: ${who}`,
          W - 40,
        ) as string[],
        M + 3,
        top + 8.2,
        { lineHeightFactor: 1.3 },
      );
      doc.rect(pageW - M - 34, top, 34, 14);
      doc.setFontSize(7);
      doc.setTextColor(MUTED);
      doc.text("CURRENCY CODE", pageW - M - 17, top + 4.5, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(INK);
      doc.text(currency || "—", pageW - M - 17, top + 10.5, { align: "center" });
      // page counter
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(MUTED);
      doc.text(`Page ${data.pageNumber} of ${totalPagesToken}`, pageW - M, pageH - 6, {
        align: "right",
      });
      if (input.code) doc.text(input.code, M, pageH - 6);
    },
  });

  // ---- consignment total under the table on the last page -----------------
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  const need = 12.5 + 4;
  if (finalY + need > pageH - M - FOOTER_H) {
    // no room under the table: the grand total gets a page of its own
    doc.addPage();
    totalsBlock("Consignment Total", grand, M + 4);
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text(`Page ${doc.getNumberOfPages()} of ${totalPagesToken}`, pageW - M, pageH - 6, {
      align: "right",
    });
  } else {
    totalsBlock("Consignment Total", grand, finalY + 4);
  }

  if (typeof doc.putTotalPages === "function") doc.putTotalPages(totalPagesToken);
  doc.save(ciplFilename(input));
}
