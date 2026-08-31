-- CEFUNT · Sistema colaborativo de sílabos
-- Ejecuta TODO este archivo una sola vez en el SQL Editor de Supabase.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.syllabi (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  course_code text not null,
  course_name text not null,
  cycle text not null,
  elective_name text,
  year integer not null check (year between 1950 and 2100),
  semester text not null check (semester in ('I', 'II')),
  original_filename text not null,
  submission_path text not null,
  public_path text,
  public_url text,
  contact_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists syllabi_status_idx on public.syllabi(status);
create index if not exists syllabi_course_id_idx on public.syllabi(course_id);

alter table public.syllabi enable row level security;
revoke all on table public.syllabi from anon, authenticated;
grant select, insert on table public.syllabi to anon;
grant select, insert, update, delete on table public.syllabi to authenticated;

-- Visitantes: pueden enviar, pero solo con estado pendiente y sin campos de revisión/publicación.
drop policy if exists "Public can submit pending syllabi" on public.syllabi;
create policy "Public can submit pending syllabi"
on public.syllabi for insert
to anon
with check (
  status = 'pending'
  and public_path is null
  and public_url is null
  and reviewed_at is null
  and reviewed_by is null
);

drop policy if exists "Authenticated can submit pending syllabi" on public.syllabi;
create policy "Authenticated can submit pending syllabi"
on public.syllabi for insert
to authenticated
with check (
  status = 'pending'
  and public_path is null
  and public_url is null
  and reviewed_at is null
  and reviewed_by is null
);

-- Visitantes: solo pueden leer lo que CEFUNT ya aprobó.
drop policy if exists "Public can read approved syllabi" on public.syllabi;
create policy "Public can read approved syllabi"
on public.syllabi for select
to anon
using (status = 'approved');

-- Administradores: acceso de revisión.
drop policy if exists "Admins can read all syllabi" on public.syllabi;
create policy "Admins can read all syllabi"
on public.syllabi for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can update syllabi" on public.syllabi;
create policy "Admins can update syllabi"
on public.syllabi for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete syllabi" on public.syllabi;
create policy "Admins can delete syllabi"
on public.syllabi for delete
to authenticated
using ((select public.is_admin()));

-- Buckets: uno privado para envíos y uno público para documentos aprobados.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('syllabus-submissions', 'syllabus-submissions', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('syllabi-public', 'syllabi-public', true, 10485760, array['application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

-- Cualquier visitante puede subir PDF al bucket privado; no puede leerlos.
drop policy if exists "Public can upload syllabus submissions" on storage.objects;
create policy "Public can upload syllabus submissions"
on storage.objects for insert
to anon
with check (
  bucket_id = 'syllabus-submissions'
  and storage.extension(name) = 'pdf'
);

drop policy if exists "Authenticated can upload syllabus submissions" on storage.objects;
create policy "Authenticated can upload syllabus submissions"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'syllabus-submissions'
  and storage.extension(name) = 'pdf'
);

-- Los administradores pueden leer y retirar archivos privados.
drop policy if exists "Admins can read syllabus submissions" on storage.objects;
create policy "Admins can read syllabus submissions"
on storage.objects for select
to authenticated
using (bucket_id = 'syllabus-submissions' and (select public.is_admin()));

drop policy if exists "Admins can delete syllabus submissions" on storage.objects;
create policy "Admins can delete syllabus submissions"
on storage.objects for delete
to authenticated
using (bucket_id = 'syllabus-submissions' and (select public.is_admin()));

-- Los administradores publican el PDF aprobado en el bucket público.
drop policy if exists "Admins can publish syllabi" on storage.objects;
create policy "Admins can publish syllabi"
on storage.objects for insert
to authenticated
with check (bucket_id = 'syllabi-public' and (select public.is_admin()));

drop policy if exists "Admins can delete published syllabi" on storage.objects;
create policy "Admins can delete published syllabi"
on storage.objects for delete
to authenticated
using (bucket_id = 'syllabi-public' and (select public.is_admin()));

-- IMPORTANTE: después de crear tu usuario administrador en Authentication > Users,
-- ejecuta una vez reemplazando el correo:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'TU_CORREO_ADMIN@EJEMPLO.COM'
-- on conflict (user_id) do nothing;
