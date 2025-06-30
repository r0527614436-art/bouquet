
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Item {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  price: string;
}

export const useAdminItems = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createItemMutation = useMutation({
    mutationFn: async (item: Omit<Item, 'id'>) => {
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
      toast({
        title: "הצלחה",
        description: "הפריט נוסף בהצלחה"
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: Item) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .update({
          title: item.title,
          price: item.price,
          image_url: item.image_url,
          category_id: item.category_id
        })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      toast({
        title: "הצלחה",
        description: "הפריט עודכן בהצלחה"
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
      toast({
        title: "הצלחה",
        description: "הפריט נמחק בהצלחה"
      });
    }
  });

  return {
    createItemMutation,
    updateItemMutation,
    deleteItemMutation
  };
};
