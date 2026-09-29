alter table public.wv_image_uploads drop constraint wv_image_uploads_user_id_fkey;
alter table public.wv_image_uploads add constraint wv_image_uploads_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;
alter table public.wv_generation_jobs drop constraint wv_generation_jobs_user_id_fkey;
alter table public.wv_generation_jobs add constraint wv_generation_jobs_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;
