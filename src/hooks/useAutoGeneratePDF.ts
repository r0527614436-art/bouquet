import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoGeneratePDF = () => {
  const { toast } = useToast();

  useEffect(() => {
    const generateHTML = async () => {
      try {
        console.log('Auto-generating catalog HTML...');
        await supabase.functions.invoke('generate-catalog-html');
        console.log('HTML generated successfully');
      } catch (error) {
        console.error('Error auto-generating HTML:', error);
      }
    };

    // Generate HTML on mount
    generateHTML();

    // Set up real-time subscriptions for changes
    const itemsSubscription = supabase
      .channel('catalog_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'catalog_items' }, 
        () => {
          console.log('Catalog items changed, regenerating HTML...');
          generateHTML();
        }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        () => {
          console.log('Categories changed, regenerating HTML...');
          generateHTML();
        }
      )
      .subscribe();

    return () => {
      itemsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, []);

  return null;
};