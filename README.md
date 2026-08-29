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
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public Supabase Auth credentials only. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` name is also accepted.

The website keeps a bundled read-only seed register for graceful fallback. Submission, extraction, proof upload, review and production data access go through `vaada-backend`.

Public browsing remains open. Google or email/password authentication is required for `/submit`, `/submit-proof`, `/account`, `/my-logs`, uploads and AI extraction. `/review` additionally requires a `reviewer` or `admin` profile role. Account preferences let a user self-describe as a citizen, government official or news reporter and choose a default public-credit setting; none of these settings grants reviewer permissions. “Keep my name private” controls public attribution only; the private account ID remains attached for ownership, abuse prevention and audit history. Public credit publishes the chosen display name only after reviewer acceptance.

Email/password signup is configured for immediate session creation. In Supabase Auth, keep **Allow new users to sign up** enabled and **Confirm Email** disabled. Supabase Auth—not the website database—hashes and stores passwords. Direct login/signup returns to `/`; protected actions preserve their complete `next` path through email login, signup and Google OAuth.

`/submit` records a new promise from a required source link or uploaded image/PDF and presents an editable AI draft before submission. `/submit-proof` records evidence that an existing promise was delivered. Completion-proof uploads do not receive AI interpretation in v1; link-only proof receives a conservative relevance screen and every proof remains queued for human review.

Never add the Supabase service role key, AI provider secrets or backend credentials to this frontend repository. Only browser-safe `NEXT_PUBLIC_` values belong in Vercel's frontend environment settings.

## Deploy on Vercel

1. Import `maheepatel/Vaada_frontend` in Vercel.
2. Keep the detected framework as **Next.js**.
3. Keep the standard build command `npm run build`.
4. Add the required environment variables from `.env.example` to the Production, Preview and Development environments.
5. Deploy again after saving the variables. Vercel does not add newly saved variables to an older deployment.

Vercel will create preview deployments for branches and a production deployment from `main`.

## Validation

```bash
npm run lint
npm test
```

Product requirements remain in [`docs/VAADA-MASTER-PRD.md`](docs/VAADA-MASTER-PRD.md).
