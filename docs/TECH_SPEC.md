# Technical Specification - Truflux Technologies Website

Version: 1.1.0

## Architecture

- React + Vite frontend for website UI.
- FastAPI backend for config, lead capture and contact capture.
- JSON configuration file for easy content updates.
- SQLite database for localhost.
- Docker-based Railway deployment.

## Core Runtime Flow

1. React app loads in browser.
2. App calls `/api/config`.
3. FastAPI reads `backend/data/site_config.json`.
4. UI renders hero, services, solutions, whitepapers and contact sections.
5. Whitepaper forms submit to `/api/leads`.
6. Contact form submits to `/api/contact`.
7. Backend stores records in SQLite.

## Main Editable Content File

`backend/data/site_config.json`

## API Endpoints

- `GET /api/health`
- `GET /api/version`
- `GET /api/config`
- `POST /api/leads`
- `POST /api/contact`
- `GET /api/admin/leads`
- `GET /api/admin/contacts`

## Local Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Railway

Railway uses the root `Dockerfile`. The frontend is built first and copied into the backend static folder. FastAPI serves the built React app in production.
