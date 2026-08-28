# Flow Mate

A calm task list. Your day, in flow. Capture tasks with due dates, scope them by status or date, search across everything you've saved, and check them off as you go. Your tasks stay scoped to your account and follow you across sessions.

## Stack

- **Frontend**: React 18 + Vite, Tailwind CSS (v4), TanStack Query, React Router, Sonner toasts
- **Backend**: Node.js + Express, MongoDB via Mongoose, JWT auth in httpOnly cookies, Helmet security headers
- **Deploy**: Render (single web service serves both API and built SPA)

## Project layout

```
FlowMate/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── models/            # Mongoose schemas (User, Task)
│   │   ├── routes/            # Auth + Task endpoints
│   │   ├── validation/        # Zod schemas
│   │   ├── app.js             # Express setup, CORS, Helmet, static SPA
│   │   └── server.js          # Entry point, DB connect, graceful shutdown
│   ├── .env.example           # Template for required env vars
│   └── package.json
├── frontend/
│   ├── public/                # Static assets (favicon, theme-init.js)
│   ├── src/
│   │   ├── components/        # Reusable UI (TaskCard, Header, Segmented, etc.)
│   │   ├── lib/               # Axios, context, animations, utilities
│   │   ├── pages/             # Landing, Auth, Home (task board)
│   │   ├── __tests__/         # Vitest + MSW
│   │   ├── index.css          # Tailwind v4 + design tokens
│   │   ├── main.jsx           # Entry
│   │   └── App.jsx            # Routes + providers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── render.yaml                # Render Blueprint (single web service)
├── docker-compose.yml         # Local dev stack
├── Dockerfile                 # Production image (optional)
├── .node-version              # Node 22.12.0 (Vite 7 requirement)
├── .gitignore
└── LICENSE
```

## Core principles

**Per-account isolation.** Every task belongs to one user. The backend filters every query by `req.user._id`. No shared lists, no admin view, no leakage. Your data is yours.

**Calm by default.** No badges that scream, no streaks to protect, no upgrade nudges. The only signal color is green for done and amber when something is genuinely late. The UI crossfades instead of flashing.

**Search that keeps up.** Type a word and the list narrows as you go. It covers every title you've ever saved.

**Progress that saves itself.** Check a task off and the row settles into a quiet done state. Your count updates on its own. Nothing needs saving.

**Due dates that nudge instead of nag.** A task turns amber only once it's actually overdue. Until then it just sits there, patiently.

**Single-origin simplicity.** The backend serves the API and the built SPA from one origin. No CORS headaches, no split deployments. One Render service, one URL.

## Local development

Prerequisites: Node 22.12.0+, MongoDB (local or Atlas).

```bash
# Backend
cd backend
cp .env.example .env
# edit .env with your MongoDB URI and a JWT secret
npm install
npm run dev

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend on port 5001.

## Environment variables (backend)

| Key | Required | Description |
|-----|----------|-------------|
| `MONGODB_CONNECTION_STRING` | yes | MongoDB Atlas SRV URI (or local URI) |
| `JWT_SECRET` | yes (production) | Long random string (generate: `openssl rand -hex 32`) |
| `CORS_ORIGINS` | no | Comma-separated origins for cross-origin calls |
| `NODE_ENV` | no | `production` enables secure cookies |
| `PORT` | no | Defaults to 5001 (Render sets 10000) |

## Render deploy (single service)

1. Push this repo to GitHub.
2. Render Dashboard → New → Blueprint → connect the repo. The `render.yaml` defines one web service:
   - Root directory: `backend`
   - Build: `npm install && npm run build` (builds frontend, then backend)
   - Start: `npm start`
   - Health check: `/api/health`
3. Add these Environment Variables in the Render dashboard:
   - `NODE_ENV=production`
   - `MONGODB_CONNECTION_STRING` = your Atlas SRV URI
   - `JWT_SECRET` = `openssl rand -hex 32`
   - `CORS_ORIGINS` = (leave blank or add local dev if needed)
4. Deploy. Render gives you `https://your-app.onrender.com` serving both API and SPA.

## Docker (alternative)

```bash
docker compose up --build
```
Exposes the app on port 5001. Requires `MONGODB_CONNECTION_STRING` and `JWT_SECRET` in the environment.

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | no | Create account, set session cookie |
| POST | `/api/auth/login` | no | Sign in, set session cookie |
| POST | `/api/auth/logout` | yes | Clear session cookie |
| GET | `/api/auth/me` | yes | Current user profile |
| GET | `/api/tasks` | yes | List tasks (filter, search, paginate) |
| POST | `/api/tasks` | yes | Create task |
| PUT | `/api/tasks/:id` | yes | Update task |
| DELETE | `/api/tasks/:id` | yes | Delete task |

## Testing

```bash
cd frontend
npm test          # Vitest + MSW (11 tests)
npm run lint      # ESLint
```

## License

MIT. See LICENSE.

---

Built by Tri Cuong (Vinny) Dao.