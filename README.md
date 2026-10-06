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

## AI-Assisted Evidence Review

CivicConnect includes an optional AI-assisted image evidence checker powered by an external AI detection provider (such as Hive AI).

- **How it works**: When a citizen attaches a photo to a report, the backend can analyze the visual evidence for synthetic or AI-generated manipulation indicators.
- **Probabilistic & Advisory**: The system returns an AI-generated probability score and advisory risk classification (`Low`, `Medium`, `High`, or `Unavailable`). It does not declare definitive proof of authenticity.
- **Authority Discretion**: The AI review is purely advisory to assist municipal personnel. Authorities make all final decisions regarding report triage and verification.
- **Security & Privacy**: The external AI API key (`HIVE_API_KEY`) is stored strictly on the backend in `backend/.env` and is never exposed to the browser or frontend bundle.
- **Graceful Degradation**: If the API key is unconfigured, the provider is offline, or a network timeout occurs, reports can still be submitted smoothly. The system displays a clear "AI evidence verification unavailable" state without fabricating fake detection results.

### Environment Configuration
In `backend/.env`:
```env
HIVE_API_KEY=your_hive_api_key_here
HIVE_API_URL=https://api.thehive.ai/api/v2/task/sync
```

---

## Roadmap

- [x] Citizen-side UI (6 screens)
- [x] FastAPI + SQLite / PostgreSQL backend integration
- [x] Authority Dashboard with workflow status updates
- [x] AI-Assisted Evidence Review with Hive AI integration & graceful fallback
- [ ] Push notifications
- [ ] Real map integration (Google Maps / Leaflet)
