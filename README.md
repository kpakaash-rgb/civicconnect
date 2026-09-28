# CivicConnect

> **See it. Report it. Fix it.**

CivicConnect is a civic issue reporting and resolution platform that allows citizens to report local problems — potholes, broken streetlights, blocked drains, water leaks, garbage accumulation, and damaged public infrastructure — and track them through to resolution.

---

## Project Structure

```
civicconnect/
├── frontend/          # React + Vite citizen-side application
│   ├── public/        # Static assets
│   ├── src/
│   │   ├── assets/    # Images, icons, static media
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # React context (global state)
│   │   ├── data/      # Mock data layer (swap with API later)
│   │   ├── layouts/   # Page layout wrappers
│   │   ├── pages/     # Route-level page components
│   │   ├── services/  # API service layer (future)
│   │   ├── utils/     # Utility functions (future)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── postcss.config.js
│
├── backend/           # API server (future – Node/Express or Supabase)
├── docs/              # Project documentation
├── .gitignore
└── README.md
```

---

## Citizen-Side Routes

| Route | Screen |
|---|---|
| `/` | Home |
| `/explore` | Explore Issues |
| `/report` | Report an Issue |
| `/issues/:id` | Issue Details / Track Report |
| `/my-reports` | My Reports |
| `/activity` | Activity |

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Icons | Lucide React |
| State | React Context API |
| Backend | _Planned – Supabase / Node.js_ |
| Database | _Planned – PostgreSQL / Supabase_ |

---

## Roadmap

- [x] Citizen-side UI (6 screens)
- [ ] Supabase backend integration
- [ ] Real image upload (Supabase Storage)
- [ ] Authority Dashboard
- [ ] Push notifications
- [ ] Real map integration (Google Maps / Leaflet)
