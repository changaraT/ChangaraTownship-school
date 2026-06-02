-- Add optional free-text note for food brought by learner (in words)
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS food_brought_text TEXT DEFAULT NULL;

COMMENT ON COLUMN public.fees.food_brought_text IS 'Optional note entered by headteacher describing food learner brought (free text)';

