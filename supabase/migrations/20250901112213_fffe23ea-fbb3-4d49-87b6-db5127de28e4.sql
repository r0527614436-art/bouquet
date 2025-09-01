-- Fix security issues by setting search_path on functions

-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS generate_item_title() CASCADE;
DROP FUNCTION IF EXISTS reorder_item_titles_after_delete() CASCADE;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION generate_item_title()
RETURNS TRIGGER AS $$
DECLARE
    category_index integer;
    item_count integer;
    new_title text;
BEGIN
    -- Only apply to new items without a title or with empty title
    IF NEW.title IS NULL OR NEW.title = '' THEN
        -- Get the category's position (1-based index)
        SELECT 
            row_number() OVER (ORDER BY created_at)
        INTO category_index
        FROM categories 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION reorder_item_titles_after_delete()
RETURNS TRIGGER AS $$
DECLARE
    category_index integer;
    item_record RECORD;
    counter integer := 1;
BEGIN
    -- Get the category's position (1-based index)
    SELECT 
        row_number() OVER (ORDER BY created_at)
    INTO category_index
    FROM categories 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER auto_number_items
    BEFORE INSERT ON catalog_items
    FOR EACH ROW
    EXECUTE FUNCTION generate_item_title();

CREATE TRIGGER reorder_items_after_delete
    AFTER DELETE ON catalog_items
    FOR EACH ROW
    EXECUTE FUNCTION reorder_item_titles_after_delete();