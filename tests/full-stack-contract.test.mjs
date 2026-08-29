import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("website reads public records from the standalone backend", async () => {
  const source = await read("lib/repository.ts");
  assert.match(source, /backendEndpoint\("\/v1\/promises"\)/);
  assert.match(source, /v1\/promises\/\$\{encodeURIComponent\(slug\)\}/);
});

test("submission flow requires an account, uploads owned media and sends the complete deadline contract", async () => {
  const route = await read("app/submit/page.tsx");
  const promise = await read("components/promise-submission.tsx");
  const proof = await read("components/proof-submission.tsx");
  const api = await read("lib/submission-api.ts");
  assert.doesNotMatch(`${promise}${proof}`, /signInAnonymously/);
  assert.match(route, /<AuthGuard>/);
  assert.match(api, /\/v1\/uploads\/proof/);
  assert.match(api, /\/v1\/submissions/);
  assert.match(promise, /mediaAssetId/);
  assert.match(proof, /completion_proof/);
  assert.match(promise, /promise_source/);
  assert.match(promise, /deadlineStart/);
  assert.match(promise, /deadlineEnd/);
});

test("accepted images appear as original letters, detailed proof and completed-card proof", async () => {
  const detail = await read("app/promises/[slug]/page.tsx");
  const explorer = await read("components/promise-explorer.tsx");
  assert.match(detail, /promise-letter-preview/);
  assert.match(detail, /completion-proof/);
  assert.match(explorer, /completed-proof-cover/);
  assert.match(explorer, /VERIFIED COMPLETION PROOF/);
});

