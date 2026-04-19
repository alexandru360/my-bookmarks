# 🔖 My Bookmarks

[![Build & Push Docker](https://github.com/alex360/my-bookmarks/actions/workflows/docker.yml/badge.svg)](https://github.com/alex360/my-bookmarks/actions/workflows/docker.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/alex360/my-bookmarks)](https://hub.docker.com/r/alex360/my-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A self-hosted bookmark manager with a browser extension for Chrome and Firefox.

**Features:** Google OAuth · Categories · Tags · Import/Export (Chrome/Firefox HTML, JSON) · Swagger API · Docker single-image

---

## 🐳 Quick Start with Docker

```bash
# 1. Clone
git clone https://github.com/alex360/my-bookmarks.git
cd my-bookmarks

# 2. Configure
cp backend/.env.example .env
# Edit .env: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, APP_URL

# 3. Run
docker compose up -d

# App: http://localhost:3000
# Swagger: http://localhost:3000/api
```

---

## 📦 Unraid Installation

### Step 1 — Community Apps (CA)

> If you don't have Community Apps installed, go to **Apps → Install Community Apps** first.

1. In Unraid, go to **Apps** → search for **"My Bookmarks"** *(or add manually below)*

### Step 2 — Add container manually

1. Go to **Docker** tab → **Add Container**
2. Fill in:

| Field | Value |
|---|---|
| **Name** | `my-bookmarks` |
| **Repository** | `alex360/my-bookmarks:latest` |
| **Network Type** | `bridge` |
| **Port** | Host: `3000` → Container: `3000` |
| **Volume** | Host: `/mnt/user/appdata/my-bookmarks` → Container: `/app/storage` |

3. Add **Environment Variables**:

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `JWT_SECRET` | Any long random string |
| `APP_URL` | `http://YOUR_UNRAID_IP:3000` |

4. Click **Apply**

### Step 3 — Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs:
   ```
   http://YOUR_UNRAID_IP:3000/auth/google/callback
   ```
5. Copy **Client ID** and **Client Secret** into Unraid environment variables

### Step 4 — Done!

Open `http://YOUR_UNRAID_IP:3000` → Login with Google → Start saving bookmarks!

---

## 🧩 Browser Extension

### Install (Chrome)
1. Download or clone this repo
2. Go to `chrome://extensions/`
3. Enable **Developer Mode** (top right toggle)
4. Click **Load unpacked** → select the `extension/` folder

### Install (Firefox)
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `extension/manifest.json`

> For permanent Firefox install: sign the extension via [addons.mozilla.org](https://addons.mozilla.org)

### Extension Setup
1. Click the 🔖 icon in the toolbar
2. Click ⚙ Settings → set **API URL** to your server (e.g. `http://localhost:3000`)
3. Click **Login with Google** — a tab opens, you login, the tab closes automatically
4. Start saving bookmarks with one click!

---

## 💻 Local Development

```bash
# Backend
cd backend
cp .env.example .env  # Fill in Google OAuth credentials
npm install
npm run migration:run
npm run start:dev     # http://localhost:3000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

---

## 🗂 Data Storage

Everything is stored in a **single folder** mapped to `/app/storage`:

```
/app/storage/
├── data/
│   └── bookmarks.db   ← SQLite database
├── logs/
│   ├── app-YYYY-MM-DD.log
│   └── error-YYYY-MM-DD.log
└── config/            ← reserved for future use
```

---

## 📤 Import / Export

| Format | Import | Export |
|---|---|---|
| Chrome HTML | ✅ | ✅ |
| Firefox HTML | ✅ | ✅ |
| JSON | ✅ | ✅ |

To export from Chrome: `chrome://bookmarks/` → ⋮ → **Export bookmarks**  
To export from Firefox: **Bookmarks** menu → **Manage Bookmarks** → **Import and Backup** → **Export Bookmarks to HTML**

---

## 🔧 API

Swagger UI available at `http://YOUR_HOST:3000/api`

All endpoints require `Authorization: Bearer <JWT>` except `/auth/google`.
