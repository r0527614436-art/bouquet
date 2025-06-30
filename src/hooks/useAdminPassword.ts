
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminPassword = () => {
  const { toast } = useToast();

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert([{ id: 1, password: newPassword }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "הצלחה",
        description: "הסיסמה שונתה בהצלחה"
      });
    }
  });

  return {
    updatePasswordMutation
  };
};
