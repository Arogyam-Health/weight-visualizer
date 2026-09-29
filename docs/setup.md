# Development setup

1. Copy `.env.example` to `.env` and fill in the Supabase values listed below.
2. Install dependencies with `npm install`.
3. Apply the migration with the Supabase CLI: `SUPABASE_TELEMETRY_DISABLED=1 supabase link --project-ref <project-ref>` followed by `SUPABASE_TELEMETRY_DISABLED=1 supabase db push`.
4. Start the app with `npm run dev` and open `/visualization-dev`.
5. Run the worker in another terminal with `npm run worker:dev`.
6. Run cleanup daily with `npm run cleanup`, or call the protected internal cleanup route with `x-cleanup-secret`.

Required secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Local storage also requires `STORAGE_SIGNING_SECRET`. Cloudinary mode additionally requires its three Cloudinary credentials. The browser receives only the anonymous Supabase key; the service-role key is server-only.

The development UI reads `user_id` and `phone` from localStorage. These are claims only; every API request verifies the pair against the existing `public.users(id, phone)` table using the server-only service-role client. The existing users table is not created or modified by this module.
