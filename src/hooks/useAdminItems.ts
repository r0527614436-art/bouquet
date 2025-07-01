
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminItems = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createItemMutation = useMutation({
    mutationFn: async (item: { category_id: string; title: string; price: string; image_url: string }) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "הצלחה",
        description: "הפריט נוסף בהצלחה"
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת הפריט"
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...item }: { id: string; category_id: string; title: string; price: string; image_url: string }) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "הצלחה",
        description: "הפריט עודכן בהצלחה"
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון הפריט"
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "הצלחה",
        description: "הפריט נמחק בהצלחה"
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הפריט"
      });
    }
  });

  return {
    createItemMutation,
    updateItemMutation,
    deleteItemMutation
  };
};
