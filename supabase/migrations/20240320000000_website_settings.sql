-- Create website_settings table
CREATE TABLE IF NOT EXISTS public.website_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    lockdown BOOLEAN DEFAULT false,
    full_lockdown BOOLEAN DEFAULT false,
    note TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON public.website_settings
FOR SELECT
TO public
USING (true);

-- Allow technical leader to update settings
CREATE POLICY "Allow technical leader to update settings"
ON public.website_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.brukere
        WHERE id = auth.uid()
        AND rolle = 'teknisk_leder'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.brukere
        WHERE id = auth.uid()
        AND rolle = 'teknisk_leder'
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_website_settings_updated_at
    BEFORE UPDATE ON public.website_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.website_settings (id, lockdown, full_lockdown, note)
VALUES (1, false, false, '')
ON CONFLICT (id) DO NOTHING; 