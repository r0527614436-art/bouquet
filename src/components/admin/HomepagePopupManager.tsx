import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PopupSettingsForm from './PopupSettingsForm';
import { useUndo } from '@/contexts/UndoContext';

interface PopupRow {
  id: string;
  page_path: string;
  is_active: boolean;
  title: string;
  body_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  overlay_opacity: number;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'דף הבית',
  '/catalog': 'קטלוג',
  '/about': 'אודות',
  '/contact': 'צור קשר',
  '/order': 'הזמנה מהירה',
};

const labelForPath = (path: string) => PAGE_LABELS[path] || path;

const HomepagePopupManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pushUndo } = useUndo();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: popups = [] } = useQuery({
    queryKey: ['popups-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popups')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as PopupRow[];
    },
  });

  useEffect(() => {
    if (popups.length && (!activeId || !popups.find((p) => p.id === activeId))) {
      setActiveId(popups[0].id);
    }
  }, [popups, activeId]);

  const addMutation = useMutation({
    mutationFn: async () => {
      // pick a page_path that doesn't already exist
      const used = new Set(popups.map((p) => p.page_path));
      const candidates = ['/', '/catalog', '/about', '/contact', '/order'];
      const free = candidates.find((c) => !used.has(c));
      const page_path = free || `/new-${Date.now()}`;
      const { data, error } = await supabase
        .from('popups')
        .insert({
          page_path,
          is_active: false,
          title: 'כותרת חדשה',
          body_text: '',
          button_text: 'להמשך',
          button_link: page_path,
          image_url: '',
          overlay_opacity: 30,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PopupRow;
    },
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ['popups-admin'] });
      queryClient.invalidateQueries({ queryKey: ['popups-public'] });
      setActiveId(row.id);
      pushUndo({
        label: `הוספת פופאפ (${row.page_path})`,
        run: async () => {
          await supabase.from('popups').delete().eq('id', row.id);
          queryClient.invalidateQueries({ queryKey: ['popups-admin'] });
          queryClient.invalidateQueries({ queryKey: ['popups-public'] });
        },
      });
      toast({ title: 'פופאפ חדש נוצר' });
    },
    onError: (err: any) => {
      toast({ title: 'שגיאה ביצירה', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ניהול פופאפים</span>
          <Button
            size="sm"
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 ml-1" />
            הוסף פופאפ
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {popups.length === 0 ? (
          <p className="text-sm text-gray-500">אין פופאפים. לחץ על "הוסף פופאפ" כדי ליצור.</p>
        ) : (
          <Tabs value={activeId || undefined} onValueChange={setActiveId} dir="rtl">
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {popups.map((p) => (
                <TabsTrigger key={p.id} value={p.id}>
                  {labelForPath(p.page_path)}
                  {!p.is_active && <span className="text-xs text-gray-400 mr-1">(כבוי)</span>}
                </TabsTrigger>
              ))}
            </TabsList>
            {popups.map((p) => (
              <TabsContent key={p.id} value={p.id}>
                <PopupSettingsForm popup={p} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default HomepagePopupManager;
