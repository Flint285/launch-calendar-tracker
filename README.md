# Launch Calendar Tracker

A standalone web app to plan, execute, and track time-boxed product launches with task management, KPI tracking, and reporting.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Launch Plans**: Create and manage launch campaigns with date windows and strategy tags
- **Task System**: Daily checklists with priorities (must do / should do / optional), status tracking, and dependencies
- **Calendar View**: Visual overview of your launch with task counts and completion percentages
- **KPI Tracker**: Define metrics with targets, enter daily values, get red/yellow/green status indicators
- **Alerts**: Automatic alerts when KPIs fall outside targets, with resolution tracking
- **Reports**: Export launch summaries to CSV, view completion rates and KPI outcomes

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Express API
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT with HTTP-only cookies

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for local PostgreSQL)

## Quick Start

### 1. Clone and Install

```bash
cd "Launch Calendar Tracker"
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` if you want to change defaults:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/launch_tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run Database Migrations

```bash
pnpm db:push
```

### 5. Seed Default Data (Optional)

```bash
pnpm db:seed
```

This creates a default admin user: `admin@launchtracker.local` / `admin123`

### 6. Start Development Servers

```bash
pnpm dev
```

This starts:
- API server at http://localhost:3001
- Web app at http://localhost:5173

## Project Structure

```
launch-calendar-tracker/
├── packages/
│   ├── db/           # Drizzle schema, migrations, seed data
│   └── shared/       # Types, validation schemas, utilities
├── apps/
│   ├── api/          # Express backend
│   └── web/          # Vite React frontend
├── docker-compose.yml
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:api` | Start API server only |
| `pnpm dev:web` | Start web app only |
| `pnpm build` | Build all packages |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:seed` | Seed database with default data |
| `pnpm db:studio` | Open Drizzle Studio |

## Creating Your First Launch Plan

1. Open http://localhost:5173
2. Register a new account or login
3. Click "New Plan"
4. Select the "Feb 1-14, 2026 Launch Calendar" template
5. Set your plan name and dates
6. Click "Create Plan"

The template will auto-generate ~70 tasks across 14 days, plus default KPIs for:
- Email deliverability
- Funnel conversion
- Revenue
- Activation
- Ads performance

## Daily Workflow

1. **Morning**: Open today's checklist from the calendar view
2. **During the day**: Mark tasks complete as you finish them
3. **Evening**: Enter daily KPI values, review any alerts
4. **End of launch**: Generate report and review learnings

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project to Vercel
3. Set root directory to `apps/web`
4. Add environment variables

### Backend (Railway/Render)

1. Create a PostgreSQL database
2. Deploy the API from `apps/api`
3. Set `DATABASE_URL` and `JWT_SECRET` environment variables

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Login and receive JWT cookie |
| `/api/auth/logout` | POST | Clear auth cookie |
| `/api/auth/me` | GET | Get current user |
| `/api/plans` | GET/POST | List or create launch plans |
| `/api/plans/:id` | GET/PATCH/DELETE | Manage specific plan |
| `/api/plans/:id/tasks` | GET/POST | List or create tasks |
| `/api/plans/:id/kpis` | GET/POST | List or create KPIs |
| `/api/plans/:id/report` | GET | Generate launch report |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/launch_tracker` |
| `JWT_SECRET` | Secret for signing JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | API server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3001/api` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
