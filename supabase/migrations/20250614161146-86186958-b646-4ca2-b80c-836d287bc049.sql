
-- Update applications table to have better status tracking (only add columns that don't exist)
DO $$ 
BEGIN
    -- Add approved_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'approved_at') THEN
        ALTER TABLE public.applications ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add rejected_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'rejected_at') THEN
        ALTER TABLE public.applications ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.applications ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Update the status constraint to include 'submitted'
ALTER TABLE public.applications 
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
  ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'submitted'));

-- Set default status to 'pending' for existing applications where status is null
UPDATE public.applications SET status = 'pending' WHERE status IS NULL;
