import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HomepageSlide {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

const HomepageSlideManagement = () => {
  const [editingSlide, setEditingSlide] = useState<HomepageSlide | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['homepage-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_slides')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `slide-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('homepage-slides')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('homepage-slides')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const addSlideMutation = useMutation({
    mutationFn: async (slideData: { title: string; description: string; image_url: string; order_index: number }) => {
      const { error } = await supabase
        .from('homepage_slides')
        .insert([slideData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slides'] });
      setIsAddDialogOpen(false);
      toast({ title: "התמונה נוספה בהצלחה!" });
    },
    onError: (error: any) => {
      toast({ title: "שגיאה בהוספת התמונה", description: error.message, variant: "destructive" });
    }
  });

  const updateSlideMutation = useMutation({
    mutationFn: async (slideData: HomepageSlide) => {
      const { error } = await supabase
        .from('homepage_slides')
        .update({
          title: slideData.title,
          description: slideData.description,
          image_url: slideData.image_url,
          order_index: slideData.order_index
        })
        .eq('id', slideData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slides'] });
      setIsEditDialogOpen(false);
      setEditingSlide(null);
      toast({ title: "התמונה עודכנה בהצלחה!" });
    },
    onError: (error: any) => {
      toast({ title: "שגיאה בעדכון התמונה", description: error.message, variant: "destructive" });
    }
  });

  const deleteSlideMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_slides')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slides'] });
      toast({ title: "התמונה נמחקה בהצלחה!" });
    },
    onError: (error: any) => {
      toast({ title: "שגיאה במחיקת התמונה", description: error.message, variant: "destructive" });
    }
  });

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      setUploading(true);
      const imageUrl = await uploadImage(file);
      callback(imageUrl);
    } catch (error: any) {
      toast({ title: "שגיאה בהעלאת התמונה", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const AddSlideDialog = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [orderIndex, setOrderIndex] = useState(slides.length + 1);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !imageUrl) return;
      
      addSlideMutation.mutate({
        title,
        description,
        image_url: imageUrl,
        order_index: orderIndex
      });
    };

    return (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 ml-2" />
            הוסף תמונה
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>הוסף תמונה חדשה לדף הבית</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="הכנס כותרת..."
                required
              />
            </div>
            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="הכנס תיאור..."
              />
            </div>
            <div>
              <Label htmlFor="image">תמונה</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, setImageUrl);
                  }
                }}
                disabled={uploading}
              />
              {imageUrl && (
                <img src={imageUrl} alt="תצוגה מקדימה" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>
            <div>
              <Label htmlFor="order">מיקום בסדר</Label>
              <Input
                id="order"
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                min={1}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!title || !imageUrl || uploading || addSlideMutation.isPending}
              className="w-full"
            >
              {uploading ? 'מעלה תמונה...' : addSlideMutation.isPending ? 'מוסיף...' : 'הוסף תמונה'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditSlideDialog = () => {
    if (!editingSlide) return null;

    const [title, setTitle] = useState(editingSlide.title);
    const [description, setDescription] = useState(editingSlide.description || '');
    const [imageUrl, setImageUrl] = useState(editingSlide.image_url);
    const [orderIndex, setOrderIndex] = useState(editingSlide.order_index);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !imageUrl) return;
      
      updateSlideMutation.mutate({
        ...editingSlide,
        title,
        description,
        image_url: imageUrl,
        order_index: orderIndex
      });
    };

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ערוך תמונה</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">כותרת</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="הכנס כותרת..."
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">תיאור</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="הכנס תיאור..."
              />
            </div>
            <div>
              <Label htmlFor="edit-image">תמונה חדשה (אופציונלי)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, setImageUrl);
                  }
                }}
                disabled={uploading}
              />
              {imageUrl && (
                <img src={imageUrl} alt="תצוגה מקדימה" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>
            <div>
              <Label htmlFor="edit-order">מיקום בסדר</Label>
              <Input
                id="edit-order"
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                min={1}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!title || !imageUrl || uploading || updateSlideMutation.isPending}
              className="w-full"
            >
              {uploading ? 'מעלה תמונה...' : updateSlideMutation.isPending ? 'מעדכן...' : 'עדכן תמונה'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) return <div>טוען...</div>;

  return (
    <div className="mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ניהול תמונות דף הבית</CardTitle>
          <AddSlideDialog />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {slides.map((slide) => (
              <div key={slide.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 border rounded-lg">
                <img 
                  src={slide.image_url} 
                  alt={slide.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{slide.title}</h3>
                  <p className="text-sm text-gray-600">{slide.description}</p>
                  <p className="text-xs text-gray-400">סדר: {slide.order_index}</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingSlide(slide);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSlideMutation.mutate(slide.id)}
                    disabled={deleteSlideMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <EditSlideDialog />
    </div>
  );
};

export default HomepageSlideManagement;
