"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeletePackingListDialog({
  code,
  open,
  onOpenChange,
  onConfirm,
}: {
  code: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("pl.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("pl.deleteBody").replace("{code}", code ?? "")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 p-6 pt-0 sm:flex-row-reverse">
          <Button type="button" variant="danger" onClick={onConfirm} className="sm:flex-1">
            {t("pl.deleteConfirm")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            {t("pl.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
