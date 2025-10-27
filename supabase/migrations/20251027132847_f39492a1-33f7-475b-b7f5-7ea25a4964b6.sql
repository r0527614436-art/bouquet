-- Create testimonials table
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  author_name text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (true);