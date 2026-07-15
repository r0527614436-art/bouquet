import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUndo } from '@/contexts/UndoContext';

export const useAdminItems = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pushUndo } = useUndo();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const createItemMutation = useMutation({
    mutationFn: async (item: { category_id: string; title?: string; price: string; image_url: string; filter_tags?: Record<string, string> }) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .insert([{ ...item, title: item.title || '' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      invalidate();
      if (data?.id) {
        pushUndo({
          label: `הוספת פריט${data.title ? `: ${data.title}` : ''}`,
          run: async () => {
            await supabase.from('catalog_items').delete().eq('id', data.id);
            invalidate();
          },
        });
      }
      toast({ title: 'הצלחה', description: 'הפריט נוסף בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'שגיאה בהוספת הפריט' });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...item }: { id: string; category_id: string; title: string; price: string; image_url: string; filter_tags?: Record<string, string> }) => {
      const { data: prev } = await supabase.from('catalog_items').select('*').eq('id', id).single();
      const { data, error } = await supabase
        .from('catalog_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, prev } as any;
    },
    onSuccess: (result: any) => {
      invalidate();
      const prev = result?.prev;
      if (prev) {
        pushUndo({
          label: `עדכון פריט${prev.title ? `: ${prev.title}` : ''}`,
          run: async () => {
            await supabase
              .from('catalog_items')
              .update({
                category_id: prev.category_id,
                title: prev.title,
                price: prev.price,
                image_url: prev.image_url,
                filter_tags: prev.filter_tags,
                subcategory: prev.subcategory,
                display_order: prev.display_order,
              })
              .eq('id', prev.id);
            invalidate();
          },
        });
      }
      toast({ title: 'הצלחה', description: 'הפריט עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'שגיאה בעדכון הפריט' });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: prev } = await supabase.from('catalog_items').select('*').eq('id', id).single();
      const { error } = await supabase.from('catalog_items').delete().eq('id', id);
      if (error) throw error;
      return { prev } as any;
    },
    onSuccess: (result: any) => {
      invalidate();
      const prev = result?.prev;
      if (prev) {
        pushUndo({
          label: `מחיקת פריט${prev.title ? `: ${prev.title}` : ''}`,
          run: async () => {
            await supabase.from('catalog_items').insert(prev);
            invalidate();
          },
        });
      }
      toast({ title: 'הצלחה', description: 'הפריט נמחק בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'שגיאה במחיקת הפריט' });
    },
  });

  const updateItemOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { data: prev } = await supabase
        .from('catalog_items')
        .select('display_order, title')
        .eq('id', id)
        .single();
      const { error } = await supabase.rpc('update_item_display_order', {
        item_id: id,
        new_order: newOrder,
      });
      if (error) throw error;
      return { id, prev } as any;
    },
    onSuccess: (result: any) => {
      invalidate();
      const { id, prev } = result || {};
      if (prev && typeof prev.display_order === 'number') {
        pushUndo({
          label: `שינוי סדר פריט${prev.title ? `: ${prev.title}` : ''}`,
          run: async () => {
            await supabase.rpc('update_item_display_order', {
              item_id: id,
              new_order: prev.display_order,
            });
            invalidate();
          },
        });
      }
      toast({ title: 'הצלחה', description: 'סדר הפריטים עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'שגיאה בעדכון סדר הפריטים' });
    },
  });

  const clearItemFiltersMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: prev } = await supabase
        .from('catalog_items')
        .select('filter_tags, title')
        .eq('id', id)
        .single();
      const { data, error } = await supabase
        .from('catalog_items')
        .update({ filter_tags: {} })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, prev, id } as any;
    },
    onSuccess: (result: any) => {
      invalidate();
      const { id, prev } = result || {};
      if (prev) {
        pushUndo({
          label: `הסרת מסננים${prev.title ? ` מפריט ${prev.title}` : ''}`,
          run: async () => {
            await supabase
              .from('catalog_items')
              .update({ filter_tags: prev.filter_tags || {} })
              .eq('id', id);
            invalidate();
          },
        });
      }
      toast({ title: 'הצלחה', description: 'המסננים הוסרו מהפריט בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'שגיאה בהסרת המסננים מהפריט' });
    },
  });

  return {
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    updateItemOrderMutation,
    clearItemFiltersMutation,
  };
};
