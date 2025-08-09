-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron job to run every 5 days
SELECT cron.schedule(
    'send-maintenance-order',
    '0 0 */5 * *', -- Run at midnight every 5 days
    $$
    SELECT
      net.http_post(
          url:='https://iwxzivzomvjocjbcsafb.supabase.co/functions/v1/send-maintenance-order',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eHppdnpvbXZqb2NqYmNzYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODU1MTcsImV4cCI6MjA2Njg2MTUxN30.NvYjt2H4lKAK6OjPBGJO-VGjwAslEW1-6nyEC0jeOY8"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
      ) as request_id;
    $$
);