import { list, del } from "@vercel/blob";

// Your private page: /api/admin?key=YOUR_ADMIN_KEY  shows every visitor tree with a Remove link.
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  const key = String(req.query.key || "");
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).send("Not allowed");
  try {
    const rm = String(req.query.remove || "");
    if (/^[a-z0-9]{4,20}$/.test(rm)) {
      const found = [...(await list({ prefix: "trees/" + rm + ".json" })).blobs, ...(await list({ prefix: "photos/" + rm + ".jpg" })).blobs];
      if (found.length) await del(found.map((x) => x.url));
      res.setHeader("Location", "/api/admin?key=" + encodeURIComponent(key));
      return res.status(302).end();
    }
    let cursor, blobs = [];
    do {
      const r = await list({ prefix: "trees/", cursor, limit: 1000 });
      blobs = blobs.concat(r.blobs);
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    const items = (await Promise.all(blobs.map((x) => fetch(x.url).then((r) => r.json()).catch(() => null)))).filter((t) => t && t.id);
    items.sort((a, b) => (a.id < b.id ? 1 : -1));
    const rows = items.map((t) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #ddd">
      <img src="${esc(t.photo)}" style="width:96px;height:96px;object-fit:cover;border-radius:8px">
      <div style="flex:1"><b>${esc(t.label)}</b><br>${esc(t.by || "anonymous")} &middot; ${esc(t.seen)}<br>${esc(t.note)}</div>
      <a href="/api/admin?key=${encodeURIComponent(key)}&remove=${esc(t.id)}" onclick="return confirm('Remove this tree?')" style="color:#b00020;font-weight:600">Remove</a></div>`).join("");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;max-width:640px;margin:20px auto;padding:0 16px"><h2>Trees added by visitors (${items.length})</h2>${rows || "<p>None yet.</p>"}`);
  } catch (e) {
    return res.status(500).send("Error: " + esc(e && e.message));
  }
}
