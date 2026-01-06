
-- Drop the existing function first
DROP FUNCTION IF EXISTS update_item_display_order(uuid, integer);

-- Create improved function that shifts other items automatically
CREATE OR REPLACE FUNCTION update_item_display_order(
  item_id uuid,
  new_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_order integer;
  item_category_id uuid;
BEGIN
  -- Get current order and category of the item
  SELECT display_order, category_id INTO current_order, item_category_id
  FROM catalog_items
  WHERE id = item_id;

  -- If item not found, exit
  IF current_order IS NULL THEN
    RETURN;
  END IF;

  -- If order hasn't changed, exit
  IF current_order = new_order THEN
    RETURN;
  END IF;

  -- Shift other items in the same category
  IF new_order < current_order THEN
    -- Moving to a lower number: shift items between new and old position UP by 1
    UPDATE catalog_items
    SET display_order = display_order + 1
    WHERE category_id = item_category_id
      AND display_order >= new_order
      AND display_order < current_order
      AND id != item_id;
  ELSE
    -- Moving to a higher number: shift items between old and new position DOWN by 1
    UPDATE catalog_items
    SET display_order = display_order - 1
    WHERE category_id = item_category_id
      AND display_order > current_order
      AND display_order <= new_order
      AND id != item_id;
  END IF;

  -- Set the new order for the moved item
  UPDATE catalog_items
  SET display_order = new_order
  WHERE id = item_id;
END;
$$;
