-- Create admin_settings table for storing admin password
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password TEXT NOT NULL DEFAULT '123456',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO public.admin_settings (id, password) VALUES (1, '123456')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to verify password (read-only for verification)
CREATE POLICY "Allow password verification" 
ON public.admin_settings 
FOR SELECT 
USING (true);

-- Allow anyone to update password (will be protected by old password check in edge function)
CREATE POLICY "Allow password update" 
ON public.admin_settings 
FOR UPDATE 
USING (true);