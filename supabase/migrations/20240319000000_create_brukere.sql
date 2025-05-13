-- Opprett brukere-tabellen
CREATE TABLE IF NOT EXISTS public.brukere (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navn text,
  rolle text,
  opprettet timestamp with time zone DEFAULT timezone('utc'::text, now())
); 