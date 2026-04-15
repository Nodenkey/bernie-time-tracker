# Bernie Time Tracker

Time tracking demo app for MCP Testing.

## Stack

- **Backend**: FastAPI (Python), in-memory store, exposed under `/api/time-entries`.
- **Frontend**: Plain HTML/CSS/JavaScript served as static files (no build step).

## Running locally

### 1. Backend (FastAPI)

From the `backend/` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with the time entries endpoints under `/api/time-entries`.

### 2. Frontend (static HTML)

You can open `frontend/index.html` directly in a browser for quick testing, but for API calls to work correctly with CORS and relative URLs it is recommended to serve it via a simple HTTP server.

From the repo root:

```bash
cd frontend
python -m http.server 3000
```

Then open `http://localhost:3000/frontend/index.html` in your browser.

The frontend JavaScript uses `http://localhost:8000` as the default API base URL for local development.

### 3. Docker Compose (backend + frontend)

From the repo root:

```bash
docker compose up --build
```

This will start:

- Backend on `http://localhost:8000`
- Frontend on `http://localhost:3000`

Open `http://localhost:3000/frontend/index.html` to use the app.

## Azure Boards mapping

This repo implements the Bernie time tracker for the MCP Testing project, sprint **"Bernie test sprint"**.

Frontend work in this branch covers:

- **#13109** – T2.2: Implement UI to list entries and apply filters
- **#13111** – T3.2: Implement UI controls for editing and deleting entries
- **#13113** – T4.2: Build responsive HTML/CSS layout and forms
