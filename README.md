# Crop Recommendation System (ML)

Production-style monorepo for a **full-stack agronomy assistant**: React + Express + Flask + MongoDB + Scikit-learn (Random Forest). Built to showcase JWT auth, glassmorphism UI, Chart.js analytics, and ML microservice orchestration suitable for portfolios, internships, or capstone demos.

```
crop-recommendation-system/
├── frontend/     # React 18 · Vite · Tailwind · Chart.js
├── backend/      # Node 18+ · Express · Mongoose · JWT · bcrypt hashing
├── ml-service/   # Flask · Scikit-learn · pickle persistence
├── docs/
│   └── API.md    # Exhaustive REST + ML docs
└── README.md     # Setup + deployment (this file)
```

## Highlights

| Layer      | Choices |
|-----------|---------|
| Frontend  | Vite-powered React SPA, Tailwind glassmorphism, mobile-first layout with sidebar drawer, Chart.js dashboards, toast feedback, JWT storage, animated cards (Framer Motion) |
| Backend   | Modular controllers/routes, MongoDB timestamps, Axios bridge to Flask, hardened headers with Helmet, express-validator parity with UI |
| ML        | Random Forest classifier pickled after training pipeline with stratified splits + reproducible synthetic fallback dataset |
| DevOps ready | `.env.example` per package, Render + Vercel + Atlas guidance |

> **Dataset note**: Drop the public Kaggle *Crop Recommendation* CSV into `ml-service/data/Crop_recommendation.csv` **or** run `train_model.py` without the file—the script synthesizes scientifically inspired ranges.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.10 (3.12–3.14 recommended for wheel builds; see `ml-service/requirements.txt`) |
| MongoDB Atlas or local Mongo | optional cluster URI |

Install dependencies:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ../ml-service && python -m venv .venv
```

Activate the Python virtual environment *(Windows PowerShell)*:

```powershell
cd ml-service
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Train the Random Forest *(step-by-step)*

> These steps intentionally mirror methodology sections you can cite in reports or interviews.

1. **Collect features** — agronomic CSV with columns  
   `N, P, K, temperature, humidity, ph, rainfall, label`.
2. **Place or generate data** — copy your CSV into `ml-service/data/Crop_recommendation.csv` *(optional)* or let the trainer synthesize rows per crop (see `CROP_PROFILES` in `train_model.py`).
3. **Split stratified** — `train_test_split(..., stratify=y)` preserves rare crop proportions.
4. **Fit ensemble** — `RandomForestClassifier` with balanced subsampling guards against dominance of frequent labels.
5. **Evaluate** — hold-out accuracy + optional `classification_report` printed during training for explainability screenshots.
6. **Serialize** — `pickle.dump({"model", "features"})` bundles metadata co-located with the estimator for Flask loaders.

Execute:

```bash
cd ml-service
python train_model.py
python app.py           # DEV server on :5000 (after model exists)
```

`GET http://localhost:5000/health` should return `{ "status": "ok" }`.

## Backend API

```bash
cd backend
copy .env.example .env      # PowerShell equivalent of cp — edit Atlas URI & secrets
npm run dev                # NODE --watch reloads Express on file changes (Node 18+)
```

Expose these variables (**see `backend/.env.example`**):

| Key | Meaning |
|-----|---------|
| `MONGODB_URI` | Atlas SRV URI with DB name (`crop_recommendation` recommended). |
| `JWT_SECRET` | Long random ASCII string (`openssl rand -hex 48`). |
| `ML_SERVICE_URL` | Flask base (default `http://localhost:5000`). |
| `CORS_ORIGIN` | Frontend origins, comma-separated. |

Full REST surface documented in **[docs/API.md](docs/API.md)**.

### MongoDB schemas (conceptual)

- **User**: `{ name, email (unique), password (bcrypt hash), createdAt }`
- **Prediction**: `{ user ref, inputs{...features}, predictedCrop, confidence|null, timestamps }`

Mongoose models live in `backend/src/models/`.

## Frontend

```powershell
cd frontend
copy .env.example .env
```

Set **`VITE_API_URL=http://localhost:4000/api`** (already the example default).

```bash
npm run dev           # SPA on http://localhost:5173
npm run build         # Ships static assets to dist/
npm run preview       # QA the production bundle locally
```

### Feature checklist

| Requirement | Implementation |
|-------------|----------------|
| Auth | `/login`, `/register`, JWT Bearer via Axios interceptor |
| Dashboard | Sidebar, summary cards + Chart.js line trend |
| Predict | Validated numeric form + Flask integration + animated result card |
| History | Filters (search/date/crop) + Atlas-backed paging |
| Analytics | Bar chart (top crops) + doughnut (7-day pulses) |
| UX | Glassmorphism, agriculture palette, hover micro-interactions, dark mode persistence |
| Toasts | `react-hot-toast` centralized in `main.jsx` |
| Responsive | Drawer sidebar + stacking grids |

## Environment variables cheatsheet

| Package | File | Critical keys |
|---------|------|---------------|
| `frontend` | `.env.example` | `VITE_API_URL` |
| `backend` | `.env.example` | `MONGODB_URI`, `JWT_SECRET`, `ML_SERVICE_URL`, `CORS_ORIGIN`, `PORT` |
| `ml-service` | `.env.example` | `FLASK_PORT`, `FLASK_ENV`, `CORS_ORIGINS` |

**Never commit real secrets** — rely on Atlas + Render/Vercel secret stores.

## Deployment blueprint

### MongoDB Atlas

1. Create M0 cluster + database user least privilege.
2. Network Access → allow Render/Vercel outbound IPs (**0.0.0.0/0 for demo only** tighten later).
3. Copy connection string (`mongodb+srv://...`), append DB name `/crop_recommendation`.

### Backend on Render (`backend/`)

Sample blueprint: `backend/render.yaml`.

- Root directory: **`backend`**
- Build command: **`npm install`**
- Start command: **`npm start`**
- Set env vars mirroring `.env.example` + **production** URLs.

Provision the ML service similarly using `ml-service/render.yaml` (train step runs at build).

### Frontend on Vercel (`frontend/`)

1. Framework preset → **Vite**.
2. Set `VITE_API_URL=https://YOUR-RENDER-API.onrender.com/api`.
3. Add rewrite from `/(.*)` to `/index.html` (already bundled in **`frontend/vercel.json`**).

### Flask ML caution

Heavy cold starts on Render free-tier — optionally upgrade instance or migrate model to ONNX for Node inference.

## Troubleshooting quick hits

| Symptom | Fix |
|---------|-----|
| `503` `/health` (Flask) | Run `python train_model.py`; confirm `models/crop_model.pkl` exists. |
| `502` `/api/predictions` | Flask down / wrong `ML_SERVICE_URL` / Atlas IP whitelist. |
| CORS rejection | Extend `CORS_ORIGIN` (backend) and `CORS_ORIGINS` (Flask). |
| JWT invalid | Rotate `JWT_SECRET` only after logging users out locally. |

## Academic / interview talking points

- **Security**: bcrypt cost factor (12 rounds), JWT expirations, Helmet middleware, sanitized validation on both tiers.
- **ML integrity**: pickled bundle stores canonical feature ordering to prevent train/serve skew.
- **Scalability path**: Kafka queue for predicts, ONNX runtime in Node to eliminate Python hop, caching layer per user aggregates.

Happy shipping!
