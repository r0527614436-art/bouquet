
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalog_items table
CREATE TABLE public.catalog_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_settings table for password management
CREATE TABLE public.admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password TEXT NOT NULL DEFAULT '0527614436',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default password
INSERT INTO public.admin_settings (id, password) VALUES (1, '0527614436');

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public catalog)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can manage categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Anyone can view catalog items" ON public.catalog_items FOR SELECT USING (true);
CREATE POLICY "Anyone can manage catalog items" ON public.catalog_items FOR ALL USING (true);

CREATE POLICY "Anyone can view admin settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can manage admin settings" ON public.admin_settings FOR ALL USING (true);
