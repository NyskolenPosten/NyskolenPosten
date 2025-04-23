-- Opprett tabell for website-innstillinger
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lockdown BOOLEAN DEFAULT false,
    full_lockdown BOOLEAN DEFAULT false,
    note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id)
);

-- Opprett RLS (Row Level Security) policies
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Tillat lesing for alle
CREATE POLICY "Allow public read access" ON public.website_settings
    FOR SELECT USING (true);

-- Tillat oppdatering kun for teknisk leder
CREATE POLICY "Allow technical leader to update settings" ON public.website_settings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'rolle' = 'teknisk_leder'
        )
    );

-- Opprett trigger for å oppdatere updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_website_settings_updated_at
    BEFORE UPDATE ON public.website_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sett inn standardinnstillinger
INSERT INTO public.website_settings (lockdown, full_lockdown, note)
VALUES (false, false, '')
ON CONFLICT DO NOTHING; 