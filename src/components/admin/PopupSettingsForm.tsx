import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PopupRow {
  id: string;
  is_active: boolean;
  title: string;
  body_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  overlay_opacity: number;
}

interface Props {
  tableName: 'homepage_popup' | 'catalog_popup';
  queryKey: string;
  publicQueryKey: string;
}

const PopupSettingsForm: React.FC<Props> = ({ tableName, queryKey, publicQueryKey }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<PopupRow | null>(null);

  const { data } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PopupRow | null;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['popup-admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const PRESET_PAGES = [
    { label: 'דף הבית', value: '/' },
    { label: 'קטלוג (הכל)', value: '/catalog' },
    { label: 'אודות', value: '/about' },
    { label: 'צור קשר', value: '/contact' },
    { label: 'עגלת קניות', value: '/cart' },
  ];

  const linkPresets = [
    ...PRESET_PAGES,
    ...categories.map((c) => ({
      label: `קטלוג — ${c.name}`,
      value: `/catalog?category=${encodeURIComponent(c.name)}`,
    })),
  ];

  const currentPresetValue =
    form && linkPresets.some((p) => p.value === form.button_link)
      ? form.button_link
      : '__custom__';

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: async (row: PopupRow) => {
      const { error } = await (supabase as any)
        .from(tableName)
        .update({
          is_active: row.is_active,
          title: row.title,
          body_text: row.body_text,
          button_text: row.button_text,
          button_link: row.button_link,
          image_url: row.image_url,
          overlay_opacity: row.overlay_opacity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: [publicQueryKey] });
      toast({ title: 'הפופאפ נשמר בהצלחה!' });
    },
    onError: (err: any) => {
      toast({ title: 'שגיאה בשמירה', description: err.message, variant: 'destructive' });
    },
  });

  const compressToWebP = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 1400;
          const scale = Math.min(1, maxW / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('no canvas context'));
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob failed'))), 'image/webp', 0.8);
        };
        img.onerror = () => reject(new Error('image load failed'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(file);
    });

  const handleUpload = async (file: File) => {
    if (!form) return;
    try {
      setUploading(true);
      const webp = await compressToWebP(file);
      const fileName = `${tableName}-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error } = await supabase.storage
        .from('homepage-slides')
        .upload(fileName, webp, { cacheControl: '3600', upsert: false, contentType: 'image/webp' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('homepage-slides').getPublicUrl(fileName);
      setForm({ ...form, image_url: urlData.publicUrl });
      toast({ title: 'התמונה הועלתה בהצלחה!' });
    } catch (err: any) {
      toast({ title: 'שגיאה בהעלאה', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (!form) return <div>טוען...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 text-sm">
        <Label htmlFor={`is_active_${tableName}`}>פעיל</Label>
        <Switch
          id={`is_active_${tableName}`}
          checked={form.is_active}
          onCheckedChange={(v) => setForm({ ...form, is_active: v })}
        />
      </div>
      <div>
        <Label>כותרת</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label>טקסט תוכן</Label>
        <Textarea
          rows={4}
          value={form.body_text}
          onChange={(e) => setForm({ ...form, body_text: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>טקסט הכפתור</Label>
          <Input
            value={form.button_text}
            onChange={(e) => setForm({ ...form, button_text: e.target.value })}
          />
        </div>
        <div>
          <Label>יעד הכפתור</Label>
          <Select
            value={currentPresetValue}
            onValueChange={(v) => {
              if (v === '__custom__') return;
              setForm({ ...form, button_link: v });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר עמוד או קטגוריה" />
            </SelectTrigger>
            <SelectContent className="max-h-72 bg-white z-[10000]">
              {linkPresets.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
              <SelectItem value="__custom__">קישור מותאם אישית...</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="mt-2"
            value={form.button_link}
            onChange={(e) => setForm({ ...form, button_link: e.target.value })}
            placeholder="/catalog או https://..."
            dir="ltr"
          />
        </div>
      </div>
      <div>
        <Label>תמונת רקע</Label>
        {form.image_url && (
          <img src={form.image_url} alt="preview" className="w-full max-w-md h-40 object-cover rounded border mb-2" />
        )}
        <Input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        {uploading && <p className="text-sm text-blue-600 mt-1">מעלה תמונה...</p>}
      </div>
      <div>
        <Label>עוצמת השכבה האפורה מעל התמונה: {form.overlay_opacity}%</Label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={form.overlay_opacity}
          onChange={(e) => setForm({ ...form, overlay_opacity: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="mt-2 h-16 rounded border overflow-hidden relative">
          {form.image_url && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${form.image_url}')` }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(128,128,128,${form.overlay_opacity / 100})` }}
          />
        </div>
      </div>
      <Button
        onClick={() => saveMutation.mutate(form)}
        disabled={saveMutation.isPending || uploading}
        className="bg-pink-600 hover:bg-pink-700"
      >
        {saveMutation.isPending ? 'שומר...' : 'שמור שינויים'}
      </Button>
    </div>
  );
};

export default PopupSettingsForm;