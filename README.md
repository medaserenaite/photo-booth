# 📸 Party Booth

A full-stack party photo booth web app with SMS photo sharing via Twilio MMS.

**Stack:** React + Vite · Tailwind CSS · Node.js + Express · SQLite · Sharp · Twilio

---

## Features

- 📷 Webcam capture with 3-2-1 countdown + shutter flash
- 🖼️ Frame overlays (composited server-side with Sharp)
- 📱 MMS photo delivery via Twilio
- 🏛️ Public photo gallery (`/gallery/:slug`) with infinite scroll & auto-refresh
- ⚙️ Admin panel (`/admin`) — stats, resend, gallery settings, session clear, ZIP download
- 🚀 Production-ready — Docker, Railway & Render deploy configs included

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Twilio credentials and other settings
```

### 3. Run setup (generates placeholder frames, creates DB/uploads directories)

```bash
npm run setup
```

### 4. Start development

```bash
npm run dev
```

- **Client (React):** http://localhost:5173
- **Server (API):**   http://localhost:3000

---

## Environment Variables

| Variable               | Description                                                    | Required |
|------------------------|----------------------------------------------------------------|----------|
| `TWILIO_ACCOUNT_SID`   | Twilio Account SID (from console.twilio.com)                   | Yes      |
| `TWILIO_AUTH_TOKEN`    | Twilio Auth Token                                              | Yes      |
| `TWILIO_PHONE_NUMBER`  | Twilio phone number with MMS capability (e.g. `+15551234567`) | Yes      |
| `PORT`                 | Server port (default: `3000`)                                  | No       |
| `EVENT_NAME`           | Display name for the event (e.g. `Jake's Birthday`)            | No       |
| `SMS_MESSAGE`          | SMS body template. Use `{EVENT_NAME}` placeholder.             | No       |
| `ADMIN_PASSWORD`       | Password for the `/admin` panel                                | Yes      |
| `GALLERY_ENABLED`      | `true` / `false` — whether the public gallery is accessible   | No       |
| `GALLERY_SLUG`         | URL slug for the gallery (e.g. `jakes-party`)                  | No       |
| `PUBLIC_URL`           | Publicly accessible base URL — used in Twilio MMS image URLs  | Yes      |

> **Local dev note:** For Twilio MMS to work locally, `PUBLIC_URL` must be a public URL.
> Use [ngrok](https://ngrok.com): `ngrok http 3000` → set `PUBLIC_URL=https://xxxx.ngrok.io`

---

## Twilio Setup

1. Create a free account at [twilio.com](https://www.twilio.com)
2. Go to **Phone Numbers → Manage → Buy a Number**
3. Search for a US number with **MMS** capability
4. Copy your **Account SID** and **Auth Token** from the Console Dashboard
5. Paste them into `.env`

> Free trial accounts can only send to verified numbers. Upgrade to send to any US number.

---

## Custom Frames

Frames are 1280×720 PNG files with a transparent center.

1. Create your PNG (Figma / Photoshop / Canva)
2. Drop it in `frames/`
3. Run `npm run setup` to copy it to `client/public/frames/`
4. Register it in `client/src/App.jsx` → the `FRAMES` array:

```js
{ slug: 'my-frame', label: 'My Frame', thumbnail: '/frames/my-frame.png' }
```

See `frames/README.md` for the full spec.

---

## Deployment

### Railway (recommended)

1. Push your repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
3. Railway auto-detects the `Dockerfile`
4. Add environment variables in Railway dashboard
5. Set `PUBLIC_URL` to your Railway-provided URL (e.g. `https://party-booth-production.up.railway.app`)
6. Add a **persistent volume** mounted at `/app/server/uploads` so photos survive redeploys

That's it — your booth is live!

### Render

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service → Connect GitHub repo**
3. Render reads `render.yaml` automatically and configures the service
4. Add env vars in the Render dashboard
5. Set `PUBLIC_URL` to your Render URL
6. The `render.yaml` already includes a 10 GB persistent disk at `/app/server/uploads`

### Custom Domain (optional)

- **Railway:** Settings → Custom Domain → add your domain → update DNS CNAME
- **Render:** Settings → Custom Domains → add domain → follow DNS instructions
- Update `PUBLIC_URL` to your custom domain

---

## npm Scripts

| Script         | Description                                           |
|----------------|-------------------------------------------------------|
| `npm run dev`  | Start client (Vite, port 5173) + server (port 3000)   |
| `npm run build`| Build React client to `client/dist/`                  |
| `npm run start`| Production server (serves API + built client)          |
| `npm run setup`| Create dirs, generate placeholder frames, copy frames  |

---

## Project Structure

```
party-booth/
├── client/                  React + Vite frontend
│   ├── src/
│   │   ├── App.jsx          Main app + booth flow state machine
│   │   ├── components/      Camera, FrameSelector, PhotoPreview, etc.
│   │   ├── hooks/           useCamera — webcam access + capture logic
│   │   ├── lib/api.js       Fetch wrappers for all API calls
│   │   └── styles/index.css Tailwind + custom party styles
│   └── public/frames/       Frame PNG overlays (served statically)
├── server/
│   ├── index.js             Express entry point
│   ├── routes/              photos, sms, gallery, admin
│   ├── services/            db (SQLite), imageProcessor (Sharp), twilio
│   ├── middleware/          smsRateLimit
│   └── uploads/             Stored photos (gitignored)
├── frames/                  Source frame PNGs
├── scripts/setup.js         Setup script
├── Dockerfile
├── railway.json
└── render.yaml
```

---

## License

MIT
