"use client";

import * as React from "react";
import { Upload, FileCheck2, X } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Mock file upload: captures the file NAME (persisted in the draft via `onChange`)
 * and shows a session-only image preview. No real upload/backend yet.
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
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange(f.name);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const clear = () => {
    onChange("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex h-11 flex-1 items-center gap-2 rounded-md border border-dashed px-3 text-sm transition-colors",
          value
            ? "border-brand/50 text-foreground"
            : "border-border-strong text-muted hover:border-border-strong hover:text-foreground",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            aria-hidden="true"
            className="size-7 shrink-0 rounded-sm object-cover"
          />
        ) : value ? (
          <FileCheck2 className="size-4 shrink-0 text-foreground" />
        ) : (
          <Upload className="size-4 shrink-0" />
        )}
        <span className="truncate">{value || t("order.upload")}</span>
      </button>
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label={t("order.itRemove")}
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-3 hover:text-danger"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
