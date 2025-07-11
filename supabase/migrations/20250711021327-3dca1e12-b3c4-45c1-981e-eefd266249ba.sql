
-- Create a storage bucket for catalog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalog-images', 'catalog-images', true);

-- Create policy to allow anyone to view catalog images
CREATE POLICY "Anyone can view catalog images" ON storage.objects
FOR SELECT USING (bucket_id = 'catalog-images');

-- Create policy to allow upload of catalog images (admin access)
CREATE POLICY "Admin can upload catalog images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'catalog-images');

-- Create policy to allow update of catalog images (admin access)
CREATE POLICY "Admin can update catalog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'catalog-images');

-- Create policy to allow delete of catalog images (admin access)
CREATE POLICY "Admin can delete catalog images" ON storage.objects
FOR DELETE USING (bucket_id = 'catalog-images');
