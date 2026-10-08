import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'megacracks_supabase_config_v1';
const USER_IDENTIFIER_KEY = 'megacracks_user_id_v1';
export const DEFAULT_USER_IDENTIFIER = 'mi_coleccion_megacracks';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('relation "megacracks_checklist" does not exist') ||
    msg.includes("could not find the table 'public.megacracks_checklist'")
  );
}

// Extract project reference from Supabase URL (e.g., https://xyzcompany.supabase.co -> xyzcompany)
export function getProjectRef(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/https?:\/\/([a-zA-Z0-9-]+)\.supabase\.co/);
  return match ? match[1] : null;
}

// Get user identifier (unified default so AI Studio, Vercel, and mobile all share the exact same collection)
export function getUserIdentifier(): string {
  let id = localStorage.getItem(USER_IDENTIFIER_KEY);
  if (!id || id.startsWith('user_')) {
    id = DEFAULT_USER_IDENTIFIER;
    localStorage.setItem(USER_IDENTIFIER_KEY, id);
  }
  return id;
}

export function setUserIdentifier(newId: string): void {
  if (newId.trim()) {
    localStorage.setItem(USER_IDENTIFIER_KEY, newId.trim());
  }
}

// Load Supabase credentials from Env or LocalStorage
export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // If env vars are set and not placeholder
  if (envUrl && !envUrl.includes('YOUR_PROJECT_ID') && envKey && !envKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    return { url: envUrl, anonKey: envKey };
  }

  // Check localStorage
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch {
    // Ignore parse error
  }

  return { url: envUrl, anonKey: envKey };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    SUPABASE_CONFIG_KEY,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
  // Clear cached client on new config
  cachedClient = null;
  currentClientKey = '';
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  cachedClient = null;
  currentClientKey = '';
}

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config.url || !config.anonKey || config.url.includes('YOUR_PROJECT_ID') || !config.url.startsWith('http')) {
    return null;
  }

  const key = `${config.url}_${config.anonKey}`;
  if (cachedClient && currentClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    currentClientKey = key;
    return cachedClient;
  } catch (e) {
    console.warn('Supabase client could not be initialized:', e);
    return null;
  }
}

// Test connection
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; tableMissing?: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);
    const { error } = await client
      .from('megacracks_checklist')
      .select('user_identifier')
      .limit(1);

    if (error) {
      if (isTableMissingError(error)) {
        return {
          success: true,
          tableMissing: true,
          message: '¡Conexión con Supabase correcta! Falta crear la tabla "megacracks_checklist". Ejecuta el script SQL en tu panel de Supabase.',
        };
      }
      return { success: false, message: error.message };
    }

    return {
      success: true,
      tableMissing: false,
      message: '¡Conexión y tabla "megacracks_checklist" verificadas con éxito! Sincronización activa.',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error al conectar con Supabase' };
  }
}

// Fetch checklist data from Supabase
export async function fetchFromSupabase(
  userIdentifier: string
): Promise<{ data: Record<string, boolean> | null; tableMissing?: boolean }> {
  const client = getSupabaseClient();
  if (!client) return { data: null };

  try {
    const { data, error } = await client
      .from('megacracks_checklist')
      .select('checked_ids, updated_at')
      .eq('user_identifier', userIdentifier)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found for this specific user yet
        return { data: null };
      }
      if (isTableMissingError(error)) {
        return { data: null, tableMissing: true };
      }
      return { data: null };
    }

    if (data && data.checked_ids) {
      return { data: data.checked_ids as Record<string, boolean> };
    }
  } catch {
    // Non-fatal, offline fallback
  }
  return { data: null };
}

// Push checklist data to Supabase
export async function pushToSupabase(
  userIdentifier: string,
  checkedIds: Record<string, boolean>
): Promise<{ success: boolean; tableMissing?: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'No hay cliente Supabase configurado' };

  try {
    const { error } = await client.from('megacracks_checklist').upsert(
      {
        user_identifier: userIdentifier,
        checked_ids: checkedIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_identifier' }
    );

    if (error) {
      if (isTableMissingError(error)) {
        return {
          success: false,
          tableMissing: true,
          error: 'Falta crear la tabla "megacracks_checklist" en tu panel de Supabase.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red con Supabase' };
  }
}

// Real-time synchronization subscription
export function subscribeToSupabaseChanges(
  userIdentifier: string,
  onRemoteChange: (checkedIds: Record<string, boolean>) => void
): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel(`realtime_checklist_${userIdentifier}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'megacracks_checklist',
          filter: `user_identifier=eq.${userIdentifier}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.checked_ids) {
            onRemoteChange(payload.new.checked_ids);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}

// SQL Script helper for user to create table in 1 click
export const SUPABASE_SQL_SCRIPT = `-- ========================================================================
-- PROYECTO: Checklist Panini Megacracks 26-27
-- TABLA OFICIAL PARA SUPABASE: megacracks_checklist
-- ========================================================================

create table if not exists public.megacracks_checklist (
  user_identifier text primary key,
  checked_ids jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Seguridad por Filas (RLS)
alter table public.megacracks_checklist enable row level security;

-- Política permisiva para la clave pública (anon public key)
drop policy if exists "Acceso total a checklist megacracks" on public.megacracks_checklist;
create policy "Acceso total a checklist megacracks"
  on public.megacracks_checklist
  for all
  using (true)
  with check (true);

-- Notificar a PostgREST para recargar la caché del esquema al instante
notify pgrst, 'reload schema';
`;

// Automatic table creation via Supabase Management API (if personal access token is provided)
export async function createTableViaSupabaseManagementApi(
  projectRef: string,
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: SUPABASE_SQL_SCRIPT }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || `Error ${res.status}: no se pudo crear la tabla automáticamente`,
      };
    }

    return {
      success: true,
      message: '¡Tabla creada automáticamente en tu proyecto de Supabase con éxito!',
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Error de conexión con la API de Supabase',
    };
  }
}
