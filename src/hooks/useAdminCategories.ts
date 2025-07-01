
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Creating category with name:', name);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }
      
      console.log('Category created successfully:', data);
      return data;
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
    onError: (error) => {
      console.error('Category mutation error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת הקטגוריה: " + (error.message || 'שגיאה לא ידועה')
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      console.log('Updating category:', id, name);
      
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }
      
      console.log('Category updated successfully:', data);
      return data;
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
    onError: (error) => {
      console.error('Update category mutation error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון הקטגוריה: " + (error.message || 'שגיאה לא ידועה')
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting category:', id);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
      
      console.log('Category deleted successfully');
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
    onError: (error) => {
      console.error('Delete category mutation error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הקטגוריה: " + (error.message || 'שגיאה לא ידועה')
      });
    }
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation
  };
};
