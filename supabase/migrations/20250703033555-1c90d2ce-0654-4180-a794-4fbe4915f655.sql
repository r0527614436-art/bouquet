
-- Create a storage bucket for homepage slide images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homepage-slides', 'homepage-slides', true);

-- Create policy to allow anyone to view homepage slide images
CREATE POLICY "Anyone can view homepage slide images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-slides');

-- Create policy to allow upload of homepage slide images (admin access)
CREATE POLICY "Admin can upload homepage slide images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'homepage-slides');

-- Create policy to allow update of homepage slide images (admin access)
CREATE POLICY "Admin can update homepage slide images" ON storage.objects
FOR UPDATE USING (bucket_id = 'homepage-slides');

-- Create policy to allow delete of homepage slide images (admin access)
CREATE POLICY "Admin can delete homepage slide images" ON storage.objects
FOR DELETE USING (bucket_id = 'homepage-slides');
