# RIF Website

NSRCEL-inspired institutional website clone for **Rohilkhand Incubation Foundation (RIF)**, implemented as a separated:

- `backend/` -> Node.js + Express API with CORS, env-based admin auth, MongoDB-backed CMS storage, and form submission endpoints
- `frontend/` -> Vite + React app with public pages plus an admin dashboard

## Deliverables covered

- Responsive homepage
- About page with image-gallery style module and documents
- Team page for board, advisory board, and core team
- Incubatees and mentors directories
- Services, membership plans, and RIF services pages
- News and events module
- Apply, membership, and incubitee forms
- Admin dashboard for managing all major content collections and submissions

## Project structure

```text
.
├── backend
│   ├── data/cms-data.json
│   └── src
├── frontend
│   └── src
└── package.json
```

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Make sure MongoDB is running locally, or replace `MONGODB_URI` with your MongoDB Atlas connection string.

4. Update backend admin seed credentials before using the dashboard in a real environment.

## Run

Start the backend:

```bash
npm run dev:backend
```

Start the frontend:

```bash
npm run dev:frontend
```

Build the frontend:

```bash
npm run build
```

Check backend syntax:

```bash
npm run check:backend
```

## Default local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
- Admin dashboard: `http://localhost:5173/admin`

## Admin notes

- Admin login is backed by the Express API.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `backend/.env` are used to seed the first admin user into MongoDB.
- Content updates persist to MongoDB.
- Public forms save submissions into MongoDB and are only accessible from admin routes.
- On the first successful MongoDB connection, the backend seeds the `site_content`, `submissions`, and `admin_users` collections.
# RIF
