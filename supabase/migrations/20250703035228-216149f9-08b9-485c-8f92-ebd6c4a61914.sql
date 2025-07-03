
-- Create homepage_slides table
CREATE TABLE public.homepage_slides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  order_index integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for homepage display)
CREATE POLICY "Anyone can view homepage slides" ON public.homepage_slides
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage homepage slides" ON public.homepage_slides
  FOR ALL USING (true);

-- Create index for ordering
CREATE INDEX idx_homepage_slides_order ON public.homepage_slides(order_index);
CREATE INDEX idx_homepage_slides_active ON public.homepage_slides(is_active);