test("account UI supports Google, password login, signup and password recovery", async () => {
  const source = await read("components/auth-form.tsx");
  const login = await read("app/login/page.tsx");
  const signup = await read("app/signup/page.tsx");
  const css = await read("components/auth-form.module.css");
  const layout = await read("app/layout.tsx");
  assert.match(source, /signInWithOAuth/);
  assert.match(source, /provider: "google"/);
  assert.match(source, /signInWithPassword/);
  assert.match(source, /signUp/);
  assert.match(source, /resetPasswordForEmail/);
  assert.match(source, /full_name: name\.trim\(\)/);
  assert.match(source, /useSearchParams/);
  assert.doesNotMatch(source, /setMode\("recovery"\)/);
  assert.doesNotMatch(source, /signInWithOtp|magic|secure link/i);
  assert.doesNotMatch(source, /Authentication is waiting|environment variables|Supabase environment/i);
  assert.match(login, /initialMode="login"/);
  assert.match(signup, /initialMode="signup"/);
  assert.match(login, /<Suspense fallback=\{null\}>/);
  assert.match(signup, /<Suspense fallback=\{null\}>/);
  assert.doesNotMatch(login, /SiteHeader|SiteFooter|site-shell|route-shell/);
  assert.doesNotMatch(signup, /SiteHeader|SiteFooter|site-shell|route-shell/);
  assert.match(source, /VaadaLogo className=\{styles\.logo\} tagline tone="dark"/);
  assert.doesNotMatch(source, /Go home|aria-label="Go to Vaada home"/);
  assert.match(css, /\.primaryButton \{/);
  assert.match(css, /\.googleButton \{/);
  assert.match(css, /border-radius: 999px/);
  assert.match(css, /\.highlightLink \{/);
  assert.match(css, /font: 520 18px\/1\.3 "Manrope Variable"/);
  assert.match(css, /\.logo :global\(\.vaada-logo-mark\)/);
  assert.match(css, /width: 100%/);
  assert.match(layout, /<Toaster position="top-right"/);
  const globalCss = await read("app/globals.css");
  assert.doesNotMatch(globalCss, /login-page|auth-card|google-auth-button|auth-submit|auth-secondary|forgot-password|password-control|auth-divider|auth-privacy-note/);
});

test("Supabase OAuth uses the cookie based PKCE client and a safe callback", async () => {
  const browserClient = await read("lib/supabase/client.ts");
  const serverClient = await read("lib/supabase/server.ts");
  const callback = await read("app/auth/callback/route.ts");
  const config = await read("lib/supabase/config.ts");
  assert.match(browserClient, /createBrowserClient/);
  assert.match(serverClient, /createSupabaseServerClient/);
  assert.match(serverClient, /getAll\(\)/);
  assert.match(serverClient, /setAll\(cookiesToSet\)/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /!requestedNext\.startsWith\("\/\/"\)/);
  assert.match(callback, /Cache-Control/);
  assert.match(config, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(config, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(serverClient, /cookieStore\.toString\(\)/);
});

test("Vercel refuses to publish a build without auth and backend variables", async () => {
  const script = await read("scripts/check-deployment-env.mjs");
  const packageJson = await read("package.json");
  assert.match(script, /process\.env\.VERCEL === "1"/);
  assert.match(script, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(script, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(script, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(script, /VAADA_API_URL/);
  assert.match(script, /NEXT_PUBLIC_VAADA_API_URL/);
  assert.match(packageJson, /check-deployment-env\.mjs && next build/);
});

test("private pages and write actions share one authentication policy", async () => {
  const provider = await read("components/auth-provider.tsx");
  const guard = await read("components/protected-action.tsx");
  const records = await read("app/my-logs/page.tsx");
  const review = await read("app/review/page.tsx");
  const header = await read("components/site-header.tsx");
  assert.match(provider, /!user\.is_anonymous/);
  assert.match(guard, /Please log in/);
  assert.match(guard, /router\.push\(loginHref\(href\)\)/);
  assert.match(records, /<AuthGuard>/);
  assert.match(review, /roles=\{\["reviewer","admin"\]\}/);
  assert.match(header, /"Log in"/);
  assert.match(header, /"Sign up"/);
});

test("public attribution remains optional while every submission stays authenticated", async () => {
  const source = await read("components/attribution-choice.tsx");
  const promise = await read("components/promise-submission.tsx");
  const proof = await read("components/proof-submission.tsx");
  const types = await read("lib/types.ts");
  const detail = await read("app/promises/[slug]/page.tsx");
  assert.match(source, /Keep my name private/);
  assert.match(source, /Credit my display name/);
  assert.match(source, /Your email is never published/);
  assert.match(promise, /submitAnonymously: !publiclyNamed/);
  assert.match(proof, /submitAnonymously: !publiclyNamed/);
  assert.match(types, /submittedBy\?: string/);
  assert.match(detail, /Contributed by/);
});

test("evidence input validates supported media and renders an image or PDF preview", async () => {
  const source = await read("components/evidence-upload.tsx");
  const review = await read("app/review/page.tsx");
  const css = await read("app/globals.css");
  assert.match(source, /image\/jpeg/);
  assert.match(source, /application\/pdf/);
  assert.match(source, /10 \* 1024 \* 1024/);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(source, /Preview of/);
  assert.match(review, /review-image-preview/);
  assert.match(css, /\.evidence-file-button \{[\s\S]*?border-radius: 999px;/);
  assert.match(css, /\.review-actions button \{[\s\S]*?border-radius: 999px;/);
});

test("customer-facing pages never expose infrastructure setup instructions", async () => {
  const paths = ["app/login/page.tsx", "app/submit/page.tsx", "app/submit-proof/page.tsx", "components/promise-submission.tsx", "components/proof-submission.tsx", "app/review/page.tsx", "app/my-logs/page.tsx", "components/protected-action.tsx", "components/live-visitors.tsx"];
  for (const path of paths) assert.doesNotMatch(await read(path), /environment variables|backend URL is not configured|Supabase environment|Connect backend to continue/i, path);
});

test("homepage moves Launch App into the hero and protects record creation", async () => {
  const source = await read("components/home-experience.tsx");
  assert.match(source, /href=\{mobileAppUrl\}>Launch app/);
  assert.match(source, /ProtectedActionLink className="button button-ghost hero-record"/);
  assert.doesNotMatch(source, />Explore promises/);
});

test("no server-only secret is referenced by browser code", async () => {
  const paths = ["app/submit/page.tsx", "app/submit-proof/page.tsx", "components/promise-submission.tsx", "components/proof-submission.tsx", "lib/submission-api.ts", "app/login/page.tsx", "lib/supabase/client.ts", "lib/repository.ts"];
  for (const path of paths) assert.doesNotMatch(await read(path), /SERVICE_ROLE|OPENAI_API_KEY|CRON_SECRET/);
});

test("account preferences are editable without making authorization roles self-service", async () => {
  const account = await read("app/account/page.tsx");
  const provider = await read("components/auth-provider.tsx");
  assert.match(account, /method: "PATCH"/);
  assert.match(account, /\/v1\/me\/profile/);
  assert.match(account, /government_official/);
  assert.match(account, /defaultSubmitAnonymously/);
  assert.match(account, /Save settings/);
  assert.match(account, /Reviewer and admin access is assigned by Vaada/);
  assert.doesNotMatch(account, /setRole|name="role"/);
  assert.match(provider, /contributor_type,default_submit_anonymously,preferences_configured_at/);
  assert.match(account, /Vaada has not selected this for you/);
  assert.match(account, /defaultAnonymous === null/);
});

test("promise intake and completion proof use separate guarded workflows", async () => {
  const submitRoute = await read("app/submit/page.tsx");
  const proofRoute = await read("app/submit-proof/page.tsx");
  const promise = await read("components/promise-submission.tsx");
  const proof = await read("components/proof-submission.tsx");
  const detail = await read("app/promises/[slug]/page.tsx");
  assert.match(submitRoute, /redirect\(`\/submit-proof/);
  assert.match(submitRoute, /<PromiseSubmission/);
  assert.match(proofRoute, /<AuthGuard>/);
  assert.match(proofRoute, /<ProofSubmission/);
  assert.match(promise, /extractPromiseDraft/);
  assert.match(promise, /Add at least one original source/);
  assert.match(proof, /HUMAN REVIEW ONLY/);
  assert.doesNotMatch(proof, /extractPromiseDraft|\/v1\/extract/);
  assert.match(detail, /\/submit-proof\?promise=/);
});

test("route changes reset scroll position instead of restoring the previous footer position", async () => {
  const source = await read("components/smooth-scroll.tsx");
  assert.match(source, /usePathname/);
  assert.match(source, /scrollRestoration = "manual"/);
  assert.match(source, /window\.scrollTo\(\{ top: 0/);
  assert.match(source, /scrollTo\(0, \{ immediate: true, force: true \}\)/);
});

test("the page shell ends with the footer instead of a transparent dock gap", async () => {
  const css = await read("app/globals.css");
  assert.match(css, /\.site-shell \{\s*min-height: 100svh;\s*display: flex;[\s\S]*?padding-bottom: 0;/);
  assert.match(css, /\.site-shell > footer \{ width: 100%; margin-top: auto; \}/);
  assert.doesNotMatch(css, /\.site-shell \{\s*background:transparent; padding-bottom:88px; \}/);
  assert.doesNotMatch(css, /\.site-shell \{\s*padding-bottom:76px; \}/);
});

test("state pages initialize both visible location filters from the route", async () => {
  const page = await read("app/states/[state]/page.tsx");
  const explorer = await read("components/promise-explorer.tsx");
  assert.match(page, /initialState=\{stateName\}/);
  assert.match(page, /initialDistrict=\{districtName \?\? onlyDistrict\}/);
  assert.match(explorer, /useState\(initialState\)/);
  assert.match(explorer, /useState\(initialDistrict\)/);
});

test("homepage statistics use the shared page gutter and a centered inner grid", async () => {
  const home = await read("components/home-experience.tsx");
  const css = await read("app/globals.css");
  assert.match(home, /className="stats-shell"/);
  assert.match(css, /\.stats-shell \{ padding-inline:var\(--page-gutter\)/);
  assert.match(css, /\.stats-shell \.stats \{ width:100%; max-width:1320px; margin-inline:auto/);
});
