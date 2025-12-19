# VISTA - AI Performance Tracking System

## Architecture Overview

**Three-tier system**: Desktop app (Electron) → Backend API (Express/PostgreSQL) → Web dashboard (React)

### Core Flow
1. **Desktop app** captures webcam feed, detects activities via MediaPipe Holistic
2. Sends 10-min activity batches (`typing`, `writing`, `reading`, `phone`, `gesturing`, `looking_away`, `idle`)
3. **Backend** processes batches, calculates scores using `ActivityBasedScoring` algorithm
4. **Web dashboard** displays analytics for admin/organization/employee roles

### Key Components
- `desktop-app/`: Electron app with React (activity tracking, CV models)
- `backend/`: Express API with JWT auth, PostgreSQL, activity scoring engine
- `frontend/`: React web app with TailwindCSS (dashboards, analytics)

## Development Workflows

### Start Development Servers
```bash
# Backend (port 3000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev

# Desktop App (port 5173 + Electron)
cd desktop-app && npm run electron:dev
```

### Database Setup
```bash
cd backend
# Configure .env with DATABASE_URL (PostgreSQL)
# Tables auto-create on first run via config/initDb.js
npm start
```

### Build Desktop App
```bash
cd desktop-app
npm run build          # Vite build
npm run electron:build # Package with electron-builder
```

## Critical Patterns

### Activity Tracking (Desktop App)
**File**: `desktop-app/src/hooks/useActivityTracking.js`
- Accumulates activity times in 10-min intervals
- Maps activities: `'Typing'` → `'typing'`, `'Sitting'` → `'idle'`
- Normalizes total to ≤600s before API submission
- Auto-sends batch every 10 mins via `activityAPI.ingestActivityBatch()`

**Integration**: `useHolistic` hook detects activities → `useActivityTracking` aggregates → sends to backend

### Scoring Algorithm
**File**: `backend/utils/activityBasedScoring.js`
- **Productivity Score**: `(working_time / total_time) * 100 - (idle_time_ratio * 20)`
- **Engagement Score**: `100 - (distracted_time_ratio * 35) + (consistency_bonus if working > 60%)`
- **Overall**: `productivity * 0.55 + engagement * 0.45`
- **Grade**: A (90+), B (80-89), C (70-79), D (60-69), F (<60)

Categories:
- `working`: typing, writing, reading
- `distracted`: phone, gesturing, looking_away
- `idle`: idle time

### Authentication & Authorization
**Backend**: JWT tokens, role-based middleware (`verifyToken`, `requireAdmin`, `requireOrganization`, `requireEmployee`)
**Frontend/Desktop**: `AuthContext` stores token + user in `localStorage`, axios interceptor adds `Authorization: Bearer <token>`

### Three-Role System
1. **Admin**: Creates organizations, system-wide view
2. **Organization**: Manages employees, views team analytics
3. **Employee**: Views personal performance, desktop app login

## Database Schema

**Key Tables**:
- `admins`, `organizations`, `employees` (auth hierarchy)
- `raw_activity_intervals` (10-min batches from desktop app)
- `calculated_scores` (derived metrics: productivity, engagement, overall, grade)

**Relationships**: `organizations` ← `employees` ← `raw_activity_intervals` / `calculated_scores`

## Common Tasks

### Adding New Activity Type
1. Update `ACTIVITY_CATEGORIES` in `backend/utils/activityBasedScoring.js`
2. Add field to `raw_activity_intervals` table schema (`backend/config/initDb.js`)
3. Update desktop app activity mapper (`useActivityTracking.js`)
4. Adjust scoring weights if needed

### Creating New Role-Based Route
```javascript
// backend/routes/example.js
router.get('/data', verifyToken, requireEmployee, controller.getData);
```
Middleware stack: `verifyToken` → role check → controller

### Desktop App Activity Detection
**File**: `desktop-app/src/hooks/useHolistic.js`
- Initializes MediaPipe Holistic + Camera
- Detects hand gestures, body pose, face landmarks (468 face points)
- Calls `onActivityChange(activityName)` on detection
- Uses enhanced heuristics for phone detection (hand orientation + visual analysis)

## Dependencies & External Services

### AI Models (Desktop App)
- **MediaPipe Holistic** (0.5.x): Hand/body/face tracking (WASM files loaded from CDN)
  - 33 pose landmarks
  - 21 hand landmarks per hand
  - 468 face landmarks
- **Enhanced phone detection**: Visual heuristics analyzing dark rectangles near face

### Email Service (Backend)
- Nodemailer sends credentials to new organizations/employees
- Configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` in `.env`

### Database
- PostgreSQL (NeonDB recommended for production)
- Connection pooling via `pg` package
- Migrations handled by `initDb.js` (manual schema updates)

## Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email>
EMAIL_PASS=<app-password>
```

**Desktop App**: API base URL in `services/api.js` (default: `http://localhost:3000`)

## Naming Conventions

- **Snake_case**: Database columns, API payloads (`interval_start`, `organization_id`)
- **camelCase**: JavaScript variables, React components
- **Kebab-case**: File paths for multi-word components (`useActivityTracking.js`)
- **Route paths**: `/api/activity/ingest-batch`

## Testing & Debugging

### Backend Logs
- Morgan logs all HTTP requests in dev mode
- Activity ingestion logs in `activityController.js` (search for `📥`, `👤`, `✅`, `❌`)

### Desktop App Debugging
- Electron DevTools (View → Toggle Developer Tools)
- Console logs in `useHolistic.js` / `useActivityTracking.js` for activity tracking
- Check `isInitialized` state for MediaPipe status

### Common Issues
- **401 Unauthorized**: Check JWT token in localStorage, verify role matches route requirement
- **Activity batch rejected**: Ensure total time ≤600s (auto-normalized in `useActivityTracking`)
- **MediaPipe fails**: Check CDN connection, verify scripts loaded in `index.html`
- **Database errors**: Verify PostgreSQL connection, check `initDb.js` ran successfully
