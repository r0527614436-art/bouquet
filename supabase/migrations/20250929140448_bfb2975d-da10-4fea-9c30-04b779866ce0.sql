-- Create public bucket for catalog PDFs (using older Postgres syntax compatible with Supabase)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'catalog-pdfs') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('catalog-pdfs', 'catalog-pdfs', true);
    END IF;
END
$$;

-- Allow public read access to catalog PDFs
DROP POLICY IF EXISTS "Catalog PDFs are publicly accessible" ON storage.objects;
CREATE POLICY "Catalog PDFs are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'catalog-pdfs');

-- Allow uploads to catalog PDFs bucket
DROP POLICY IF EXISTS "Anyone can upload catalog PDFs" ON storage.objects;
CREATE POLICY "Anyone can upload catalog PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'catalog-pdfs');

-- Allow updates to catalog PDFs bucket (for upserts)
DROP POLICY IF EXISTS "Anyone can update catalog PDFs" ON storage.objects;
CREATE POLICY "Anyone can update catalog PDFs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'catalog-pdfs');