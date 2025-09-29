import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoGeneratePDF = () => {
  const { toast } = useToast();

  useEffect(() => {
    const generatePDF = async () => {
      try {
        console.log('Auto-generating catalog PDF...');
        await supabase.functions.invoke('generate-catalog-pdf');
        console.log('PDF generated successfully');
      } catch (error) {
        console.error('Error auto-generating PDF:', error);
      }
    };

    // Generate PDF on mount
    generatePDF();

    // Set up real-time subscriptions for changes
    const itemsSubscription = supabase
      .channel('catalog_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'catalog_items' }, 
        () => {
          console.log('Catalog items changed, regenerating PDF...');
          generatePDF();
        }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        () => {
          console.log('Categories changed, regenerating PDF...');
          generatePDF();
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