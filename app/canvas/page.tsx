import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IS_PRODUCTION } from "@/lib/env";
import { BOARDS, boardCount } from "@/lib/canvas/registry";
import "@/components/canvas/canvas.css";

export const metadata: Metadata = {
  title: "Canvas · Rimkirim",
  robots: { index: false, follow: false },
};

/**
 * The canvas's front door: the boards, one per page of a flow. Local
 * development and staging only: in production the route doesn't exist.
 */
export default function CanvasIndexPage() {
  if (IS_PRODUCTION) notFound();
  return (
    <div className="rk-index">
      <div>
        <h1>Canvas</h1>
        <p>
          Every page of the prototype as a board: each state its stories ask for, the positive paths and the negative
          ones, drawn live from the page itself. Not screenshots, so the boards follow the code.
        </p>
        <ul>
          {BOARDS.map((b) => {
            const n = boardCount(b);
            return (
              <li key={b.id}>
                <Link href={`/canvas/${b.id}`}>
                  <h2>{b.title}</h2>
                  <p>{b.lead}</p>
                  <small>
                    {n.lanes} {n.lanes === 1 ? "story" : "stories"} · {n.scenes} {n.scenes === 1 ? "frame" : "frames"}
                    {n.gaps ? ` · ${n.gaps} not built` : ""}
                  </small>
                  <code>{b.route}</code>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
