CREATE TABLE public.popups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  title text NOT NULL DEFAULT '',
  body_text text NOT NULL DEFAULT '',
  button_text text NOT NULL DEFAULT 'להמשך',
  button_link text NOT NULL DEFAULT '/',
  image_url text NOT NULL DEFAULT '',
  overlay_opacity integer NOT NULL DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.popups TO anon, authenticated;
GRANT ALL ON public.popups TO service_role;

ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popups" ON public.popups FOR SELECT USING (true);
CREATE POLICY "Anyone can manage popups" ON public.popups FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.popups (page_path, is_active, title, body_text, button_text, button_link, image_url, overlay_opacity)
SELECT '/', is_active, title, body_text, button_text, button_link, image_url, overlay_opacity
FROM public.homepage_popup
LIMIT 1;

INSERT INTO public.popups (page_path, is_active, title, body_text, button_text, button_link, image_url, overlay_opacity)
SELECT '/catalog', is_active, title, body_text, button_text, button_link, image_url, overlay_opacity
FROM public.catalog_popup
LIMIT 1;

DROP TABLE public.homepage_popup;
DROP TABLE public.catalog_popup;
