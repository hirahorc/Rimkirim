<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The canvas follows the pages

`/canvas` frames every state of the flows it covers, live from their pages (docs/expat-order-flow.md, "Every state on a canvas"). Today that's Expat Relocation: the landing, Check Rate, the plan, the Booking Summary and the expat tab of `/simulator`.

When you change one of those pages, finish by running `npm run check:scenes` with the app running. Fix any scene the change broke, and add a scene for each state the change adds (`lib/canvas/expat/scenes.ts`). Scene titles, notes and arrow labels are in English.
