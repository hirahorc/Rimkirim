"use client";

import * as React from "react";
import { Upload, FileCheck2, X, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* Compressed, persistable form of an upload, for consumers that opt in via
   `onFileData`. Images are downscaled through a canvas so a phone photo lands
   around 100-300KB; PDFs are stored verbatim only under the cap. Anything
   else — or any failure — yields null, which simply means "no preview later":
   the filename record never depends on this succeeding. */
const IMG_MAX_SIDE = 1280;
const IMG_JPEG_QUALITY = 0.78;
const PDF_DATA_CAP = 1_500_000; // bytes; base64 in localStorage costs +33%

async function fileToStoredData(f: File): Promise<string | null> {
  if (f.type.startsWith("image/")) {
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = url;
      });
      const scale = Math.min(1, IMG_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", IMG_JPEG_QUALITY);
    } catch {
      return null;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  if (f.type === "application/pdf" && f.size <= PDF_DATA_CAP) {
    return new Promise<string | null>((res) => {
      const r = new FileReader();
      r.onload = () => res(typeof r.result === "string" ? r.result : null);
      r.onerror = () => res(null);
      r.readAsDataURL(f);
    });
  }
  return null;
}

/**
 * Mock file upload: captures the file NAME (persisted in the draft via `onChange`)
 * and keeps a session-only object URL so the picked file can be previewed at full
 * size. Consumers that pass `onFileData` additionally get a compressed data URL
 * to persist (see fileToStoredData), and hand it back as `fileData` so the
 * preview survives reloads; without it the preview is session-only.
 *
 * Interaction: clicking the file opens the full preview; the file can only be
 * replaced after it is removed (the X) — there is no click-to-replace.
 */
export function FileUpload({
  value,
  label,
  onChange,
  onFileData,
  fileData,
  accept = "image/*,application/pdf",
  className,
}: {
  value?: string;
  /** the document this upload belongs to, for the accessible name */
  label?: string;
  onChange: (name: string) => void;
  /** opt-in: receives the compressed data URL to persist (null = none stored) */
  onFileData?: (dataUrl: string | null) => void;
  /** the previously persisted data URL, used for previews across sessions */
  fileData?: string | null;
  accept?: string;
  className?: string;
}) {
  const t = useT();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [blob, setBlob] = React.useState<string | null>(null);
  const [isImage, setIsImage] = React.useState(false);

  // the freshly picked file wins; otherwise fall back to the persisted copy
  const stored = fileData || null;
  const previewSrc = blob ?? stored;
  const previewIsImage = blob ? isImage : !!stored && stored.startsWith("data:image/");

  // Split the name so the tail (extension + a few chars) is always pinned while
  // the head truncates — a responsive middle-ellipsis without char counting.
  const TAIL = 7;
  const head = value && value.length > TAIL ? value.slice(0, -TAIL) : value;
  const tail = value && value.length > TAIL ? value.slice(-TAIL) : "";

  React.useEffect(() => {
    return () => {
      if (blob) URL.revokeObjectURL(blob);
    };
  }, [blob]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange(f.name);
    if (blob) URL.revokeObjectURL(blob);
    setBlob(URL.createObjectURL(f));
    setIsImage(f.type.startsWith("image/"));
    if (onFileData) void fileToStoredData(f).then(onFileData);
  };

  const clear = () => {
    onChange("");
    onFileData?.(null);
    if (blob) URL.revokeObjectURL(blob);
    setBlob(null);
    setIsImage(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFile}
        className="hidden"
      />
      {value ? (
        // filled: preview trigger + clear live inside one bordered box as a unit
        <div className="flex h-11 w-full items-center gap-1 rounded-md border border-dashed border-brand/50 pl-3 pr-1 text-sm text-foreground">
          <Dialog>
            <DialogTrigger
              aria-label={`${t("order.viewFile")}: ${value}`}
              className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:text-foreground focus-visible:outline-none"
            >
              {previewSrc && previewIsImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt=""
                  aria-hidden="true"
                  className="size-7 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <FileCheck2 className="size-4 shrink-0 text-foreground" />
              )}
              {/* middle-ellipsis: head truncates, tail (extension) stays pinned */}
              <span className="flex min-w-0 flex-1">
                <span className="truncate">{head}</span>
                {tail && <span className="shrink-0">{tail}</span>}
              </span>
              <Eye className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </DialogTrigger>
            {/* media lightbox stays a centred modal at every size */}
            <DialogContent sheet={false} className="max-w-3xl p-0">
              <DialogHeader className="pb-4">
                <DialogTitle className="truncate pr-8 text-base font-medium sm:text-base">
                  {value}
                </DialogTitle>
              </DialogHeader>
              {previewSrc ? (
                previewIsImage ? (
                  <div className="min-h-0 flex-1 overflow-auto bg-surface-2 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSrc}
                      alt={value}
                      className="mx-auto max-h-[72dvh] w-auto rounded-sm object-contain"
                    />
                  </div>
                ) : (
                  <iframe
                    src={previewSrc}
                    title={value}
                    className="min-h-0 w-full flex-1 border-t border-border"
                    style={{ height: "72dvh" }}
                  />
                )
              ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
                  <FileText className="size-8 text-muted-2" aria-hidden="true" />
                  <p className="text-sm text-muted">
                    {t("order.previewUnavailable")}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={clear}
            aria-label={t("order.itRemove")}
            className="shrink-0 hover:text-danger"
          >
            <X />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="dashed"
          onClick={() => inputRef.current?.click()}
          // six of these can share a screen: the document's name joins the
          // accessible name so they are not six identical "Unggah file"
          aria-label={label ? `${t("order.upload")}: ${label}` : undefined}
          className="h-11 w-full justify-start px-3"
        >
          <Upload />
          <span className="truncate">{t("order.upload")}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-2">
            {t("order.uploadMax")}
          </span>
        </Button>
      )}
    </div>
  );
}
