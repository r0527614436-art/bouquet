-- Add subcategories column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS subcategories jsonb DEFAULT '[]'::jsonb;