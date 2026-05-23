# Truflux Technologies Settingsurable Website

Version: **1.1.7**

This package contains a settings-managed corporate website based on the BRD and technical specification for Truflux Technologies.

## Tech Stack

- Frontend: React + Vite
- Backend: Python FastAPI
- Database: SQLite locally, PostgreSQL-ready later
- Deployment: Railway-ready using Docker

---

## Folder Structure

```text
backend/      FastAPI backend and JSON site settings
frontend/     React website
scripts/      Windows helper scripts
Dockerfile    Railway production build
railway.json  Railway deployment config
VERSION       Release version
```

---

## Run Locally on Windows

### 1. Backend

Open Command Prompt:

```bat
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at:

```text
http://localhost:8000
```

### 2. Frontend

Open another Command Prompt:

```bat
cd frontend
npm install
npm run dev
```

Website runs at:

```text
http://localhost:5173
```

---

## One-click Windows Scripts

From the project root:

```bat
scripts\start-backend.bat
scripts\start-frontend.bat
```

Run each script in a separate Command Prompt window.

---

## Edit Website Content

Most website text can be changed here:

```text
backend/data/site_config.json
```

Restart backend after editing this file.

---

## Railway Deployment

1. Push this folder to GitHub.
2. Create a Railway project.
3. Connect the GitHub repository.
4. Railway will use the included Dockerfile.
5. Optional environment variables:

```env
APP_VERSION=1.1.7
DATABASE_URL=sqlite:///./truflux.db
CORS_ORIGINS=https://your-railway-domain.up.railway.app
```

---

## Important APIs

```text
GET  /api/health
GET  /api/version
GET  /api/config
POST /api/contact
POST /api/leads
GET  /api/admin/leads
GET  /api/admin/contacts
```

## Logo settings

Logo files are stored here:

```text
frontend/public/assets/truflux-logo.svg
frontend/public/assets/truflux-logo-mark.svg
```

To change the logo, replace the SVG files or update these fields in:

```text
backend/data/site_config.json
```

```json
"logoUrl": "/assets/truflux-logo.svg",
"logoMarkUrl": "/assets/truflux-logo-mark.svg"
```


## Protected Admin Settings Screen

The settings screen is not shown in the public scrollable website. Open it directly at:

```text
http://localhost:5173/config
```

Default local login:

```text
Username: admin
Password: ChangeMe@123
```

For Railway or production, change these environment variables before deployment:

```env
ADMIN_USERNAME=your_admin_user
ADMIN_PASSWORD=your_secure_password
ADMIN_SECRET=use-a-long-random-secret
```

From this screen you can:
- Switch sections on/off using checkboxes
- Change the dark blue theme colors
- Upload a logo
- Change hero, brand, contact, vision and mission text
- Edit Services Offered, Values and Whitepapers

Changes are saved to:

```text
backend/data/site_config.json
```
