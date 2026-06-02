-- Add food_items JSONB column to fees table to store food item purchases
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS food_items JSONB DEFAULT NULL;
-- Add tuition_amount column to separate tuition from total
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS tuition_amount DECIMAL(10, 2) DEFAULT NULL;
-- Create index on food_items for faster queries
CREATE INDEX IF NOT EXISTS idx_fees_food_items ON public.fees USING GIN (food_items);
-- Add comment for documentation
COMMENT ON COLUMN public.fees.food_items IS 'JSONB object storing food items purchased with format: {"item_name": {"quantity": num, "unit_price": num, "total": num}}';
COMMENT ON COLUMN public.fees.tuition_amount IS 'Portion of the total amount that is tuition (rest is food items)';