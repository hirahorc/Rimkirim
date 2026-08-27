"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("pl.cancel")}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {t("pl.deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
