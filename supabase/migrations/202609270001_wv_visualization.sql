create extension if not exists "pgcrypto";

create type public.wv_upload_status as enum ('ACTIVE', 'DELETED', 'EXPIRED');
create type public.wv_job_status as enum ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'EXPIRED');

create table public.wv_image_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_provider text not null,
  storage_key text not null unique,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  sha256 text not null,
  status public.wv_upload_status not null default 'ACTIVE',
  consent_version text not null,
  consented_at timestamptz not null,
  ownership_confirmed_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.wv_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_id uuid not null references public.wv_image_uploads(id) on delete restrict,
  category_code text not null check (category_code in ('LOSS_3_5', 'LOSS_6_10', 'LOSS_10_15')),
  requested_min_loss_kg numeric(8,2) not null,
  requested_max_loss_kg numeric(8,2) not null,
  effective_max_loss_kg numeric(8,2) not null,
  height_cm numeric(6,2) not null,
  weight_kg numeric(7,2) not null,
  bmi numeric(8,2) not null,
  status public.wv_job_status not null default 'PENDING',
  provider text not null,
  provider_job_id text,
  result_storage_key text,
  error_code text,
  error_message text,
  idempotency_key uuid not null,
  attempt_count integer not null default 0,
  processing_started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index wv_generation_jobs_user_idempotency_key_idx on public.wv_generation_jobs(user_id, idempotency_key);
create index wv_image_uploads_user_id_idx on public.wv_image_uploads(user_id);
create index wv_image_uploads_expires_at_idx on public.wv_image_uploads(expires_at);
create index wv_generation_jobs_user_id_idx on public.wv_generation_jobs(user_id);
create index wv_generation_jobs_upload_id_idx on public.wv_generation_jobs(upload_id);
create index wv_generation_jobs_status_idx on public.wv_generation_jobs(status);
create index wv_generation_jobs_expires_at_idx on public.wv_generation_jobs(expires_at);
create index wv_generation_jobs_user_category_created_idx on public.wv_generation_jobs(user_id, category_code, created_at desc);

alter table public.wv_image_uploads enable row level security;
alter table public.wv_generation_jobs enable row level security;

create policy wv_uploads_select_own on public.wv_image_uploads for select using (auth.uid() = user_id);
create policy wv_uploads_insert_own on public.wv_image_uploads for insert with check (auth.uid() = user_id);
create policy wv_uploads_update_own on public.wv_image_uploads for update using (auth.uid() = user_id);
create policy wv_uploads_delete_own on public.wv_image_uploads for delete using (auth.uid() = user_id);
create policy wv_jobs_select_own on public.wv_generation_jobs for select using (auth.uid() = user_id);
create policy wv_jobs_insert_own on public.wv_generation_jobs for insert with check (auth.uid() = user_id);
create policy wv_jobs_update_own on public.wv_generation_jobs for update using (auth.uid() = user_id);

create or replace function public.wv_reserve_generation(
  p_user_id uuid, p_upload_id uuid, p_category_code text,
  p_requested_min numeric, p_requested_max numeric, p_effective_max numeric,
  p_height_cm numeric, p_weight_kg numeric, p_bmi numeric,
  p_provider text, p_idempotency_key uuid, p_expires_at timestamptz
) returns public.wv_generation_jobs
language plpgsql security definer set search_path = public
as $$
declare result_job public.wv_generation_jobs;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into result_job from public.wv_generation_jobs where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if found then return result_job; end if;
  if (select count(*) from public.wv_generation_jobs where user_id = p_user_id and (status in ('PENDING','PROCESSING') or (status = 'SUCCEEDED' and created_at >= now() - interval '24 hours'))) >= 2 then
    raise exception using errcode = 'P0001', message = 'DAILY_LIMIT_REACHED';
  end if;
  if exists (select 1 from public.wv_generation_jobs where user_id = p_user_id and category_code = p_category_code and (status in ('PENDING','PROCESSING') or (status = 'SUCCEEDED' and created_at >= now() - interval '24 hours'))) then
    raise exception using errcode = 'P0001', message = 'CATEGORY_LIMIT_REACHED';
  end if;
  insert into public.wv_generation_jobs(user_id, upload_id, category_code, requested_min_loss_kg, requested_max_loss_kg, effective_max_loss_kg, height_cm, weight_kg, bmi, provider, idempotency_key, expires_at)
  values (p_user_id, p_upload_id, p_category_code, p_requested_min, p_requested_max, p_effective_max, p_height_cm, p_weight_kg, p_bmi, p_provider, p_idempotency_key, p_expires_at)
  returning * into result_job;
  return result_job;
end $$;

revoke all on function public.wv_reserve_generation(uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, text, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.wv_reserve_generation(uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, numeric, text, uuid, timestamptz) to service_role;
