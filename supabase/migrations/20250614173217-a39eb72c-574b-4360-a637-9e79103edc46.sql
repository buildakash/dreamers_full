
-- Add the startup-tvl incubation center with admin email
INSERT INTO public.incubation_centres (name, admin_email) 
VALUES ('startup-tvl', 'karthick3503@gmail.com')
ON CONFLICT (name) DO UPDATE SET admin_email = EXCLUDED.admin_email;
