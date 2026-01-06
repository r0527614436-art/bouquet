-- 1. Add filters column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS filters jsonb DEFAULT '[]'::jsonb;

-- 2. Add filter_tags column to catalog_items table (to store which filters apply to each item)
ALTER TABLE public.catalog_items 
ADD COLUMN IF NOT EXISTS filter_tags jsonb DEFAULT '[]'::jsonb;

-- 3. Create or replace the update_item_display_order function to normalize order numbers
CREATE OR REPLACE FUNCTION public.update_item_display_order(item_id uuid, new_order integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_category_id uuid;
  target_subcategory text;
  current_order integer;
  item_record RECORD;
  counter integer := 1;
BEGIN
  -- Get the category and subcategory of the item being moved
  SELECT category_id, subcategory, display_order 
  INTO target_category_id, target_subcategory, current_order
  FROM catalog_items 
  WHERE id = item_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Update the target item's order
  UPDATE catalog_items 
  SET display_order = new_order 
  WHERE id = item_id;

  -- Renumber all items in the same category/subcategory to ensure sequential order
  FOR item_record IN 
    SELECT id 
    FROM catalog_items 
    WHERE category_id = target_category_id 
      AND (subcategory IS NOT DISTINCT FROM target_subcategory)
    ORDER BY display_order ASC, created_at ASC
  LOOP
    UPDATE catalog_items SET display_order = counter WHERE id = item_record.id;
    counter := counter + 1;
  END LOOP;
END;
$$;

-- 4. Create a trigger to set display_order for new items (append to end)
CREATE OR REPLACE FUNCTION public.set_item_display_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_order integer;
BEGIN
  -- Get the maximum display_order for items in the same category/subcategory
  SELECT COALESCE(MAX(display_order), 0) INTO max_order
  FROM catalog_items
  WHERE category_id = NEW.category_id
    AND (subcategory IS NOT DISTINCT FROM NEW.subcategory);
  
  -- Set the new item's display_order to be at the end
  NEW.display_order := max_order + 1;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS set_item_display_order_trigger ON catalog_items;

CREATE TRIGGER set_item_display_order_trigger
BEFORE INSERT ON catalog_items
FOR EACH ROW
EXECUTE FUNCTION public.set_item_display_order();