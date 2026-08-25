"use client";

import * as React from "react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { CiplInput } from "@/lib/pdf/cipl";

/** Download a CIPL PDF with a busy flag; the PDF module loads on first use. */
export function useDownloadCipl() {
  const t = useT();
  const [busy, setBusy] = React.useState(false);
  const download = React.useCallback(
    async (input: CiplInput) => {
      setBusy(true);
      try {
        const { downloadCiplPdf } = await import("@/lib/pdf/cipl");
        await downloadCiplPdf(input);
      } catch (err) {
        console.error(err);
        toast.error(t("pl.pdfFailed"));
      } finally {
        setBusy(false);
      }
    },
    [t],
  );
  return { busy, download };
}

/**
 * Preview a CIPL PDF in a new tab. The tab is opened synchronously inside the
 * click gesture (popup blockers reject a window opened after an async build)
 * and then navigated to the blob URL; iframes are not used because mobile
 * browsers render PDFs poorly or not at all inside them.
 */
export function usePreviewCipl() {
  const t = useT();
  const [busy, setBusy] = React.useState(false);
  const preview = React.useCallback(
    async (input: CiplInput) => {
      const tab = window.open("", "_blank");
      setBusy(true);
      try {
        const { previewCiplPdfUrl } = await import("@/lib/pdf/cipl");
        const url = await previewCiplPdfUrl(input);
        if (tab) tab.location.href = url;
        else window.open(url, "_blank"); // popup allowed after all? last try
      } catch (err) {
        console.error(err);
        tab?.close();
        toast.error(t("pl.pdfFailed"));
      } finally {
        setBusy(false);
      }
    },
    [t],
  );
  return { busy, preview };
}
