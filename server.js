require("dotenv").config();
const express = require("express");
const { handleMappings, handleHealth, setCors } = require("./src/handler");

const app = express();

// Middleware
app.use((req, res, next) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", handleHealth);
app.get("/mappings", handleMappings);

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Anime Public DB Mapper running on http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/mappings?mal_id=57181`);
});

module.exports = app;
