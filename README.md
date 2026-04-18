# TeamFlow

**TeamFlow** is a full-stack team productivity app where you can manage projects, track work with tickets, collaborate through comments, and visualize progress on a live Kanban board — all in a clean dark UI.

> Built with **React 19**, **Node.js / Express 5**, **MongoDB**, and **Tailwind CSS 4**

🔗 **Backend API** → `https://teamflow-lblj.onrender.com`

---

## What it does

TeamFlow gives teams a single place to:

- Organize work into **Projects**
- Break projects into **Tickets** with priority, status, and assignee
- Move tickets visually on a **Kanban Board** (drag & drop)
- Discuss work through **Comments** on each ticket
- Control access with **JWT authentication** — every route is protected

---

## Tech used

**Frontend**
- React 19 + Vite 8
- React Router DOM v7
- Tailwind CSS v4
- @dnd-kit/core — drag and drop
- react-hot-toast — notifications

**Backend**
- Node.js + Express 5
- MongoDB 
- bcryptjs — password hashing
- jsonwebtoken — auth tokens
- helmet + cors — security

---

## Folder layout

- **`server/`** — Express REST API
  - `middleware/auth.js` — JWT guard, attaches `req.user.id` to every protected request
  - `models/` — MongoDB schemas: **User**, **Project**, **Ticket**, **Comment**
  - `routes/` — Route handlers: **auth**, **projects**, **tickets**, **comments**
  - `index.js` — App entry point, middleware setup, MongoDB connection

- **`src/`** — React frontend
  - `api/` — Fetch wrappers for auth, projects, tickets, comments (all attach Bearer token)
  - `context/AuthContext.jsx` — Global auth state: `user`, `login()`, `logout()`
  - `components/` — Reusable UI: **Navbar**, **Sidebar**, **TicketCard**, **TicketForm**, **Spinner**
  - `pages/` — App screens: **Login**, **Register**, **Dashboard**, **ProjectView**, **KanbanBoard**, **TicketDetail**
  - `App.jsx` — All route definitions

- **`.env`** — `VITE_API_URL` for the frontend
- **`vercel.json`** — SPA rewrite rule so all routes serve `index.html`

---

## Run it locally

**1 — Clone**
```bash
git clone <repo-url>
cd Teamflow
```

**2 — Backend**
```bash
cd server
npm install
```

Add `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/teamflow
JWT_SECRET=any_secret_string
PORT=5000
CLIENT_URL=http://localhost:5173
```
```bash
npm run dev
```

**3 — Frontend**
```bash
cd ..
npm install
```

Add `.env`:
```
VITE_API_URL=http://localhost:5000
```
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## How auth works

```
POST /api/auth/login  →  bcrypt.compare  →  jwt.sign (7 days)
        ↓
{ token, user: { id, name, email } }  saved to localStorage
        ↓
Every request  →  Authorization: Bearer <token>
        ↓
server/middleware/auth.js  →  jwt.verify  →  req.user.id
```

---

## API routes

All routes below require `Authorization: Bearer <token>` except `/api/auth/*`

```
POST   /api/auth/register          { name, email, password }
POST   /api/auth/login             { email, password }

GET    /api/projects               all projects for current user
POST   /api/projects               create project
PUT    /api/projects/:id           update  (owner only)
DELETE /api/projects/:id           delete  (owner only)

GET    /api/tickets?projectId=     filter by projectId, status, priority, search
GET    /api/tickets/:id            single ticket (populated)
POST   /api/tickets                create ticket
PUT    /api/tickets/:id            update  (title/desc: creator only)
DELETE /api/tickets/:id            delete  (creator only)

GET    /api/comments/:ticketId     all comments on a ticket
POST   /api/comments/:ticketId     add comment  { text }
DELETE /api/comments/:id           delete own comment
```

---

## Data models

```
User        name · email · password(hashed)

Project     title · description · owner → User · members[] → User

Ticket      title · description
            priority  low | medium | high   (default: medium)
            status    todo | inprogress | done  (default: todo)
            projectId → Project
            assignee  → User
            createdBy → User

Comment     ticketId → Ticket · userId → User · text
```

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Sign in with email + password |
| `/register` | Register | Create a new account |
| `/dashboard` | Dashboard | All your projects — create & delete |
| `/projects/:id` | ProjectView | Tickets list — filter by status, priority, search |
| `/projects/:id/kanban` | KanbanBoard | Drag & drop tickets across 3 columns |
| `/projects/:id/tickets/:ticketId` | TicketDetail | Full ticket — edit, comment, manage |

---

## Kanban board

Drag & drop is powered by `@dnd-kit`. When a ticket is dropped into a new column:

1. UI updates **instantly** (optimistic update — no loading wait)
2. `PUT /api/tickets/:id` fires in the background
3. If the API call fails → UI reverts automatically

---

## Deploy

**Frontend → Vercel**
- Set env var: `VITE_API_URL=https://teamflow-lblj.onrender.com`
- `vercel.json` already handles SPA routing

**Backend → Render**
- Root dir: `server`
- Start: `node index.js`
- Set env vars: `MONGO_URI` `JWT_SECRET` `PORT` `CLIENT_URL`

---

## Scripts

```bash
# frontend
npm run dev        # dev server → localhost:5173
npm run build      # production build → dist/
npm run lint       # eslint

# backend
npm run dev        # nodemon (auto reload)
npm start          # node (production)
```
