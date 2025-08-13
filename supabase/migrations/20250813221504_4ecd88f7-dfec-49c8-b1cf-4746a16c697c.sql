-- Add subtitle and allow_cart fields to categories table
ALTER TABLE public.categories 
ADD COLUMN subtitle TEXT,
ADD COLUMN allow_cart BOOLEAN NOT NULL DEFAULT true;