"use client";

import * as React from "react";
import { Upload, FileCheck2, X, Eye, FileText } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Mock file upload: captures the file NAME (persisted in the draft via `onChange`)
 * and keeps a session-only object URL so the picked file can be previewed at full
 * size. No real upload/backend yet, so the preview is unavailable after a reload.
 *
 * Interaction: clicking the file opens the full preview; the file can only be
 * replaced after it is removed (the X) — there is no click-to-replace.
 */
export function FileUpload({
  value,
  onChange,
  accept = "image/*,application/pdf",
  className,
}: {
  value?: string;
  onChange: (name: string) => void;
  accept?: string;
  className?: string;
}) {
  const t = useT();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [blob, setBlob] = React.useState<string | null>(null);
  const [isImage, setIsImage] = React.useState(false);

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
  };

  const clear = () => {
    onChange("");
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
              {blob && isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={blob}
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
            <DialogContent className="max-w-3xl p-0">
              <DialogHeader className="pb-4">
                <DialogTitle className="truncate pr-8 text-base font-medium sm:text-base">
                  {value}
                </DialogTitle>
              </DialogHeader>
              {blob ? (
                isImage ? (
                  <div className="min-h-0 flex-1 overflow-auto bg-surface-2 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blob}
                      alt={value}
                      className="mx-auto max-h-[72dvh] w-auto rounded-sm object-contain"
                    />
                  </div>
                ) : (
                  <iframe
                    src={blob}
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
          <button
            type="button"
            onClick={clear}
            aria-label={t("order.itRemove")}
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-11 w-full items-center gap-2 rounded-md border border-dashed border-border-strong px-3 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Upload className="size-4 shrink-0" />
          <span className="truncate">{t("order.upload")}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-2">
            {t("order.uploadMax")}
          </span>
        </button>
      )}
    </div>
  );
}
