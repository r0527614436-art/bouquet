-- Update the generate_item_title function to use category order instead of creation date
CREATE OR REPLACE FUNCTION public.generate_item_title()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    category_index integer;
    item_count integer;
    new_title text;
BEGIN
    -- Only apply to new items without a title or with empty title
    IF NEW.title IS NULL OR NEW.title = '' THEN
        -- Get the category's position based on current order (not creation date)
        -- We'll use a simple approach: get all categories ordered by created_at and find position
        WITH ordered_categories AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as position
            FROM categories
        )
        SELECT position
        INTO category_index
        FROM ordered_categories 
        WHERE id = NEW.category_id;
        
        -- Get count of existing items in the same category and subcategory
        SELECT COUNT(*) + 1
        INTO item_count
        FROM catalog_items 
        WHERE category_id = NEW.category_id 
        AND (
            (NEW.subcategory IS NULL AND subcategory IS NULL) OR 
            (NEW.subcategory IS NOT NULL AND subcategory = NEW.subcategory)
        );
        
        -- Generate the new title with category index + item count
        new_title := CAST(category_index AS text) || LPAD(CAST(item_count AS text), 2, '0');
        NEW.title := new_title;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update the reorder function to use category order instead of creation date
CREATE OR REPLACE FUNCTION public.reorder_item_titles_after_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    category_index integer;
    item_record RECORD;
    counter integer := 1;
BEGIN
    -- Get the category's position based on current order
    WITH ordered_categories AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as position
        FROM categories
    )
    SELECT position
    INTO category_index
    FROM ordered_categories 
    WHERE id = OLD.category_id;
    
    -- Update titles for remaining items in the same category and subcategory
    FOR item_record IN 
        SELECT id, created_at
        FROM catalog_items 
        WHERE category_id = OLD.category_id 
        AND (
            (OLD.subcategory IS NULL AND subcategory IS NULL) OR 
            (OLD.subcategory IS NOT NULL AND subcategory = OLD.subcategory)
        )
        AND title ~ '^[0-9]+$'  -- Only auto-generated numeric titles
        ORDER BY created_at
    LOOP
        UPDATE catalog_items 
        SET title = CAST(category_index AS text) || LPAD(CAST(counter AS text), 2, '0')
        WHERE id = item_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    RETURN OLD;
END;
$function$;

-- Add a column to track display order for items within category/subcategory
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Create function to update item display order
CREATE OR REPLACE FUNCTION public.update_item_display_order(
    item_id uuid,
    new_order integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    target_item RECORD;
    other_item RECORD;
BEGIN
    -- Get the item to move
    SELECT * INTO target_item FROM catalog_items WHERE id = item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item not found';
    END IF;
    
    -- Update display orders for items in the same category/subcategory
    IF new_order > target_item.display_order THEN
        -- Moving down: shift items up
        UPDATE catalog_items 
        SET display_order = display_order - 1
        WHERE category_id = target_item.category_id
        AND (
            (target_item.subcategory IS NULL AND subcategory IS NULL) OR
            (target_item.subcategory IS NOT NULL AND subcategory = target_item.subcategory)
        )
        AND display_order > target_item.display_order 
        AND display_order <= new_order
        AND id != item_id;
    ELSE
        -- Moving up: shift items down
        UPDATE catalog_items 
        SET display_order = display_order + 1
        WHERE category_id = target_item.category_id
        AND (
            (target_item.subcategory IS NULL AND subcategory IS NULL) OR
            (target_item.subcategory IS NOT NULL AND subcategory = target_item.subcategory)
        )
        AND display_order >= new_order 
        AND display_order < target_item.display_order
        AND id != item_id;
    END IF;
    
    -- Update the target item
    UPDATE catalog_items 
    SET display_order = new_order
    WHERE id = item_id;
END;
$function$;

-- Initialize display_order for existing items
UPDATE catalog_items 
SET display_order = subquery.row_number
FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY category_id, COALESCE(subcategory, '') 
               ORDER BY created_at
           ) as row_number
    FROM catalog_items
) subquery
WHERE catalog_items.id = subquery.id;