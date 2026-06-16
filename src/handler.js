const { Pool } = require("pg");

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("[FATAL] DATABASE_URL environment variable is not set!");
}

// Single pool instance reused across requests
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Log pool errors
pool.on("error", (err) => {
  console.error("[Pool Error]", err.message);
});

async function handleMappings(req, res) {
  // Check env at request time too (important for serverless cold starts)
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: "Server misconfiguration: DATABASE_URL is not set",
    });
  }

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
    // Return the actual error message to help debug (remove in production if preferred)
    return res.status(500).json({
      error: "Database error",
      detail: err.message,
    });
  }
}

async function handleHealth(req, res) {
  const dbUrl = process.env.DATABASE_URL;

  // Test DB connection
  let dbStatus = "ok";
  let dbError = null;
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    dbStatus = "error";
    dbError = err.message;
  }

  return res.status(dbStatus === "ok" ? 200 : 500).json({
    status: dbStatus === "ok" ? "ok" : "error",
    message: "Anime Public DB Mapper",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      configured: !!dbUrl,
      ...(dbError && { error: dbError }),
    },
  });
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = { handleMappings, handleHealth, setCors, pool };
