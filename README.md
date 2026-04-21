# My Bookmarks

[![Build & Push Docker](https://github.com/alexandru360/my-bookmarks/actions/workflows/docker.yml/badge.svg)](https://github.com/alexandru360/my-bookmarks/actions/workflows/docker.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/alex360/my-bookmarks)](https://hub.docker.com/r/alex360/my-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A self-hosted bookmark manager with Google OAuth, categories, import/export, and a browser extension.

---

## Unraid Installation

### 1. Add container

Go to **Docker** tab → **Add Container** and fill in:

| Field | Value |
|---|---|
| **Name** | `My-Bookmarks` |
| **Repository** | `alex360/my-bookmarks:latest` |
| **Network Type** | `bridge` |
| **Port** | Host: `3001` → Container: `3000` |
| **Volume** | Host: `/mnt/user/appdata/my-bookmarks` → Container: `/app/storage` |

### 2. Environment variables

| Variable | Value | Required |
|---|---|---|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Yes (for login) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Yes (for login) |
| `JWT_SECRET` | Long random string | Yes |
| `BACKEND_URL` | `https://your-domain.com` or `http://UNRAID_IP:3001` | Yes |

> `JWT_SECRET` is used to sign authentication tokens. Generate one with: `openssl rand -hex 32`

> The app starts and runs without Google credentials — login will return 503 until they are set.

### 3. Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-domain.com
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-domain.com/auth/google/callback
   ```
6. Copy **Client ID** and **Client Secret** into the Unraid environment variables above

### 4. Done

Open `http://UNRAID_IP:3001` → Login with Google → Start saving bookmarks.

---

## CI/CD — Auto-deploy to Unraid

Every push to `main` automatically:
1. Builds and pushes the Docker image to Docker Hub (`alex360/my-bookmarks:latest`)
2. Connects to your Unraid server via Tailscale + SSH
3. Stops `My-Bookmarks`, pulls the new image, recreates the container preserving all Unraid config

### Required GitHub secrets

| Secret | Description |
|---|---|
| `DOCKERHUB_TOKEN` | Docker Hub personal access token (Read/Write) |
| `TAILSCALE_AUTHKEY` | Tailscale auth key (ephemeral) |
| `UNRAID_HOST` | Tailscale hostname or IP of your Unraid server |
| `UNRAID_USER` | SSH user (usually `root`) |
| `UNRAID_SSH_KEY` | Private SSH key — must be **without passphrase** |

> The SSH key must be added to `/root/.ssh/authorized_keys` on Unraid.
> Generate a passphrase-free key: `ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/unraid_deploy`

---

## Data storage

Everything is stored in the volume mapped to `/app/storage`:

```
/app/storage/
├── data/
│   └── bookmarks.db        SQLite database
├── logs/
│   ├── app-YYYY-MM-DD.log
│   └── error-YYYY-MM-DD.log
└── config/
    └── config.json         Auto-generated on first start
```

`config.json` is created automatically on first run with default values. You can edit it directly or use environment variables (env vars take priority).

---

## Browser Extension

**Chrome:**
1. Go to `chrome://extensions/` → enable **Developer Mode**
2. Click **Load unpacked** → select the `extension/` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `extension/manifest.json`

**Setup:**
1. Click the extension icon → Settings → set **API URL** to your server
2. Click **Login with Google**

---

## Local Development

```bash
# Backend
cd backend
npm install
npm run start:dev     # http://localhost:3000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

Set these env vars for local development:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=any-random-string
BACKEND_URL=http://localhost:3000
```

---

## Import / Export

| Format | Import | Export |
|---|---|---|
| Chrome HTML | yes | yes |
| Firefox HTML | yes | yes |
| JSON | yes | yes |

---

## API

Swagger UI: `http://YOUR_HOST:3001/api`

All endpoints require `Authorization: Bearer <JWT>` except `/auth/google`.
