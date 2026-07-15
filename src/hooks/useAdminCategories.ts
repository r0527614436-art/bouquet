
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUndo } from '@/contexts/UndoContext';

export const useAdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pushUndo } = useUndo();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (category: { name: string; subtitle: string | null; allow_cart: boolean; subcategories?: string[] }) => {
      console.log('Creating category with data:', category);
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert([category])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error creating category:', error);
          throw new Error(error.message || 'שגיאה ביצירת הקטגוריה');
        }
        
        console.log('Category created successfully:', data);
        return data;
      } catch (error: any) {
        console.error('Error in createCategoryMutation:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log('Category mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (data?.id) {
        pushUndo({
          label: `הוספת קטגוריה: ${data.name}`,
          run: async () => {
            await supabase.from('categories').delete().eq('id', data.id);
            invalidateAll();
          },
        });
      }
      toast({
        title: "הצלחה",
        description: "הקטגוריה נוספה בהצלחה"
      });
    },
    onError: (error: any) => {
      console.error('Category mutation error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת הקטגוריה: " + (error?.message || 'שגיאה לא ידועה'),
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name, subtitle, allow_cart, subcategories }: { id: string; name: string; subtitle: string | null; allow_cart: boolean; subcategories?: string[] }) => {
      console.log('Updating category:', id, { name, subtitle, allow_cart });
      
      try {
        const { data: prev } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        const { data, error } = await supabase
          .from('categories')
          .update({ name, subtitle, allow_cart, subcategories })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error updating category:', error);
          throw new Error(error.message || 'שגיאה בעדכון הקטגוריה');
        }
        
        console.log('Category updated successfully:', data);
        return { data, prev };
      } catch (error: any) {
        console.error('Error in updateCategoryMutation:', error);
        throw error;
      }
    },
    onSuccess: (result: any) => {
      const { data, prev } = result || {};
      console.log('Update category mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (prev) {
        pushUndo({
          label: `עדכון קטגוריה: ${prev.name}`,
          run: async () => {
            await supabase
              .from('categories')
              .update({
                name: prev.name,
                subtitle: prev.subtitle,
                allow_cart: prev.allow_cart,
                subcategories: prev.subcategories,
                filters: prev.filters,
              })
              .eq('id', prev.id);
            invalidateAll();
          },
        });
      }
      toast({
        title: "הצלחה",
        description: "הקטגוריה עודכנה בהצלחה"
      });
    },
    onError: (error: any) => {
      console.error('Update category mutation error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון הקטגוריה: " + (error?.message || 'שגיאה לא ידועה'),
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting category:', id);
      
      try {
        // Capture the full category row + all its catalog items so undo can restore both.
        const { data: prevCategory } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        const { data: prevItems } = await supabase
          .from('catalog_items')
          .select('*')
          .eq('category_id', id);

        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Supabase error deleting category:', error);
          throw new Error(error.message || 'שגיאה במחיקת הקטגוריה');
        }
        
        console.log('Category deleted successfully');
        return { prevCategory, prevItems };
      } catch (error: any) {
        console.error('Error in deleteCategoryMutation:', error);
        throw error;
      }
    },
    onSuccess: (result: any) => {
      const { prevCategory, prevItems } = result || {};
      console.log('Delete category mutation successful');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (prevCategory) {
        pushUndo({
          label: `מחיקת קטגוריה: ${prevCategory.name}`,
          run: async () => {
            await supabase.from('categories').insert(prevCategory);
            if (Array.isArray(prevItems) && prevItems.length) {
              await supabase.from('catalog_items').insert(prevItems);
            }
            invalidateAll();
          },
        });
      }
      toast({
        title: "הצלחה",
        description: "הקטגוריה נמחקה בהצלחה"
      });
    },
    onError: (error: any) => {
      console.error('Delete category mutation error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הקטגוריה: " + (error?.message || 'שגיאה לא ידועה'),
        variant: "destructive"
      });
    }
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation
  };
};
