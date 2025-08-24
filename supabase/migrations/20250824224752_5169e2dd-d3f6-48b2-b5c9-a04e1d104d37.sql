-- Add font_family field to homepage_slides table
ALTER TABLE public.homepage_slides 
ADD COLUMN font_family text DEFAULT 'font-sans';