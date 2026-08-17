/**
 * Shared classification of the order attention states (i18n keys set by ops).
 * One source of truth for the banner, the order list, and live toasts, so
 * "good news", "your move", and "hard news" never drift apart per surface.
 */

/** States that report progress, not problems — rendered as success. */
export const POSITIVE_ATTENTION = new Set([
  "order.attAwbIssued",
  "order.attPickupScheduled",
  "order.attPickupRescheduled",
  "order.attClearanceReleased",
  "order.attClearanceReleasedExtra",
]);

/** States where the ball is in the customer's court. */
export const ACTION_ATTENTION = new Set([
  "order.attQuotationReady",
  "order.attRevision",
  "order.attPickupFailCustomer",
  "order.attPickupFailFedEx",
  "order.attNeedsNewAwb",
  "order.attDropOffRequested",
  "order.attClearanceBarpin",
  "order.attClearanceTax",
]);

/** The hardest states — they carry a direct line to a human. */
export const DARK_ATTENTION = new Set([
  "order.attClearanceReject",
  "order.attNeedsNewAwb",
  "order.attAwbChanged",
  "order.attClearanceTax",
]);
