-- CEFUNT · Migración para soporte de sílabos de cursos electivos
-- Ejecuta este archivo UNA SOLA VEZ en Supabase > SQL Editor si ya configuraste el sistema antes.

alter table public.syllabi
add column if not exists elective_name text;

-- Comprobación opcional:
-- select id, course_name, elective_name, year, semester, status from public.syllabi order by created_at desc;
