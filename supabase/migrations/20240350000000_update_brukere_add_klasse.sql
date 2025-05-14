-- Legg til klasse-felt i brukere-tabellen
ALTER TABLE public.brukere ADD COLUMN IF NOT EXISTS klasse text;

-- Legg til godkjent-felt i brukere-tabellen hvis det ikke finnes
ALTER TABLE public.brukere ADD COLUMN IF NOT EXISTS godkjent boolean DEFAULT false; 