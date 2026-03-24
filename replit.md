# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains an Express API server that also runs a Telegram sales bot with AI-powered lead qualification, objection handling, and follow-up automation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Telegram bot**: node-telegram-bot-api (polling mode)
- **AI**: OpenAI via Replit AI Integrations (gpt-5-mini)
- **Scheduler**: node-cron (follow-up automation)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server + Telegram bot
│       └── src/bot/        # All bot logic
│           ├── index.ts        # Bot initialization
│           ├── handlers.ts     # Message handling & conversation flow
│           ├── messages.ts     # All message templates
│           ├── ai.ts           # OpenAI integration (objection handling, qualification)
│           ├── leadService.ts  # Database operations for leads
│           └── scheduler.ts    # Automated follow-up cron jobs
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   │   └── src/schema/
│   │       └── leads.ts    # Leads + conversation_messages tables
│   └── integrations-openai-ai-server/  # OpenAI client utilities
```

## Telegram Bot Flow

1. **Greeting** → Ask for name
2. **Qualification** (4 questions: income goal, time available, decision maker, urgency)
3. **AI Qualification Scoring** → Score 0-100, classify Hot/Warm/Cold
4. **Presentation** → Send full business presentation
5. **AI Objection Handling** → OpenAI handles any questions/pushback
6. **Hot Lead Flow** → Notify admin immediately via Telegram
7. **Warm Lead Flow** → 3 automated follow-ups over 3 days
8. **Cold Lead Flow** → Politely close out

## Environment Variables / Secrets Required

- `TELEGRAM_BOT_TOKEN` — From @BotFather
- `TELEGRAM_ADMIN_ID` — Your Telegram user ID (receives hot lead notifications)
- `DATABASE_URL` — Auto-provisioned by Replit
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-provisioned by Replit AI Integration
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-provisioned by Replit AI Integration

## Database Tables

- `leads` — Tracks every prospect (stage, score, temperature, qualification answers)
- `conversation_messages` — Full conversation history per user

## Lead Temperature

- **Hot** (70-100 score): Notified to admin immediately
- **Warm** (40-69 score): Gets 3 follow-up messages over 3 days
- **Cold** (0-39 score): Closed out politely

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Bot logic lives in `src/bot/`. Routes in `src/routes/`.

- Entry: `src/index.ts` — reads `PORT`, starts Express, initializes bot
- Bot entry: `src/bot/index.ts` — starts polling, scheduler
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle
