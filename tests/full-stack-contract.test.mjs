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
  const source = await read("app/submit/page.tsx");
  assert.doesNotMatch(source, /signInAnonymously/);
  assert.match(source, /<AuthGuard>/);
  assert.match(source, /\/v1\/uploads\/proof/);
  assert.match(source, /mediaAssetId/);
  assert.match(source, /completion_proof/);
  assert.match(source, /promise_source/);
  assert.match(source, /\/v1\/submissions/);
  assert.match(source, /deadlineStart/);
  assert.match(source, /deadlineEnd/);
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
  assert.match(css, /\.primaryButton \{/);
  assert.match(css, /\.googleButton \{/);
  assert.match(css, /width: 100%/);
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
  const source = await read("app/submit/page.tsx");
  const types = await read("lib/types.ts");
  const detail = await read("app/promises/[slug]/page.tsx");
  assert.match(source, /Keep my name private/);
  assert.match(source, /Credit this record to me/);
  assert.match(source, /Your email is never published/);
  assert.match(source, /submitAnonymously: !publiclyNamed/);
  assert.match(types, /submittedBy\?: string/);
  assert.match(detail, /Contributed by/);
});

test("evidence input validates supported media and renders an image or PDF preview", async () => {
  const source = await read("components/evidence-upload.tsx");
  const review = await read("app/review/page.tsx");
  assert.match(source, /image\/jpeg/);
  assert.match(source, /application\/pdf/);
  assert.match(source, /10 \* 1024 \* 1024/);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(source, /Preview of/);
  assert.match(review, /review-image-preview/);
});

test("customer-facing pages never expose infrastructure setup instructions", async () => {
  const paths = ["app/login/page.tsx", "app/submit/page.tsx", "app/review/page.tsx", "app/my-logs/page.tsx", "components/protected-action.tsx", "components/live-visitors.tsx"];
  for (const path of paths) assert.doesNotMatch(await read(path), /environment variables|backend URL is not configured|Supabase environment|Connect backend to continue/i, path);
});

test("homepage moves Launch App into the hero and protects record creation", async () => {
  const source = await read("components/home-experience.tsx");
  assert.match(source, /href=\{mobileAppUrl\}>Launch app/);
  assert.match(source, /ProtectedActionLink className="button button-ghost hero-record"/);
  assert.doesNotMatch(source, />Explore promises/);
});

test("no server-only secret is referenced by browser code", async () => {
  const paths = ["app/submit/page.tsx", "app/login/page.tsx", "lib/supabase/client.ts", "lib/repository.ts"];
  for (const path of paths) assert.doesNotMatch(await read(path), /SERVICE_ROLE|OPENAI_API_KEY|CRON_SECRET/);
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
