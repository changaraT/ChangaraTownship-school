-- Create school_food_items table for tracking food items that contribute to school fees
CREATE TABLE IF NOT EXISTS public.school_food_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_food_items_name ON public.school_food_items(name);
-- Enable RLS (Row Level Security)
ALTER TABLE public.school_food_items ENABLE ROW LEVEL SECURITY;
-- Policy: Allow headteachers to manage food items
CREATE POLICY "headteachers_can_manage_food_items" ON public.school_food_items FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.id = auth.uid()
            AND users.role = 'headteacher'
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.id = auth.uid()
            AND users.role = 'headteacher'
    )
);
-- Policy: Allow all authenticated users to read food items
CREATE POLICY "all_authenticated_can_read_food_items" ON public.school_food_items FOR
SELECT USING (auth.role() = 'authenticated');
-- Add comment for documentation
COMMENT ON TABLE public.school_food_items IS 'Stores school food items (e.g., maize, beans) that students can purchase as additional fees';
COMMENT ON COLUMN public.school_food_items.name IS 'Food item name (e.g., "Maize", "Beans")';
COMMENT ON COLUMN public.school_food_items.unit_price IS 'Price per unit of food item';
COMMENT ON COLUMN public.school_food_items.description IS 'Optional description of the food item';