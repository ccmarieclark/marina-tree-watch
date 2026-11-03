import { put } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    let b = {};
    try { b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; } catch (e) { return res.status(400).json({ error: "Could not read the request." }); }
    const photo = String(b.photo || "");
    if (!photo.startsWith("data:image/")) return res.status(400).json({ error: "A photo is required." });
    if (photo.length > 600000) return res.status(413).json({ error: "That photo is too big. Try another one." });
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      x: Number(b.x), y: Number(b.y),
      label: String(b.label || "").slice(0, 120),
      by: String(b.by || "").slice(0, 60),
      note: String(b.note || "").slice(0, 500),
      at: new Date().toISOString().slice(0, 10),
      photo,
    };
    if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) return res.status(400).json({ error: "Missing location." });
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return res.status(500).json({ error: "The photo storage is not connected to this project yet." });
    await put("requests/" + item.id + ".json", JSON.stringify(item), { access: "public", addRandomSuffix: false, contentType: "application/json" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("submit failed", e);
    return res.status(500).json({ error: "Storage error: " + String((e && e.message) || e).slice(0, 160) });
  }
}
