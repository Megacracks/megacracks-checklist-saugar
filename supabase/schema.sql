-- ========================================================================
-- PROYECTO: Checklist Panini Megacracks 26-27
-- TABLA OFICIAL PARA SUPABASE: megacracks_checklist
-- ========================================================================

-- 1. Crear la tabla principal de checklist
create table if not exists public.megacracks_checklist (
  user_identifier text primary key,
  checked_ids jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Asegurar columnas opcionales si ya existía la tabla
alter table public.megacracks_checklist add column if not exists total_collected integer default 0;
alter table public.megacracks_checklist add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Añadir comentarios para documentación
comment on table public.megacracks_checklist is 'Almacena el estado de los cromos marcados de Megacracks 26-27 por usuario';
comment on column public.megacracks_checklist.user_identifier is 'Identificador único del usuario o colección';
comment on column public.megacracks_checklist.checked_ids is 'Objeto JSON con los IDs de cromos conseguidos { "1": true, "2": true, ... }';

-- 3. Habilitar Seguridad por Filas (Row Level Security - RLS)
alter table public.megacracks_checklist enable row level security;

-- 4. Crear política permisiva para la clave anónima pública (anon key)
drop policy if exists "Acceso total a checklist megacracks" on public.megacracks_checklist;
create policy "Acceso total a checklist megacracks"
  on public.megacracks_checklist
  for all
  using (true)
  with check (true);

-- 5. Crear función y disparador (trigger) para actualizar la fecha automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_megacracks_checklist_updated_at on public.megacracks_checklist;
create trigger set_megacracks_checklist_updated_at
  before update on public.megacracks_checklist
  for each row
  execute function public.handle_updated_at();

-- 6. Notificar a PostgREST para recargar la caché del esquema de inmediato
notify pgrst, 'reload schema';
