<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The canvas follows the pages

`/canvas` is a board of every state of the flows it covers, as static frames with their rules and changelog, made by kanvas (`../kanvas`) from `kanvas.config.ts` (docs/expat-order-flow.md, "Every state on a canvas"). Today that's Expat Relocation: the landing, Check Rate, the plan, the Booking Summary and the expat tab of `/simulator`.

When a change to one of those pages is committed to main, follow it with the board, with the app running: `npm run kanvas -- check`, then `npm run kanvas -- snap`, `npm run kanvas -- log` and `npm run kanvas -- build`, and commit `public/canvas` on its own ("chore(kanvas): frames for …"). Fix any scene the change broke, and add a scene for each state the change adds (`lib/canvas/expat/scenes.ts`). Scene titles, notes and arrow labels are in English. Put who asked for a change in its commit as a `Source:` trailer (or name its ticket), so the board's changelog says it.
