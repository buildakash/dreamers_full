
-- First, let's restore some sample incubation centres for testing
INSERT INTO incubation_centres (name, admin_email) VALUES
('TechHub Incubator', 'admin@techhub.com'),
('Innovation Center', 'contact@innovationcenter.com'),
('Startup Accelerator', 'support@startupaccel.com');

-- Delete all applications to start fresh
DELETE FROM applications;

-- Also delete any approval tokens that might be linked to deleted applications
DELETE FROM approval_tokens;
