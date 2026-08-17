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
