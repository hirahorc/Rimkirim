import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CanvasBoard } from "@/components/canvas/CanvasBoard";
import { HAS_CANVAS } from "@/lib/env";
import { findBoard } from "@/lib/canvas/registry";

export async function generateMetadata({ params }: { params: Promise<{ board: string }> }): Promise<Metadata> {
  const { board } = await params;
  return {
    title: `${findBoard(board)?.title ?? "Canvas"} · Canvas · Rimkirim`,
    robots: { index: false, follow: false },
  };
}

/**
 * One board: a page of the prototype with every state its stories ask for.
 * Wherever the canvas ships (lib/env.ts, HAS_CANVAS), and never in a search index.
 */
export default async function CanvasBoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  if (!HAS_CANVAS || !findBoard(board)) notFound();
  return <CanvasBoard boardId={board} />;
}
