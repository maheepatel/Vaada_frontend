import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("website reads public records from the standalone backend", async () => {
  const source = await read("lib/repository.ts");
  assert.match(source, /backendEndpoint\("\/v1\/promises"\)/);
  assert.match(source, /v1\/promises\/\$\{encodeURIComponent\(slug\)\}/);
});

test("submission flow authenticates, uploads media and sends the complete deadline contract", async () => {
  const source = await read("app/submit/page.tsx");
  assert.match(source, /signInAnonymously/);
  assert.match(source, /\/v1\/uploads\/proof/);
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

test("account UI supports password login, signup and secure email links", async () => {
  const source = await read("app/login/page.tsx");
  assert.match(source, /signInWithPassword/);
  assert.match(source, /signUp/);
  assert.match(source, /signInWithOtp/);
});

test("no server-only secret is referenced by browser code", async () => {
  const paths = ["app/submit/page.tsx", "app/login/page.tsx", "lib/supabase/client.ts", "lib/repository.ts"];
  for (const path of paths) assert.doesNotMatch(await read(path), /SERVICE_ROLE|OPENAI_API_KEY|CRON_SECRET/);
});
