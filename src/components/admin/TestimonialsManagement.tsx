import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  author_name: string;
  content: string;
  order_index: number;
  is_active: boolean;
}

const TestimonialsManagement = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    content: '',
    order_index: 1,
    is_active: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [] } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newTestimonial: typeof formData) => {
      const { error } = await supabase
        .from('testimonials')
        .insert([newTestimonial]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast({ title: "המלצה נוספה בהצלחה" });
      setIsAdding(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "שגיאה בהוספת המלצה", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Testimonial> }) => {
      const { error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast({ title: "המלצה עודכנה בהצלחה" });
      setEditingId(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "שגיאה בעדכון המלצה", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast({ title: "המלצה נמחקה בהצלחה" });
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת המלצה", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      author_name: '',
      content: '',
      order_index: 1,
      is_active: true
    });
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      author_name: testimonial.author_name,
      content: testimonial.content,
      order_index: testimonial.order_index,
      is_active: testimonial.is_active
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-pink-800">ניהול המלצות</CardTitle>
          {!isAdding && !editingId && (
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף המלצה
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(isAdding || editingId) && (
          <div className="mb-6 p-4 border border-pink-200 rounded-lg bg-pink-50">
            <h3 className="text-lg font-semibold mb-4 text-pink-800">
              {editingId ? 'ערוך המלצה' : 'הוסף המלצה חדשה'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="author_name">שם הממליץ</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="מירי"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content">תוכן ההמלצה</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="תוכן ההמלצה..."
                  rows={6}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="order_index">מיקום</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">פעיל</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 ml-2" />
                  שמור
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 ml-2" />
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-pink-700">{testimonial.author_name}</h4>
                  <p className="text-sm text-gray-500">מיקום: {testimonial.order_index}</p>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{testimonial.content}</p>
                </div>
                <div className="flex gap-2 mr-4">
                  <Button
                    onClick={() => handleEdit(testimonial)}
                    variant="outline"
                    size="sm"
                    disabled={editingId !== null || isAdding}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(testimonial.id)}
                    variant="destructive"
                    size="sm"
                    disabled={editingId !== null || isAdding}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded ${testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {testimonial.is_active ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsManagement;
