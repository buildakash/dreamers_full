
-- Enable RLS on applications table (if not already enabled)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert applications (public form)
CREATE POLICY "Anyone can submit applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to read applications (for success page)
CREATE POLICY "Anyone can view applications" 
ON public.applications 
FOR SELECT 
USING (true);

-- Create policy to allow updates (for admin approval process)
CREATE POLICY "Anyone can update applications" 
ON public.applications 
FOR UPDATE 
USING (true);
