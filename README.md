# Checklist Panini Megacracks 26-27 ⚽

Checklist digital interactiva oficial basada fielmente en el diseño del documento de **Panini Megacracks 26-27 / 25 Aniversario LaLiga EA Sports**.

---

## 🌟 Características

- **Diseño idéntico al PDF oficial de Panini**: 4 páginas completas con distribución de 3 columnas, cabeceras oficiales, tipografías condensadas y pie de página con redes sociales.
- **Colección completa**:
  - Pág 1: *ELITE, ELITE POWER, Deportivo Alavés, Athletic Club, Atlético de Madrid, FC Barcelona, Real Betis, RC Celta de Vigo*.
  - Pág 2: *Deportivo de La Coruña, Elche CF, RCD Espanyol, Getafe CF, Levante UD, Real Madrid CF, Málaga CF, CA Osasuna*.
  - Pág 3: *Racing de Santander, Rayo Vallecano, Real Sociedad, Sevilla FC, Valencia CF, Villarreal CF, ENJOY, ENJOY POWER, ZONA VIP*.
  - Pág 4: *ZONA VIP POWER, MASTER ROOKIE, STARS ON 25, JUST 25 (Cristiano Ronaldo y Messi) y tabla completa de AUTÓGRAFOS 26-27 (200, 100, 50, 50 dobles y 5 copias)*.
- **Marcado de cromos intuitivo**:
  - Clic en cromo para marcarlo como conseguido al instante en verde.
  - **Pantalla de confirmación para desmarcar**: Evita desmarcar cromos por error pidiéndote confirmación previa.
- **Sincronización en la nube con Supabase**:
  - Posibilidad de conectar tu propio proyecto de Supabase para guardar tus cromos en tiempo real entre múltiples dispositivos.
  - Almacenamiento local persistente (`localStorage`) automático si no se conecta Supabase o estás sin conexión.
- **Búsqueda y filtros rápidos**:
  - Filtra entre *Todos*, *Faltas* y *Tengo*.
  - Buscador en tiempo real por nombre de jugador, número o equipo.
  - Selector de páginas individuales o vista de las 4 páginas completas.
- **Herramientas para coleccionistas**:
  - Copiar lista de faltas al portapapeles en 1 clic (formateada para compartir por WhatsApp o foros de intercambio).
  - Descarga y carga de copias de seguridad en formato JSON.
  - Modo optimizado para imprimir en papel o guardar en PDF.

---

## 🚀 Instalación y ejecución local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/checklist-megacracks-26-27.git
   cd checklist-megacracks-26-27
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. (Opcional) Configura tus credenciales de Supabase en un archivo `.env`:
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-anon-public-key"
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## 🗄️ Tabla de Supabase (SQL)

El archivo con la estructura completa está disponible en `supabase/schema.sql`:

```sql
create table if not exists public.megacracks_checklist (
  user_identifier text primary key,
  checked_ids jsonb not null default '{}'::jsonb,
  total_collected integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.megacracks_checklist enable row level security;

create policy "Acceso total a checklist megacracks"
  on public.megacracks_checklist
  for all
  using (true)
  with check (true);

notify pgrst, 'reload schema';
```

---

## 🛠️ Tecnologías

- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vite**
- **Supabase Client (`@supabase/supabase-js`)**
- **Lucide Icons**
