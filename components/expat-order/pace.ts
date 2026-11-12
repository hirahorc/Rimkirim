/**
 * The pace of the order flow's moments of commitment. Nothing here is slow
 * by nature (the rates and the booking are local in the prototype), but
 * handing something over and getting it back in the same frame reads as
 * nothing having been done. So each such moment takes at least its floor:
 * the work and the floor run together and the longer one wins, which is
 * also what stops a spinner from flickering once the work is a real request.
 * Starting values, tuned by eye; everything else in the flow stays instant.
 */
export const PACE = {
  /** Check rate, before the estimate comes up */
  check: 700,
  /** Confirm application, before the Booking Summary opens */
  confirm: 1200,
  /** after the last change to the packages, before the estimate that follows them lands */
  settle: 600,
} as const;

/** `work`'s result, no sooner than `floor` ms from now */
export async function paced<T>(work: T | Promise<T>, floor: number): Promise<T> {
  const [result] = await Promise.all([work, new Promise<void>((done) => window.setTimeout(done, floor))]);
  return result;
}
