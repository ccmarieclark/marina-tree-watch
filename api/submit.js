import { put } from "@vercel/blob";

// Visitors send a tree + photo. It goes live right away: the photo is saved as an image file and the tree as a small JSON file.
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    let b = {};
    try { b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; } catch (e) { return res.status(400).json({ error: "Could not read the request." }); }
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.photo || ""));
    if (!m) return res.status(400).json({ error: "A photo is required." });
    if (m[1].length > 600000) return res.status(413).json({ error: "That photo is too big. Try another one." });
    const buf = Buffer.from(m[1], "base64");
    if (buf.length < 100 || buf[0] !== 0xff || buf[1] !== 0xd8) return res.status(400).json({ error: "That photo could not be read." });
    const x = b.x == null || b.x === "" ? NaN : Number(b.x), y = b.y == null || b.y === "" ? NaN : Number(b.y);
    // x and y are the map's own street-grid numbers (the same ones the map uses when you tap): about -55 to 595 across, -45 to 462 down.
    if (!Number.isFinite(x) || !Number.isFinite(y)) return res.status(400).json({ error: "Tap the map where the tree is, then send again." });
    if (x < -70 || x > 610 || y < -60 || y > 480) return res.status(400).json({ error: "That spot is outside the Marina map. Tap the map where the tree is." });
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return res.status(500).json({ error: "The photo storage is not connected to this project yet." });
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const img = await put("photos/" + id + ".jpg", buf, { access: "public", addRandomSuffix: false, contentType: "image/jpeg" });
    const tree = {
      id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10,
      label: String(b.label || "").slice(0, 120),
      by: String(b.by || "").slice(0, 60),
      note: String(b.note || "").slice(0, 500),
      seen: new Date().toISOString().slice(0, 10),
      rating: 5, lane: false, photo: img.url,
    };
    await put("trees/" + id + ".json", JSON.stringify(tree), { access: "public", addRandomSuffix: false, contentType: "application/json" });
    return res.status(200).json({ ok: true, tree });
  } catch (e) {
    console.error("submit failed", e);
    return res.status(500).json({ error: "Storage error: " + String((e && e.message) || e).slice(0, 160) });
  }
}
