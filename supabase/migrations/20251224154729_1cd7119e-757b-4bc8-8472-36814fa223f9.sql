-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow password verification" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow password update" ON public.admin_settings;
DROP POLICY IF EXISTS "Anyone can manage admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Anyone can view admin settings" ON public.admin_settings;

-- Create restrictive policy - no public access (edge functions use service_role_key which bypasses RLS)
-- This means only server-side code can access this table
CREATE POLICY "No public access to admin settings" 
ON public.admin_settings 
FOR ALL 
USING (false);