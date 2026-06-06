# Chronicle Todo Frontend

A polished Next.js + TypeScript frontend for a journal-style todo app, based on the uploaded Chronicle mockup.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Rust Backend Hook

The UI works offline with `localStorage` by default. When your Rust backend is ready, set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Expected endpoints:

- `GET /days` returns `{ days: Record<string, DayRecord> }`
- `PUT /days/:dateKey` accepts a `DayRecord`

Types live in `lib/types.ts`, and the fetch adapter is in `lib/api.ts`.
