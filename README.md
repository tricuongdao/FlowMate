# Flow Mate

A task list that measures your commitments against time. Each task lands on a
dial at the moment it falls due, a red needle marks now, and everything behind
the needle prints as late.

## Stack

- **Frontend**: React 19 + Vite, Tailwind CSS v4, TanStack Query, React Router, Sonner, lucide-react
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
│   ├── public/
│   │   ├── fonts/             # Self-hosted Archivo Narrow, IBM Plex Mono, DSEG7
│   │   └── theme-init.js      # Sets the dial before first paint
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dial.jsx       # The arc dial and the narrow stick gauge
│   │   │   ├── ChapterRing.jsx # Status selector with an applied index
│   │   │   ├── Registers.jsx  # Open / late / closed readings
│   │   │   ├── Composer.jsx   # Title plus a due date set on a minute track
│   │   │   ├── Rack.jsx       # The task register (head, rows, skeleton)
│   │   │   ├── RackRow.jsx    # One entry: index, title, due stamp, actions
│   │   │   ├── RackPager.jsx  # Position readout and paging
│   │   │   ├── EmptyRack.jsx  # Empty states: a stopped dial
│   │   │   ├── CaseBack.jsx   # Header: maker's mark and controls
│   │   │   ├── AuthLayout.jsx # Movement card beside the form
│   │   │   ├── DemoDial.jsx   # The landing page's labelled demonstration
│   │   │   └── InstrumentMark.jsx
│   │   ├── lib/
│   │   │   ├── dial.js        # Every measurement the dial reads
│   │   │   ├── tasks.js       # Query + mutation hooks
│   │   │   ├── context.jsx    # Auth and theme providers
│   │   │   ├── useNow.js      # The running time
│   │   │   ├── useReveal.js   # Scroll reveal for the spec sheet
│   │   │   ├── animate.js     # Exit collapse
│   │   │   ├── axios.js       # API client
│   │   │   └── data.js        # Status/date scopes and page size
│   │   ├── pages/             # Landing, Auth, Home (the instrument)
│   │   ├── __tests__/         # Vitest + MSW
│   │   └── index.css          # The Chronometer design system
│   ├── tools/                 # Dev-only harnesses (see Testing)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── render.yaml                # Render Blueprint (single web service)
├── docker-compose.yml         # Local dev stack
├── Dockerfile                 # Production image (optional)
├── DESIGN.md                  # The visual system: tokens, grammar, rules
├── PRODUCT.md                 # Durable product truth
└── LICENSE
```

## Core principles

**Time is the structure.** The dial answers "where do I stand against time?"
before the list answers anything else. Day graduations run outward, tasks are
applied where they fall, and the needle sits at now.

**Late is the one loud fact.** Red means now and overdue, and nothing else.
Brass means the instrument acts and a task is settled. Nothing is coloured
before it is owed.

**Closing is the reward.** A brass strike crosses the row and the entry settles
into the register with the day you closed it.

**Capture costs nothing.** A title is enough. The due date is optional and set
on a minute track, and tasks without one stay off the dial.

**No management overhead.** No boards, no streaks, no reminders, no tiers.

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

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend
on port 5001.

## Environment variables (backend)

| Key | Required | Description |
|-----|----------|-------------|
| `MONGODB_CONNECTION_STRING` | yes | MongoDB Atlas SRV URI (or local URI) |
| `JWT_SECRET` | yes (production) | Long random string (generate: `openssl rand -hex 32`) |
| `CORS_ORIGINS` | no | Comma-separated origins for cross-origin calls |
| `NODE_ENV` | no | `production` enables secure cookies and serves the built SPA |
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
Exposes the app on port 5001. Requires `MONGODB_CONNECTION_STRING` and
`JWT_SECRET` in the environment.

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

`GET /api/tasks` accepts `status` (all/active/complete), `filter`
(all/today/week/month), `search`, `page`, and `limit` (max 50).

## Testing

```bash
cd frontend
npm test          # Vitest + MSW
npm run lint      # ESLint
npm run build     # Production bundle
```

`frontend/tools/` holds development-only harnesses. They are not part of the
shipped app and nothing in `src/` imports them.

```bash
cd frontend
npm run build

# Screenshot a named view (see JOBS in the file for the full list)
node tools/shoot.mjs app-desktop-fold ../.impeccable/review/app.png

# Measure the width the dial actually receives at every breakpoint.
# The arc/stick threshold is set from this, not from a guess.
node tools/measure.mjs

# WCAG contrast audit for every text pair, including composited ones.
# The mechanical design detector cannot evaluate computed contrast, so this
# covers it. Exits non-zero on any pair below its bar.
node tools/contrast.mjs

# Cross-check DESIGN.md's frontmatter against index.css, and its rule/do/don't
# counts against .impeccable/design.json. Reports any silent drift.
node tools/doccheck.mjs
```

## Design

`DESIGN.md` records the visual system: the Chronometer's palette, materials,
type roles, component grammar, and the rules that keep it coherent. `PRODUCT.md`
records the durable product truth the design serves.

## License

MIT. See LICENSE.

---

Built by Tri Cuong (Vinny) Dao.
