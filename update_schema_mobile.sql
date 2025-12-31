-- Add mobile-specific portfolio columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS portfolio_mobile JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS allocations_mobile JSONB DEFAULT '[]';
