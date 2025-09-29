
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, FolderOpen, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminItems } from '@/hooks/useAdminItems';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  subcategories?: any;
}

interface Item {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  price: string;
  subcategory?: string;
  display_order?: number;
}

interface ItemManagementProps {
  categories: Category[];
  items: Item[];
}

const ItemManagement = ({ categories, items }: ItemManagementProps) => {
  const [newItem, setNewItem] = useState({ category_id: '', title: '', price: '', image_url: '', subcategory: '' });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createItemMutation, updateItemMutation, deleteItemMutation, updateItemOrderMutation, removeFromSubcategoryMutation } = useAdminItems();
  const { toast } = useToast();

  const uploadImageToStorage = async (file: File): Promise<string> => {
    console.log('Starting image upload for file:', file.name, 'Size:', file.size);
    
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('הקובץ חייב להיות תמונה');
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('התמונה גדולה מדי. מקסימום 10MB');
      }

      // Get file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
        throw new Error('סוג קובץ לא נתמך. השתמש ב-JPG, PNG, WebP או GIF');
      }

      // Generate unique filename
      const fileName = `catalog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading to catalog-images bucket with filename:', fileName);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('catalog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`שגיאה בהעלאת התמונה: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error('לא הצלחנו להעלות את התמונה');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('catalog-images')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', urlData.publicUrl);
      
      if (!urlData.publicUrl) {
        throw new Error('לא הצלחנו ליצור קישור לתמונה');
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleImageUpload = async (file: File, isEditing = false) => {
    console.log('Handling image upload:', file.name);
    setIsUploading(true);
    
    try {
      const imageUrl = await uploadImageToStorage(file);
      
      if (isEditing && editingItem) {
        setEditingItem({ ...editingItem, image_url: imageUrl });
      } else {
        setNewItem({ ...newItem, image_url: imageUrl });
      }
      
      console.log('Image uploaded successfully:', imageUrl);
      toast({
        title: "הצלחה!",
        description: "התמונה הועלתה בהצלחה"
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "שגיאה בהעלאת התמונה",
        description: error.message || "אירעה שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async (files: FileList) => {
    console.log('Starting bulk upload with', files.length, 'files');
    
    if (!newItem.category_id) {
      toast({
        title: "שגיאה",
        description: "נא לבחור קטגוריה לפני העלאת קבצים",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const imageFiles = Array.from(files).filter(file => {
        console.log('Checking file type:', file.name, file.type);
        return file.type.startsWith('image/');
      });

      console.log('Found', imageFiles.length, 'image files out of', files.length, 'total files');

      if (imageFiles.length === 0) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו קבצי תמונה בתיקיה",
          variant: "destructive"
        });
        return;
      }

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(`Processing file ${i + 1}/${imageFiles.length}:`, file.name);
        
        try {
          const imageUrl = await uploadImageToStorage(file);
          
          await createItemMutation.mutateAsync({
            category_id: newItem.category_id,
            title: '', // Auto-generated by trigger
            price: '',
            image_url: imageUrl,
            subcategory: newItem.subcategory || undefined
          });
          
          successCount++;
          console.log(`Successfully uploaded: ${file.name}`);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "הושלם!",
          description: `${successCount} תמונות הועלו בהצלחה${errorCount > 0 ? ` (${errorCount} נכשלו)` : ''}`
        });
        
        // Reset form
        setNewItem({ category_id: '', title: '', price: '', image_url: '', subcategory: '' });
      } else {
        toast({
          title: "שגיאה",
          description: "כל התמונות נכשלו בהעלאה",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהעלאת התמונות",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateItem = () => {
    if (!newItem.category_id || !newItem.image_url) {
      toast({
        title: "שגיאה",
        description: "נא לבחור קטגוריה ולהעלות תמונה",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Creating item:', newItem);
    createItemMutation.mutate({
      category_id: newItem.category_id,
      title: newItem.title || '', // Will be auto-generated if empty
      price: newItem.price,
      image_url: newItem.image_url,
      subcategory: newItem.subcategory || undefined
    });
    setNewItem({ category_id: '', title: '', price: '', image_url: '', subcategory: '' });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    
    console.log('Updating item:', editingItem);
    updateItemMutation.mutate({
      id: editingItem.id,
      category_id: editingItem.category_id,
      title: editingItem.title,
      price: editingItem.price,
      image_url: editingItem.image_url,
      subcategory: editingItem.subcategory
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
      console.log('Deleting item:', id);
      deleteItemMutation.mutate(id);
    }
  };

  const handleMoveItem = (item: Item, direction: 'up' | 'down') => {
    const itemsInGroup = items.filter(i => 
      i.category_id === item.category_id && 
      ((i.subcategory || null) === (item.subcategory || null))
    ).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
    const currentIndex = itemsInGroup.findIndex(i => i.id === item.id);
    const newOrder = direction === 'up' ? 
      (itemsInGroup[currentIndex - 1]?.display_order || 0) :
      (itemsInGroup[currentIndex + 1]?.display_order || currentIndex + 2);
    
    updateItemOrderMutation.mutate({ id: item.id, newOrder });
  };

  const handleRemoveFromSubcategory = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך להסיר פריט זה מתת-הקטגוריה?')) {
      removeFromSubcategoryMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold text-pink-800 mb-6">ניהול פריטים</h2>
      
      {/* Add New Item */}
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">הוספת פריט חדש</h3>
        <div className="grid md:grid-cols-5 gap-4 mb-4">
          <Select value={newItem.category_id} onValueChange={(value) => setNewItem({...newItem, category_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="בחר קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="תת-קטגוריה (אופציונלי)"
            value={newItem.subcategory}
            onChange={(e) => setNewItem({...newItem, subcategory: e.target.value})}
          />
          
          <Input
            placeholder="כותרת (ריק = מספור אוטומטי)"
            value={newItem.title}
            onChange={(e) => setNewItem({...newItem, title: e.target.value})}
          />
          
          <Input
            placeholder="מחיר"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
          />
          
          <div className="flex space-x-2 rtl:space-x-reverse">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log('File selected for single upload:', file.name);
                  handleImageUpload(file);
                }
              }}
              className="hidden"
              id="single-image-upload"
            />
            <Button
              onClick={() => {
                console.log('Single upload button clicked');
                document.getElementById('single-image-upload')?.click();
              }}
              variant="outline"
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 ml-2" />
              {isUploading ? 'מעלה...' : 'העלה תמונה'}
            </Button>
          </div>
        </div>
        
        {/* Bulk Upload */}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            {...({ webkitdirectory: "", directory: "" } as any)}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                console.log('Files selected for bulk upload:', files.length);
                handleBulkUpload(files);
              }
            }}
            className="hidden"
            id="bulk-image-upload"
          />
          <Button
            onClick={() => {
              console.log('Bulk upload button clicked');
              document.getElementById('bulk-image-upload')?.click();
            }}
            variant="outline"
            disabled={isUploading || !newItem.category_id}
            className="w-full"
          >
            <FolderOpen className="h-4 w-4 ml-2" />
            {isUploading ? 'מעלה תיקיה...' : 'העלה תיקיה של תמונות'}
          </Button>
          {!newItem.category_id && (
            <p className="text-sm text-red-600 mt-1">נא לבחור קטגוריה לפני העלאת תיקיה</p>
          )}
        </div>
        
        {newItem.image_url && (
          <div className="mb-4">
            <img src={newItem.image_url} alt="תצוגה מקדימה" className="w-32 h-32 object-cover rounded" />
          </div>
        )}
        
        <Button
          onClick={handleCreateItem}
          disabled={!newItem.category_id || !newItem.image_url || createItemMutation.isPending}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="h-4 w-4 ml-2" />
          {createItemMutation.isPending ? 'מוסיף...' : 'הוסף פריט'}
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">פריטים קיימים</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין פריטים בקטלוג</p>
        ) : (
          items
            .sort((a, b) => {
              // Sort by category order, then by display_order
              const categoryIndexA = categories.findIndex(cat => cat.id === a.category_id);
              const categoryIndexB = categories.findIndex(cat => cat.id === b.category_id);
              
              if (categoryIndexA !== categoryIndexB) {
                return categoryIndexA - categoryIndexB;
              }
              
              return (a.display_order || 0) - (b.display_order || 0);
            })
            .map((item) => {
              const itemsInGroup = items.filter(i => 
                i.category_id === item.category_id && 
                ((i.subcategory || null) === (item.subcategory || null))
              ).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
              
              const currentIndex = itemsInGroup.findIndex(i => i.id === item.id);
              const canMoveUp = currentIndex > 0;
              const canMoveDown = currentIndex < itemsInGroup.length - 1;
              
              return (
                <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 border rounded-lg">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      console.error('Item image failed to load:', item.image_url);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  
                  {editingItem?.id === item.id ? (
                    <>
                      <div className="flex-1 grid md:grid-cols-4 gap-2">
                        <Select value={editingItem.category_id} onValueChange={(value) => setEditingItem({...editingItem, category_id: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={editingItem.subcategory || ""} onValueChange={(value) => setEditingItem({...editingItem, subcategory: value || undefined})}>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר קטגוריית משנה" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">ללא קטגוריית משנה</SelectItem>
                            {(() => {
                              const selectedCategory = categories.find(c => c.id === editingItem.category_id);
                              const subcategories = selectedCategory?.subcategories || [];
                              return Array.isArray(subcategories) ? subcategories.map((subcat) => (
                                <SelectItem key={subcat} value={subcat}>
                                  {subcat}
                                </SelectItem>
                              )) : [];
                            })()}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          placeholder="כותרת"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                        />
                        
                        <Input
                          placeholder="מחיר"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('File selected for edit:', file.name);
                              handleImageUpload(file, true);
                            }
                          }}
                          className="hidden"
                          id={`edit-image-${item.id}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById(`edit-image-${item.id}`)?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleUpdateItem} 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updateItemMutation.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{categories.find(c => c.id === item.category_id)?.name}</p>
                        {item.subcategory && <p className="text-xs text-blue-600">תת-קטגוריה: {item.subcategory}</p>}
                        {item.title && <p className="text-sm text-gray-600">{item.title}</p>}
                        {item.price && <p className="text-sm font-bold text-pink-600">₪{item.price}</p>}
                      </div>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {/* Move up/down buttons */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleMoveItem(item, 'up')}
                          disabled={!canMoveUp || updateItemOrderMutation.isPending}
                          title="הזז למעלה"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleMoveItem(item, 'down')}
                          disabled={!canMoveDown || updateItemOrderMutation.isPending}
                          title="הזז למטה"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        {/* Remove from subcategory button */}
                        {item.subcategory && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleRemoveFromSubcategory(item.id)}
                            disabled={removeFromSubcategoryMutation.isPending}
                            title="הסר מתת-קטגוריה"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleteItemMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default ItemManagement;
