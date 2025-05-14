-- Opprett artikler-tabellen
CREATE TABLE IF NOT EXISTS public.artikler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tittel text NOT NULL,
  ingress text,
  innhold text NOT NULL,
  forfatterID uuid REFERENCES auth.users(id),
  forfatterNavn text,
  kategori text,
  bilde text,
  godkjent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Opprett RLS-policies

-- Les-tilgang for alle (både innlogget og ikke-innlogget)
CREATE POLICY "Godkjente artikler er synlige for alle" 
ON public.artikler
FOR SELECT 
TO public
USING (godkjent = true);

-- Forfattere kan se sine egne artikler, uansett status
CREATE POLICY "Forfattere kan se sine egne artikler" 
ON public.artikler
FOR SELECT 
TO authenticated
USING (forfatterID = auth.uid());

-- Redaktører og admin kan se alle artikler
CREATE POLICY "Redaktører og admin kan se alle artikler" 
ON public.artikler
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.brukere 
    WHERE id = auth.uid() 
    AND (rolle = 'admin' OR rolle = 'redaktør' OR rolle = 'teknisk_leder')
  )
);

-- Forfattere kan oppdatere sine egne ikke-godkjente artikler
CREATE POLICY "Forfattere kan oppdatere sine egne ikke-godkjente artikler" 
ON public.artikler
FOR UPDATE 
TO authenticated
USING (forfatterID = auth.uid() AND godkjent = false)
WITH CHECK (forfatterID = auth.uid() AND godkjent = false);

-- Redaktører og admin kan oppdatere alle artikler
CREATE POLICY "Redaktører og admin kan oppdatere alle artikler" 
ON public.artikler
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.brukere 
    WHERE id = auth.uid() 
    AND (rolle = 'admin' OR rolle = 'redaktør' OR rolle = 'teknisk_leder')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.brukere 
    WHERE id = auth.uid() 
    AND (rolle = 'admin' OR rolle = 'redaktør' OR rolle = 'teknisk_leder')
  )
);

-- Innlogget bruker kan opprette artikler
CREATE POLICY "Innlogget bruker kan opprette artikler" 
ON public.artikler
FOR INSERT 
TO authenticated
WITH CHECK (forfatterID = auth.uid());

-- Auto-oppdatering av updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.artikler
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 