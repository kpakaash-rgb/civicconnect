# CivicConnect FastAPI Backend

A high-performance, asynchronous REST API for CivicConnect — the community issue reporting and municipal dispatch platform.

---

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **ORM / Database**: SQLAlchemy with PostgreSQL (`psycopg2-binary`)
- **Data Validation**: Pydantic v2 & Pydantic-Settings
- **Server**: Uvicorn ASGI Server
- **Environment**: python-dotenv

---

## Database Architecture

The backend manages three core relational tables:

1. **`users`**:
   - `id`: Integer primary key (autoincrement)
   - `name`: Citizen / Officer full name
   - `email`: Unique email identifier
   - `phone`: Contact telephone
   - `role`: Role enum (`citizen` or `authority`)
   - `ward`: Local municipal ward (e.g. `Ward 104`)
   - `created_at`: Registration timestamp

2. **`issues`**:
   - `id`: String identifier (e.g. `CC-1042`, `CC-1054`)
   - `title`: Short issue summary
   - `category`: Category (`Potholes`, `Sanitation`, `Streetlights`, `Drainage`, `Water`, etc.)
   - `description`: Detailed citizen report text
   - `status`: Workflow status (`Reported`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Citizen Verified`)
   - `priority`: Urgency level (`Low`, `Medium`, `High`)
   - `location`: Street/landmark address
   - `zone`: Zonal municipal jurisdiction
   - `ward`: Municipal ward
   - `image`: Base64 or URL visual evidence
   - `assigned_to`: Field unit assigned (e.g. `Zone 4 Road Maintenance Unit`)
   - `reporter_id`: Foreign key reference to `users.id`
   - `created_at`, `updated_at`: Timestamps

3. **`issue_updates`**:
   - `id`: Integer primary key
   - `issue_id`: Foreign key reference to `issues.id`
   - `status`: Status advanced to
   - `remarks`: Official field or administrative remarks
   - `updated_by`: Authority officer/unit
   - `created_at`: Timestamp of status transition

4. **`evidence`**:
   - `id`: Integer primary key (autoincrement)
   - `issue_id`: Foreign key reference to `issues.id` (CASCADE)
   - `filename`: Image filename
   - `content_type`: Image MIME type (`image/jpeg`, `image/png`, `image/webp`)
   - `ai_generated_probability`: Float score (0.0 to 1.0)
   - `risk_level`: Advisory risk (`low`, `medium`, `high`, `unavailable`)
   - `status`: Verification status (`checked`, `unavailable`)
   - `provider`: Detection provider (`hive`)
   - `message`: Review message/finding
   - `checked_at`: Timestamp of verification
   - `created_at`: Timestamp of record creation

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `sqlite:///./civicconnect.db` |
| `FRONTEND_URL` | Deployed Frontend URL (Vercel or localhost) | `http://localhost:5173` |
| `HIVE_API_KEY` | Hive AI Deepfake/Synthetic Media Detection API Key | _Optional (empty for graceful fallback)_ |
| `HIVE_API_URL` | Hive AI Task Sync Endpoint | `https://api.thehive.ai/api/v2/task/sync` |

> **PostgreSQL Configuration Note**:
> For local PostgreSQL:
> ```env
> DATABASE_URL=postgresql://postgres:your_password@localhost:5432/civicconnect
> ```
> If PostgreSQL is not installed locally, SQLite fallback is supported out-of-the-box:
> ```env
> DATABASE_URL=sqlite:///./civicconnect.db
> ```

---

## Installation & Running

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

## API Endpoints

### Health
- `GET /api/health` — Verifies API service health

### Authentication
- `POST /api/auth/login` — Simple demo login returning citizen or authority user record

### Civic Issues
- `POST /api/issues` — Submit a citizen report (auto-generates `CC-xxxx` ID, status `Reported`)
- `GET /api/issues` — List all issues (supports `status`, `priority`, `category`, `ward`, `search`)
- `GET /api/issues/{issue_id}` — Get single issue with full timeline and updates history
- `PUT /api/issues/{issue_id}/status` — Authority updates status and adds field remarks
- `GET /api/users/{user_id}/issues` — List all issues submitted by a given citizen

### AI Evidence Review
- `POST /api/evidence/check` — Upload image file (`multipart/form-data`) for AI synthetic media detection (JPEG, PNG, WebP)

---

## Testing

Run health check:
```bash
curl http://localhost:8000/api/health
```
