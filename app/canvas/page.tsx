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
          Tiap halaman prototype sebagai satu board: semua state yang diminta story-nya, jalur positive dan negative,
          di-render langsung dari halaman aslinya. Bukan screenshot, jadi selalu mengikuti kode.
        </p>
        <ul>
          {BOARDS.map((b) => {
            const n = boardCount(b);
            return (
              <li key={b.id}>
                <Link href={`/canvas/${b.id}`}>
                  <h2>{b.title}</h2>
                  <code>{b.route}</code>
                  <p>{b.lead}</p>
                  <small>
                    {n.lanes} story · {n.scenes} frame{n.gaps ? ` · ${n.gaps} belum ada` : ""}
                  </small>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
