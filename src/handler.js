const { Pool } = require("pg");

// Single pool instance reused across requests
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 5,
});

async function handleMappings(req, res) {
  const query = req.query || {};
  const { mal_id, anilist_id, anidb_id, thetvdb_id } = query;

  if (!mal_id && !anilist_id && !anidb_id && !thetvdb_id) {
    return res.status(400).json({
      error: "Provide at least one query param",
      supported: ["mal_id", "anilist_id", "anidb_id", "thetvdb_id"],
      example: "/mappings?mal_id=57181",
    });
  }

  try {
    let sql, params;

    if (mal_id) {
      sql = "SELECT data FROM public.store WHERE mal_id = $1 LIMIT 1";
      params = [mal_id];
    } else if (anilist_id) {
      sql = "SELECT data FROM public.store WHERE anilist_id = $1 LIMIT 1";
      params = [anilist_id];
    } else if (anidb_id) {
      sql = "SELECT data FROM public.store WHERE anidb_id = $1 LIMIT 1";
      params = [anidb_id];
    } else if (thetvdb_id) {
      sql = "SELECT data FROM public.store WHERE thetvdb_id = $1 LIMIT 1";
      params = [thetvdb_id];
    }

    const result = await pool.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No mapping found for the given ID" });
    }

    return res.status(200).json(result.rows[0].data);
  } catch (err) {
    console.error("[DB Error]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function handleHealth(req, res) {
  return res.status(200).json({
    status: "ok",
    message: "Anime Public DB Mapper is running",
    timestamp: new Date().toISOString(),
  });
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = { handleMappings, handleHealth, setCors, pool };
