import { list } from "@vercel/blob";

// Visit /api/pending?key=YOUR_ADMIN_KEY to see waiting tree requests (with photos).
export default async function handler(req, res) {
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.status(401).json({ error: "Not allowed" });
  const { blobs } = await list({ prefix: "requests/" });
  const items = await Promise.all(blobs.map((x) => fetch(x.url).then((r) => r.json())));
  res.status(200).json(items);
}
