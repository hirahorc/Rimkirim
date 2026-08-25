"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/* Below `sm` a dialog is a vaul bottom sheet (DESIGN.md, Motion, "The mobile
   sheet"): drag-to-dismiss with velocity, the iOS curve, damping — all vaul's.
   From `sm` up it is the centred Radix modal it always was. One API, so call
   sites never choose. */

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

const MobileCtx = React.createContext(false);

/** vaul's Trigger/Close/Title/Description ARE the Radix ones (the dialog dep
 *  is deduped to a single instance), so those exports stay plain Radix and
 *  work inside either root. Only Root and Content branch. */
export function Dialog(
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
) {
  const mobile = useIsMobile();
  return (
    <MobileCtx.Provider value={mobile}>
      {mobile ? <Drawer.Root {...props} /> : <DialogPrimitive.Root {...props} />}
    </MobileCtx.Provider>
  );
}
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function CloseButton() {
  const t = useT();
  return (
    <DialogPrimitive.Close className="tap-target absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50">
      <X className="size-4" />
      <span className="sr-only">{t("common.close")}</span>
    </DialogPrimitive.Close>
  );
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** false: stay a centred modal at every size (media lightboxes) */
    sheet?: boolean;
  }
>(({ className, children, sheet = true, ...props }, ref) => {
  const mobile = React.useContext(MobileCtx);

  if (mobile && sheet) {
    return (
      <Drawer.Portal>
        {/* no .dlg-overlay here: vaul drives the overlay's opacity itself
            (including the drag-linked fade), a fill-mode keyframe would pin it */}
        <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
        <Drawer.Content
          ref={ref}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-lg border-t border-border-strong bg-surface text-foreground shadow-overlay outline-none",
            className,
          )}
          {...props}
        >
          {/* grab handle: the sheet says "drag me" before anyone reads a word */}
          <div
            aria-hidden
            className="mx-auto mb-1 mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-strong"
          />
          {children}
          <CloseButton />
        </Drawer.Content>
      </Drawer.Portal>
    );
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dlg-overlay fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "dlg-panel fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border-strong bg-surface text-foreground shadow-overlay outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <CloseButton />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = "DialogContent";

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0 p-6 pb-4", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-display text-xl font-bold tracking-tight sm:text-2xl",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-sm text-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
