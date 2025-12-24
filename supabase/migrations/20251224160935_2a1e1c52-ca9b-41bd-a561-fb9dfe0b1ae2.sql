-- Remove the default password value from the column definition
-- The password already exists in the table, this just removes it from the schema definition
ALTER TABLE public.admin_settings 
ALTER COLUMN password DROP DEFAULT;