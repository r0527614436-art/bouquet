
-- Create a table for homepage carousel slides
CREATE TABLE public.homepage_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the current homepage slides data
INSERT INTO public.homepage_slides (title, description, image_url, order_index) VALUES
('זרי כלה', 'זרי כלה מעוצבים במיוחד ליום המיוחד שלכם', '/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png', 1),
('זרי אירוסין', 'זרי פרחים מרהיבים לחגיגת האירוסין', '/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png', 2),
('סדנאות', 'סדנאות שזירת פרחים מקצועיות', '/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png', 3),
('הפקת אירועים', 'הפקת אירועים דתיים עם עיצוב פרחים מושלם', '/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png', 4),
('עיצוב מתנות', 'מתנות מעוצבות עם פרחים ושוקולדים', '/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png', 5);

-- Add Row Level Security (RLS) - making it public for now since it's homepage content
ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read homepage slides
CREATE POLICY "Anyone can view homepage slides" 
  ON public.homepage_slides 
  FOR SELECT 
  USING (true);

-- Create policy that allows admin operations (we'll handle admin auth in the app)
CREATE POLICY "Admin can manage homepage slides" 
  ON public.homepage_slides 
  FOR ALL 
  USING (true);
