# Marina Tree Watch

A hand-inked map of the Marina (San Francisco). Visitors tap the map, add a photo and an optional comment, and send a tree for approval.

## Files
- `index.html` the whole site (map + form)
- `trees.json` the approved trees shown on the map
- `photos/` photos for approved trees
- `api/submit.js` receives visitor submissions and stores them privately-by-obscurity in Vercel Blob
- `api/pending.js` lists waiting requests at `/api/pending?key=ADMIN_KEY`

## Go live in 10 minutes (no coding)
1. Make a free account at vercel.com (sign in with Google or GitHub).
2. Click "Add New... > Project", then drag this whole unzipped folder onto the page (or use "Import" with a GitHub repo).
3. Click Deploy. In about a minute you get a link like marina-tree-watch.vercel.app, and that is your site.
4. Do the two settings under "Setup" below so visitors can send trees.
5. Later, in Vercel > Settings > Domains, you can attach your own web address.

## Setup (once)
1. Put this folder in a GitHub repo and import it in Vercel (or run `vercel`).
2. In Vercel: Storage > Create > Blob, connect it to the project (adds BLOB_READ_WRITE_TOKEN).
3. In Vercel: Settings > Environment Variables > add `ADMIN_KEY` with a long private phrase. Redeploy.

## Approving a tree
Open `/api/pending?key=YOUR_ADMIN_KEY`, pick a request, then ask Claude Code:
"Add this tree to trees.json and save its photo into photos/" and paste the request. Push to deploy.
