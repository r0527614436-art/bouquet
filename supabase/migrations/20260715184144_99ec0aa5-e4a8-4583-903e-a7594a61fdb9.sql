CREATE TABLE public.catalog_popup (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean NOT NULL DEFAULT true,
  title text NOT NULL DEFAULT 'לקוחות יקרים!',
  body_text text NOT NULL DEFAULT '',
  button_text text NOT NULL DEFAULT 'להמשך בקטלוג',
  button_link text NOT NULL DEFAULT '/catalog',
  image_url text NOT NULL DEFAULT '/lovable-uploads/catalog-popup-bg.webp',
  overlay_opacity integer NOT NULL DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_popup TO anon, authenticated;
GRANT ALL ON public.catalog_popup TO service_role;

ALTER TABLE public.catalog_popup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view catalog popup" ON public.catalog_popup FOR SELECT USING (true);
CREATE POLICY "Anyone can manage catalog popup" ON public.catalog_popup FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.catalog_popup (title, body_text, button_text, button_link, image_url, overlay_opacity, is_active)
VALUES (
  'לקוחות יקרים!',
  E'בתהליך בחירת הפרחים והשזירה\nמושקע מאמץ רב ע"מ להנגיש לכם זר עמיד יפה ורענן,\nעם כל זאת מכיון שהפרחים בחלקם אינם זמינים בכל ימות השנה,\nייתכנו שינויים קלים בסוג הפרח / גוון הפרח ובשלבי הפתיחה.',
  'להמשך בקטלוג',
  '/catalog',
  '/lovable-uploads/catalog-popup-bg.webp',
  30,
  true
);
