import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const photo = String(b.photo || "");
  if (!photo.startsWith("data:image/") || photo.length > 400000) return res.status(400).json({ error: "A photo is required (under about 300 KB)." });
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
  await put("requests/" + item.id + ".json", JSON.stringify(item), { access: "public", addRandomSuffix: false, contentType: "application/json" });
  res.status(200).json({ ok: true });
}
