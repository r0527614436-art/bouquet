
CREATE TABLE public.homepage_popup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT true,
  title TEXT NOT NULL DEFAULT 'לקוחות יקרים!',
  body_text TEXT NOT NULL DEFAULT '',
  button_text TEXT NOT NULL DEFAULT 'להמשך',
  button_link TEXT NOT NULL DEFAULT '/catalog',
  image_url TEXT NOT NULL DEFAULT '/lovable-uploads/catalog-popup-bg.webp',
  overlay_opacity INTEGER NOT NULL DEFAULT 30 CHECK (overlay_opacity BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.homepage_popup TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_popup TO authenticated, anon;
GRANT ALL ON public.homepage_popup TO service_role;

ALTER TABLE public.homepage_popup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view homepage popup" ON public.homepage_popup FOR SELECT USING (true);
CREATE POLICY "Anyone can manage homepage popup" ON public.homepage_popup FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.homepage_popup (is_active, title, body_text, button_text, button_link, image_url, overlay_opacity)
VALUES (true, 'לקוחות יקרים!', 'מוזמנים לצפות בקטלוג המלא שלנו', 'לקטלוג באתר', '/catalog', '/lovable-uploads/catalog-popup-bg.webp', 30);
