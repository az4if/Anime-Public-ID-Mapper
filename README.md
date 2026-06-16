# Anime Public DB Mapper — Self Hosted

Anime episode mapping API backed by Supabase (or any Postgres DB).  
Works on **localhost**, **Vercel**, **Render**, **Railway**, **Fly.io**, and **Docker**.

---

## API Endpoints

### `GET /`
Health check.

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

Copy `.env.example` to `.env` and fill in:

| Variable       | Required | Description                              |
|----------------|----------|------------------------------------------|
| `DATABASE_URL` | ✅       | Postgres connection string               |
| `DATABASE_SSL` | No       | Set to `false` for local Postgres        |
| `DB_POOL_MAX`  | No       | Max DB connections (default: 5)          |
| `PORT`         | No       | Server port (default: 3000)              |

---

## Deployment

### 🖥️ Localhost

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL in .env
npm start
# or for auto-reload during dev:
npm run dev
```

Visit: `http://localhost:3000/mappings?mal_id=57181`

---

### ▲ Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add environment variable: `DATABASE_URL`
4. Deploy — no build command needed

---

### 🟣 Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → Connect repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add environment variable: `DATABASE_URL`
5. Deploy

---

### 🚂 Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variable: `DATABASE_URL`
4. Railway auto-detects Node.js and deploys

---

### ✈️ Fly.io

```bash
# Install flyctl, then:
fly launch
fly secrets set DATABASE_URL="your_connection_string"
fly deploy
```

---

### 🐳 Docker

```bash
# Build and run with docker-compose
cp .env.example .env
# Fill in DATABASE_URL in .env
docker compose up --build

# Or build and run manually
docker build -t anime-public-db-mapper .
docker run -p 3000:3000 -e DATABASE_URL="your_connection_string" anime-public-db-mapper
```
