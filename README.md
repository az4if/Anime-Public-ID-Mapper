# Anime Public ID Mapper — Self Hosted

A public REST API for anime episode details and cross-site ID mappings.  
Covers **15,000+ anime** with **200,000+ episodes**.  
Works on **localhost**, **Vercel**, **Render**, **Railway**, **Fly.io**, and **Docker**.

---

## Database Setup

The database dump is included in this repo as **`anime-db.sql.gz`**.  
You need to decompress it and load it into a **Supabase** or local **PostgreSQL** database before running the API.

### ☁️ Restore to Supabase (Recommended)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Connect → Direct connection → URI** and copy the connection string
3. Decompress and restore:

**Windows (PowerShell):**
```powershell
# Decompress
$input = [System.IO.File]::OpenRead("anime-db.sql.gz")
$output = [System.IO.File]::Create("anime-db.sql")
$gz = New-Object System.IO.Compression.GzipStream($input, [System.IO.Compression.CompressionMode]::Decompress)
$gz.CopyTo($output)
$gz.Close(); $output.Close(); $input.Close()

# Restore
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -d "YOUR_SUPABASE_CONNECTION_STRING" -f anime-db.sql
```

**Mac / Linux:**
```bash
# Decompress and restore in one command
gunzip -c anime-db.sql.gz | psql "YOUR_SUPABASE_CONNECTION_STRING"
```

> ⏳ This will take a few minutes — the file contains 15,000+ anime records.

---

### 🖥️ Restore to Local PostgreSQL

**Windows (PowerShell):**
```powershell
# Decompress first (same as above), then:
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d animedb -f anime-db.sql
```

**Mac / Linux:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE animedb;"

# Decompress and restore in one command
gunzip -c anime-db.sql.gz | psql -U postgres -d animedb
```

Then set your `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/animedb
DATABASE_SSL=false
```

---

## API Endpoints

### `GET /`
Health check — also verifies DB connection.

### `GET /mappings`
Returns full episode details and cross-site ID mappings for an anime.

| Query Param  | Description         |
|--------------|---------------------|
| `mal_id`     | MyAnimeList ID      |
| `anilist_id` | AniList ID          |
| `anidb_id`   | AniDB ID            |
| `thetvdb_id` | TheTVDB ID          |

**Example requests:**
```
/mappings?mal_id=57181
/mappings?anilist_id=170942
/mappings?anidb_id=18278
/mappings?thetvdb_id=429934
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable       | Required | Description                                         |
|----------------|----------|-----------------------------------------------------|
| `DATABASE_URL` | ✅       | Postgres connection string                          |
| `DATABASE_SSL` | No       | Set to `false` for local Postgres (default: `true`) |
| `DB_POOL_MAX`  | No       | Max DB connections (default: `5`)                   |
| `PORT`         | No       | Server port (default: `3000`)                       |

### Which connection string to use?

| Platform           | Supabase Connection Type                  |
|--------------------|-------------------------------------------|
| Vercel             | **Transaction pooler** (port `6543`)      |
| Render / Railway   | **Direct connection** (port `5432`)       |
| Docker / localhost | **Direct connection** (port `5432`)       |

Find these under **Supabase → Connect → Connection string**.

---
## Proxy (Optional)

Use `worker.js`, a Cloudflare Worker, to access your deployed database via a proxy URL.

---

## Deployment

### 🖥️ Localhost

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL in .env
npm start
# or for auto-reload:
npm run dev
```

Visit: `http://localhost:3000/mappings?mal_id=57181`

---

### ▲ Vercel

```bash
npm install -g vercel
vercel login
vercel
vercel env add DATABASE_URL production   # paste Transaction pooler URL
vercel --prod
```

Or via dashboard:
1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add env var: `DATABASE_URL` (use Transaction pooler URL)
4. Deploy

---

### 🟣 Render

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → Connect repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add env var: `DATABASE_URL` (use Direct connection URL)
5. Deploy

---

### 🚂 Railway

1. Push repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add env var: `DATABASE_URL` (use Direct connection URL)
4. Railway auto-detects Node.js and deploys

---

### ✈️ Fly.io

```bash
fly launch
fly secrets set DATABASE_URL="your_direct_connection_string"
fly deploy
```

---

### 🐳 Docker

```bash
# Copy and fill in your .env first
cp .env.example .env

# Build and run
docker compose up --build

# Or manually
docker build -t anime-public-id-mapper .
docker run -p 3000:3000 -e DATABASE_URL="your_connection_string" anime-public-id-mapper
```

Test it:
```bash
curl http://localhost:3000/mappings?mal_id=57181
```
