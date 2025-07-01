
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Creating category with name:', name);
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name }])
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
    onSuccess: (data) => {
      console.log('Category mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      console.log('Updating category:', id, name);
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .update({ name })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error updating category:', error);
          throw new Error(error.message || 'שגיאה בעדכון הקטגוריה');
        }
        
        console.log('Category updated successfully:', data);
        return data;
      } catch (error: any) {
        console.error('Error in updateCategoryMutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Update category mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Supabase error deleting category:', error);
          throw new Error(error.message || 'שגיאה במחיקת הקטגוריה');
        }
        
        console.log('Category deleted successfully');
      } catch (error: any) {
        console.error('Error in deleteCategoryMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Delete category mutation successful');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
