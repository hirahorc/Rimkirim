import type * as React from "react";
import { WA_URL } from "@/lib/contact";
import type { BookingFacts } from "./booking-facts";

type T = (path: string) => string;

/* Email clients ignore stylesheets and most of CSS, so this is built the way
   email is: one 600px table, inline styles only, system fonts, no classes.
   Dev can lift it into the mail service as is. */
const INK = "#282828";
const MUTED = "#5f6368";
const LINE = "#e5e7eb";
const DUSK = "#4a1e67";
const DUSK_SOFT = "#ead6fc";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: "14px 0", borderTop: `1px solid ${LINE}`, verticalAlign: "top", width: 150, color: MUTED, fontSize: 13 }}>
        {label}
      </td>
      <td style={{ padding: "14px 0", borderTop: `1px solid ${LINE}`, verticalAlign: "top", color: INK, fontSize: 14, lineHeight: "21px" }}>
        {children}
      </td>
    </tr>
  );
}

/**
 * The Booking Summary Confirmation email (Story 7): one email, the same for
 * both recipients, the customer and hello@rimkirim.com. It carries the
 * booking summary and what happens next, and never the Customs Category,
 * which ops reads on the internal ticket instead.
 */
export function BookingEmail({ facts: f, t }: { facts: BookingFacts; t: T }) {
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  const em = (k: string) => t(`expatOrder.email.${k}`);
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#f4f4f5", fontFamily: FONT }}>
      <tbody>
        <tr>
          <td align="center" style={{ padding: "24px 12px" }}>
            <table role="presentation" width={600} cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, width: "100%", background: "#ffffff", borderRadius: 16, overflow: "hidden" }}>
              <tbody>
                <tr>
                  <td style={{ background: DUSK, padding: "32px 32px 28px" }}>
                    <p style={{ margin: 0, color: DUSK_SOFT, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {bk("received")} · {bk("number")}
                    </p>
                    <p style={{ margin: "6px 0 0", color: "#ffffff", fontSize: 30, fontWeight: 700, letterSpacing: "-0.01em" }}>{f.number}</p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "28px 32px 8px", color: INK, fontSize: 15, lineHeight: "23px" }}>
                    <p style={{ margin: 0 }}>{em("greeting").replace("{name}", f.contact.name)}</p>
                    <p style={{ margin: "12px 0 0" }}>{em("intro")}</p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "12px 32px" }}>
                    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                      <tbody>
                        <Row label={bk("route")}>
                          <strong>{f.from.country}</strong>, {f.from.address}
                          <br />
                          <strong>{f.to.country}</strong>, {f.to.address}
                          {f.to.detail && <span style={{ color: MUTED }}> ({f.to.detail})</span>}
                        </Row>
                        <Row label={bk("shipping")}>
                          <strong>{f.shipping.service}</strong>
                          {f.shipping.special && ` · ${t("expatOrder.rates.special")}`}
                          <br />
                          {f.shipping.transit} · {f.shipping.weight}
                          <br />
                          <strong style={{ fontSize: 18 }}>{f.shipping.estimate}</strong>
                          <br />
                          <span style={{ color: MUTED, fontSize: 12 }}>{t("expatOrder.rates.disclaimer")}</span>
                        </Row>
                        <Row label={bk("items")}>
                          {f.items.join(", ")}
                          <br />
                          <span style={{ color: MUTED }}>{f.packReminder}</span>
                        </Row>
                        {f.packing && (
                          <Row label={bk("packing")}>
                            <strong>{f.packing.summary}</strong>
                            {f.packing.packages.map((pk) => (
                              <span key={pk.title}>
                                <br />
                                {pk.title}, {pk.measures}
                                <br />
                                <span style={{ color: MUTED }}>{pk.items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}</span>
                              </span>
                            ))}
                          </Row>
                        )}
                        <Row label={bk("pickup")}>{f.pickup}</Row>
                        <Row label={bk("contact")}>
                          {f.contact.name}
                          <br />
                          {f.contact.email}
                          <br />
                          {f.contact.phone}
                        </Row>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "20px 32px 8px" }}>
                    <p style={{ margin: 0, color: INK, fontSize: 16, fontWeight: 700 }}>{bk("nextTitle")}</p>
                    {f.next.map((n, i) => (
                      <p key={n.title} style={{ margin: "14px 0 0", color: INK, fontSize: 14, lineHeight: "21px" }}>
                        <strong>
                          {i + 1}. {n.title}
                        </strong>
                        <br />
                        <span style={{ color: MUTED }}>{n.body}</span>
                      </p>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "24px 32px 32px", color: INK, fontSize: 14, lineHeight: "21px" }}>
                    <p style={{ margin: 0 }}>
                      {bk("help")}{" "}
                      <a href={WA_URL} style={{ color: DUSK, fontWeight: 600 }}>
                        {bk("helpCta")}
                      </a>
                    </p>
                    <p style={{ margin: "20px 0 0" }}>{em("signoff")}</p>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "16px 32px", borderTop: `1px solid ${LINE}`, color: MUTED, fontSize: 12 }}>{em("footer")}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
