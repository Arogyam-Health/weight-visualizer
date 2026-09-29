# Weight Visualizer implementation plan

This repository is a standalone Next.js application. All Supabase objects introduced by the module use the `wv_` prefix. Existing Supabase tables, functions, and edge functions are out of scope.

1. Database and domain logic: migration, RLS, atomic quota reservation, BMI/category rules, and tests.
2. Storage: image validation, metadata removal, local private storage, Cloudinary adapter, secure URLs.
3. Jobs: provider interface, dummy provider, worker, retries, and failure handling.
4. API: authenticated upload, eligibility, generation, job, history, deletion, worker, and cleanup routes.
5. Development UI: anonymous/dev sign-in, consent, upload, polling, and refresh restoration.
6. Cleanup and documentation: expiry worker, setup instructions, API contract, and Shopify handoff.

Status: foundation, namespaced migrations, eligibility, storage adapters, dummy provider, worker, identity-verified API, development UI, cleanup, and documentation are implemented. The hosted migrations and database-backed dummy-provider flow have been verified against the configured Supabase project.

Required secrets before integration testing: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Supabase CLI linking also requires the project ref and CLI access token or an authenticated CLI session.
