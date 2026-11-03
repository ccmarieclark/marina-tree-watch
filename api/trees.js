import { list } from "@vercel/blob";

// Returns every tree visitors have added. The map loads this next to trees.json.
export default async function handler(req, res) {
  try {
    let cursor, blobs = [];
    do {
      const r = await list({ prefix: "trees/", cursor, limit: 1000 });
      blobs = blobs.concat(r.blobs);
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    const items = (await Promise.all(blobs.map((x) => fetch(x.url).then((r) => r.json()).catch(() => null)))).filter((t) => t && t.id);
    res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60");
    return res.status(200).json(items);
  } catch (e) {
    console.error("trees failed", e);
    return res.status(200).json([]);
  }
}
