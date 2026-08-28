# Vaada Website

The public, responsive Next.js website for Vaada. The native mobile app and backend are maintained as separate projects so they can be deployed independently while sharing the same production API.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure:

- `VAADA_API_URL`: private/server URL for the standalone backend.
- `NEXT_PUBLIC_VAADA_API_URL`: browser-accessible backend URL used by forms and reviewer tools.
- `NEXT_PUBLIC_VAADA_APP_URL`: external Expo/App Store/Play Store app URL.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase Auth credentials only.

The website keeps a bundled read-only seed register for graceful fallback. Submission, extraction, proof upload, review and production data access go through `vaada-backend`.

Public browsing remains open. Google or email/password authentication is required for `/submit`, `/my-logs`, uploads and AI extraction. `/review` additionally requires a `reviewer` or `admin` profile role. “Keep my name private” controls public attribution only; the private account ID remains attached for ownership, abuse prevention and audit history. “Credit this record to me” publishes the chosen name only after reviewer acceptance.

Never add the Supabase service role key, AI provider secrets or backend credentials to this frontend repository. Only browser-safe `NEXT_PUBLIC_` values belong in Vercel's frontend environment settings.

## Deploy on Vercel

1. Import `maheepatel/Vaada_frontend` in Vercel.
2. Keep the detected framework as **Next.js**.
3. Keep the standard build command `npm run build`.
4. Add the required environment variables from `.env.example`.
5. Deploy.

Vercel will create preview deployments for branches and a production deployment from `main`.

## Validation

```bash
npm run lint
npm test
```

Product requirements remain in [`docs/VAADA-MASTER-PRD.md`](docs/VAADA-MASTER-PRD.md).
