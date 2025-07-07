
-- Update existing images to use Supabase storage bucket URLs
UPDATE public.homepage_slides 
SET image_url = 'https://iwxzivzomvjocjbcsafb.supabase.co/storage/v1/object/public/homepage-slides/' || 
  CASE 
    WHEN image_url = '/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png' THEN '1f77b92c-020c-41ff-b94d-9b5e6d302d98.png'
    WHEN image_url = '/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png' THEN '46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png'
    WHEN image_url = '/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png' THEN '90a3731f-9a7c-492b-9345-f78bd924c8eb.png'
    WHEN image_url = '/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png' THEN 'ece817b9-a53c-4ab8-a2b0-654f1256f4af.png'
    WHEN image_url = '/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png' THEN 'ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png'
    ELSE image_url
  END
WHERE image_url LIKE '/lovable-uploads/%';
