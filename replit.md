# PitchVision - Football Player Video Analysis System

## Overview

PitchVision is a full-stack web application for football (soccer) player video analysis. Users upload match video footage, and the system processes it to track a selected player, generating performance metrics like distance covered, speed, ball touches, shots, key passes, movement heatmaps, and AI-powered performance summaries. The frontend provides a dashboard for managing video uploads and viewing detailed analysis results with charts and visualizations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router) with two main pages:
  - `/` — Dashboard (list uploads, trigger new analysis)
  - `/analysis/:id` — Detailed analysis view for a specific video
- **State Management**: TanStack React Query for server state, with automatic polling every 3 seconds while video status is `pending` or `processing`
- **UI Components**: Shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS and CSS variables for theming
- **Styling**: Dark sporty theme with neon emerald/green accents. Uses `DM Sans` as the body font and `Outfit` as the display font. Glassmorphism effects via custom CSS classes
- **Charts**: Recharts for radar charts and bar charts showing player performance
- **Animations**: Framer Motion for page transitions and UI animations
- **File Upload**: Uses multipart/form-data with fields `video` (file) and optionally `playerColor` (text)

### Backend
- **Runtime**: Node.js with Express, written in TypeScript and run via `tsx`
- **API Pattern**: RESTful JSON API under `/api/` prefix. Routes defined in `server/routes.ts` with a shared contract in `shared/routes.ts`
- **File Uploads**: Multer middleware handling video uploads up to 500MB, stored in `uploads/` directory
- **Video Processing**: Spawns child processes (via `child_process.spawn`) — designed to call a Python-based video analysis pipeline using YOLOv8, OpenCV, and tracking algorithms (DeepSORT/ByteTrack)
- **Static Files**: Heatmap images served from `static/heatmaps/` directory
- **Dev Server**: Vite dev server middleware with HMR in development; static file serving from `dist/public` in production
- **Build**: Custom build script using Vite for client and esbuild for server, outputting to `dist/`

### Database
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod validation
- **Schema** (in `shared/schema.ts`):
  - `videos` table: stores upload metadata, processing status, and analysis results (distance, speed, ball touches, shots, passes, performance rating, strengths/weaknesses text, heatmap URL, trajectory JSON)
  - `conversations` and `messages` tables (in `shared/models/chat.ts`): for AI chat integration features
- **Migrations**: Managed via `drizzle-kit push` (`npm run db:push`)
- **Storage Layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class for CRUD operations

### Key API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get single video with results |
| POST | `/api/videos` | Upload video (multipart/form-data) |
| DELETE | `/api/videos/:id` | Delete a video |

### Shared Code
- `shared/schema.ts` — Database schema and Zod types used by both client and server
- `shared/routes.ts` — API contract definitions with Zod response schemas
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Replit Integrations
The project includes pre-built Replit integration modules in `server/replit_integrations/` and `client/replit_integrations/`:
- **Chat**: OpenAI-powered conversation system with DB-backed storage
- **Audio**: Voice recording, streaming playback, and speech-to-text via AudioWorklet
- **Image**: Image generation via `gpt-image-1`
- **Batch**: Rate-limited batch processing utility with retries

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **OpenAI API**: Used through Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` env vars) for chat, voice, and image features
- **Python Analysis Pipeline** (planned/partial): The system is designed to spawn a Python subprocess for video analysis using YOLOv8/ultralytics, OpenCV, DeepSORT/ByteTrack. This Python component processes uploaded videos and writes results back
- **Key npm packages**: `drizzle-orm`, `express`, `multer`, `@tanstack/react-query`, `wouter`, `recharts`, `framer-motion`, `react-dropzone`, `date-fns`, `zod`
- **Fonts**: Google Fonts (DM Sans, Outfit) loaded via CSS import