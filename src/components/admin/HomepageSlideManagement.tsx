
import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus } from 'lucide-react';
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
      if (error) {
        console.error('Error fetching slides:', error);
        throw error;
      }
      console.log('Fetched slides:', data);
      return data || [];
    }
  });

  const uploadImage = async (file: File): Promise<string> => {
    console.log('Starting image upload for file:', file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `slide-${Date.now()}.${fileExt}`;
    
    console.log('Uploading to filename:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('homepage-slides')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', uploadData);

    const { data: urlData } = supabase.storage
      .from('homepage-slides')
      .getPublicUrl(fileName);

    console.log('Generated public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  };

  const addSlideMutation = useMutation({
    mutationFn: async (slideData: { title: string; description: string; image_url: string; order_index: number }) => {
      console.log('Adding slide with data:', slideData);
      const { data, error } = await supabase
        .from('homepage_slides')
        .insert([slideData])
        .select();
      if (error) {
        console.error('Error adding slide:', error);
        throw error;
      }
      console.log('Slide added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slides'] });
      setIsAddDialogOpen(false);
      toast({ title: "התמונה נוספה בהצלחה!" });
    },
    onError: (error: any) => {
      console.error('Add slide error:', error);
      toast({ title: "שגיאה בהוספת התמונה", description: error.message, variant: "destructive" });
    }
  });

  const updateSlideMutation = useMutation({
    mutationFn: async (slideData: HomepageSlide) => {
      console.log('Updating slide with data:', slideData);
      const { data, error } = await supabase
        .from('homepage_slides')
        .update({
          title: slideData.title,
          description: slideData.description,
          image_url: slideData.image_url,
          order_index: slideData.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', slideData.id)
        .select();
      if (error) {
        console.error('Error updating slide:', error);
        throw error;
      }
      console.log('Slide updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slides'] });
      setIsEditDialogOpen(false);
      setEditingSlide(null);
      toast({ title: "התמונה עודכנה בהצלחה!" });
    },
    onError: (error: any) => {
      console.error('Update slide error:', error);
      toast({ title: "שגיאה בעדכון התמונה", description: error.message, variant: "destructive" });
    }
  });

  const deleteSlideMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting slide with id:', id);
      const { error } = await supabase
        .from('homepage_slides')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting slide:', error);
        throw error;
      }
      console.log('Slide deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-slides'] });
      toast({ title: "התמונה נמחקה בהצלחה!" });
    },
    onError: (error: any) => {
      console.error('Delete slide error:', error);
      toast({ title: "שגיאה במחיקת התמונה", description: error.message, variant: "destructive" });
    }
  });

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      setUploading(true);
      console.log('Handling image upload...');
      const imageUrl = await uploadImage(file);
      console.log('Image uploaded successfully:', imageUrl);
      callback(imageUrl);
    } catch (error: any) {
      console.error('Image upload failed:', error);
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
      if (!title || !imageUrl) {
        toast({ title: "שגיאה", description: "נא למלא כותרת ולהעלות תמונה", variant: "destructive" });
        return;
      }
      
      addSlideMutation.mutate({
        title,
        description,
        image_url: imageUrl,
        order_index: orderIndex
      });
    };

    const resetForm = () => {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setOrderIndex(slides.length + 1);
    };

    return (
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
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
                    console.log('File selected for upload:', file.name);
                    handleImageUpload(file, setImageUrl);
                  }
                }}
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">מעלה תמונה...</p>}
              {imageUrl && (
                <div className="mt-2">
                  <img src={imageUrl} alt="תצוגה מקדימה" className="w-full h-32 object-cover rounded" />
                  <p className="text-xs text-green-600 mt-1">תמונה הועלתה בהצלחה!</p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="order">מיקום בסדר</Label>
              <Input
                id="order"
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
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
      if (!title || !imageUrl) {
        toast({ title: "שגיאה", description: "נא למלא כותרת ולהעלות תמונה", variant: "destructive" });
        return;
      }
      
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
              <Label>תמונה נוכחית</Label>
              <img src={imageUrl} alt="תמונה נוכחית" className="w-full h-32 object-cover rounded mb-2" />
              <Label htmlFor="edit-image">החלף תמונה (אופציונלי)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('File selected for edit:', file.name);
                    handleImageUpload(file, setImageUrl);
                  }
                }}
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">מעלה תמונה...</p>}
            </div>
            <div>
              <Label htmlFor="edit-order">מיקום בסדר</Label>
              <Input
                id="edit-order"
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
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

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">
      <div className="text-lg">טוען תמונות...</div>
    </div>;
  }

  return (
    <div className="mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ניהול תמונות דף הבית</CardTitle>
          <AddSlideDialog />
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <p className="text-gray-500 text-center py-8">אין תמונות בקרוסלה</p>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide) => (
                <div key={slide.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 border rounded-lg">
                  <img 
                    src={slide.image_url} 
                    alt={slide.title}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      console.error('Image failed to load:', slide.image_url);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
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
                        console.log('Editing slide:', slide);
                        setEditingSlide(slide);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) {
                          deleteSlideMutation.mutate(slide.id);
                        }
                      }}
                      disabled={deleteSlideMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <EditSlideDialog />
    </div>
  );
};

export default HomepageSlideManagement;
