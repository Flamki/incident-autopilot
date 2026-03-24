# Incident Autopilot

Incident Autopilot is a React + TypeScript dashboard prototype for AI-assisted incident response workflows.

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS v4
- React Router
- Recharts
- React Three Fiber / Drei

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Build for production into `dist/`
- `npm run preview` - Preview production build locally
- `npm run lint` - Type-check the project (`tsc --noEmit`)
- `npm run clean` - Remove build output

## Environment Variables

No environment variables are currently required.

If we add API integration later, put client-safe variables in `.env` with a `VITE_` prefix (for example `VITE_API_BASE_URL=...`).

## Deploy To Vercel

This repo is configured for Vercel static deployment.

### Option 1: Vercel Dashboard

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Use the default settings (framework auto-detected as Vite).
4. Deploy.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

Then for production:

```bash
vercel --prod
```

## SPA Routing

`vercel.json` includes a rewrite rule so client-side routes like `/dashboard`, `/incidents`, and `/settings` resolve correctly on hard refresh.

## Public Repo Checklist

- [x] Template references removed
- [x] Cross-platform npm scripts
- [x] Build passes locally
- [x] Vercel config added
- [x] `.env` protected in `.gitignore`
- [x] MIT license included

## License

MIT. See [LICENSE](./LICENSE).