# LAPD MDT — Daytona RP

MDT policier full-stack avec design sombre LAPD, gestion des citoyens/casiers/rapports/preuves/enquêtes et panel admin recrutement.

## Stack
- Frontend: React + Vite + Tailwind classes
- Backend: Node.js + Express + MongoDB (Mongoose) + Multer + JWT
- Auth: login matricule + base Discord OAuth URL endpoint

## Lancer localement

### 1) Backend
```bash
cd backend
npm install
npm run dev
```

### 2) Frontend
```bash
npm install
npm run dev
```

Le frontend attend l'API sur `http://localhost:4000` (modifiable via `VITE_API_BASE`).

## Docker Compose
```bash
cp .env.example .env
docker compose up --build
```

## Routes API incluses
- `GET /api/me`
- `GET /api/citizens`
- `POST /api/citizens`
- `POST /api/casiers`
- `GET /api/reports`
- `POST /api/reports`
- `POST /api/evidence/upload`
- `GET /api/enquetes`
- `POST /api/admin/create-officer`

## Compte bootstrap
Au premier lancement, un officier admin est créé :
- Matricule: `LAPD-001`
- Mot de passe: `changeme123`
