# DevNotes API

Production-ready REST API for managing notes with tagging and search. Built with Node.js, Express, TypeScript, and Prisma ORM, fully containerized with Docker.

## Tech Stack

| Layer         | Technology                 |
| ------------- | -------------------------- |
| Runtime       | Node.js 20                 |
| Framework     | Express 5                  |
| Language      | TypeScript (strict)        |
| ORM           | Prisma 7                   |
| Database      | PostgreSQL 15              |
| Container     | Docker (multi-stage)       |
| Orchestration | Docker Compose             |
| Linting       | ESLint + typescript-eslint |

## API Endpoints

### Health

| Method | Endpoint  | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/health` | Health check + DB status |

### Notes

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/notes`              | Create a note            |
| GET    | `/notes`              | List all notes (with tags) |
| GET    | `/notes?tag=docker`   | Filter notes by tag      |
| GET    | `/notes?search=text`  | Search title and content |
| GET    | `/notes/:id`          | Get a single note        |
| DELETE | `/notes/:id`          | Delete a note            |
| PATCH  | `/notes/:id/favorite` | Toggle favorite status   |
| POST   | `/notes/:id/tags`     | Add a tag to a note      |

### Request/Response Examples

**Create note:**

```bash
curl -X POST http://localhost:5000/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Docker Guide", "content": "How to containerize apps"}'
```

**Add tag:**

```bash
curl -X POST http://localhost:5000/notes/<id>/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "docker"}'
```

**Filter by tag:**

```bash
curl http://localhost:5000/notes?tag=docker
```

**Search:**

```bash
curl http://localhost:5000/notes?search=containerize
```

## Project Structure

```
src/
  server.ts                 # Entry point, graceful shutdown
  app.ts                    # Express app setup
  config/
    index.ts                # Env validation + config
    db.ts                   # Prisma client (pg adapter)
  routes/
    index.ts                # Route aggregator
    health.routes.ts        # GET /health
    note.routes.ts          # Notes CRUD + tags
  controllers/
    health.controller.ts    # Health handler
    note.controller.ts      # Notes request handlers
  services/
    note.service.ts         # Business logic + Prisma queries
  middleware/
    asyncHandler.ts         # Async error wrapper
    error.middleware.ts      # 404 + global error handler
    logger.middleware.ts     # Request logger
    validate.middleware.ts   # Input validation
prisma/
  schema.prisma             # Database schema (Note, Tag)
  migrations/               # Migration history
```

## Setup

### Prerequisites

- Node.js >= 20
- Docker and Docker Compose

### Docker Setup (Recommended)

```bash
# Start the full stack
docker compose up --build

# Run database migrations
docker compose exec app npx prisma migrate dev

# Stop
docker compose down

# Stop and remove data
docker compose down -v
```

The API will be available at `http://localhost:5000`.

### Local Development Setup

```bash
# Install dependencies
npm install

# Create .env file with required variables
# PORT=5000
# DATABASE_URL=postgresql://postgres:password@localhost:5432/devnotes

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start dev server with hot reload
npm run dev
```

## Scripts

| Script                      | Description                |
| --------------------------- | -------------------------- |
| `npm run dev`               | Dev server with hot reload |
| `npm run build`             | Compile TypeScript to dist |
| `npm start`                 | Run compiled app           |
| `npm run start:prod`        | Run in production mode     |
| `npm run lint`              | Lint source files          |
| `npm run prisma:migrate`    | Run database migrations    |
| `npm run prisma:generate`   | Generate Prisma client     |

## Environment Variables

| Variable       | Required | Default     | Description               |
| -------------- | -------- | ----------- | ------------------------- |
| `PORT`         | Yes      | 5000        | Server port               |
| `DATABASE_URL` | Yes      | -           | PostgreSQL connection URL |
| `NODE_ENV`     | No       | development | Environment mode          |

## Database Schema

```
Note                            Tag
+------------+----------+      +------+----------+
| id         | uuid  PK |      | id   | uuid  PK |
| title      | string   | M:N  | name | string   |
| content    | string   |<---->|      | unique   |
| isFavorite | boolean  |      +------+----------+
| createdAt  | datetime |
+------------+----------+
```

## Monitoring & Observability

The stack includes Prometheus and Grafana for monitoring and observability.

- **Prometheus** scrapes the `/metrics` endpoint from the Node API every 5 seconds, collecting HTTP request durations, status codes, and default Node.js runtime metrics.
- **Grafana** connects to Prometheus as a data source and provides dashboards for visualizing application performance and health.

| Service    | URL                      | Notes             |
| ---------- | ------------------------ | ----------------- |
| API        | http://localhost:5000    | Node.js REST API  |
| Prometheus | http://localhost:9090    | Metrics explorer  |
| Grafana    | http://localhost:3001    | Login: admin/admin |

## License

ISC
