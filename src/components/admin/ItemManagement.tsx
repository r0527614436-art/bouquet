
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, FolderOpen, ChevronUp, ChevronDown, Minus, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminItems } from '@/hooks/useAdminItems';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FilterOption {
  name: string;
  options: string[];
}

interface Category {
  id: string;
  name: string;
  filters?: FilterOption[];
}

interface Item {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  price: string;
  filter_tags?: any;
  display_order?: number;
}

interface ItemManagementProps {
  categories: Category[];
  items: Item[];
}

const ItemManagement = ({ categories, items }: ItemManagementProps) => {
  const [newItem, setNewItem] = useState({ category_id: '', title: '', price: '', image_url: '', filter_tags: {} as any });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingCategory, setDownloadingCategory] = useState<string | null>(null);
  const { createItemMutation, updateItemMutation, deleteItemMutation, updateItemOrderMutation, clearItemFiltersMutation } = useAdminItems();
  const { toast } = useToast();

  // Sanitize filename - remove special characters
  const sanitizeFilename = (name: string): string => {
    return name
      .replace(/[<>:"/\\|?*]/g, '') // Remove illegal characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
  };

  // Download all images for a category
  const downloadCategoryImages = async (categoryId: string, categoryName: string) => {
    const categoryItems = items.filter(item => item.category_id === categoryId);
    
    if (categoryItems.length === 0) {
      toast({
        title: "אין תמונות",
        description: "אין פריטים בקטגוריה זו",
        variant: "destructive"
      });
      return;
    }

    setDownloadingCategory(categoryId);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of categoryItems) {
        try {
          // Fetch the image
          const response = await fetch(item.image_url);
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          
          // Get file extension from URL or content type
          let extension = 'jpg';
          const urlParts = item.image_url.split('.');
          if (urlParts.length > 1) {
            const ext = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
              extension = ext;
            }
          }
          
          // Create filename from item title or use a fallback
          const itemName = item.title || `פריט_${successCount + 1}`;
          const filename = `${sanitizeFilename(categoryName)}_${sanitizeFilename(itemName)}.${extension}`;
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          successCount++;
          
          // Small delay between downloads to avoid overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error downloading image for item ${item.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "הורדה הושלמה",
          description: `${successCount} תמונות הורדו בהצלחה${errorCount > 0 ? ` (${errorCount} נכשלו)` : ''}`
        });
      } else {
        toast({
          title: "שגיאה",
          description: "לא הצלחנו להוריד תמונות",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error downloading category images:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהורדת התמונות",
        variant: "destructive"
      });
    } finally {
      setDownloadingCategory(null);
    }
  };

  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/webp') {
        resolve(file);
        return;
      }
      if (file.type === 'image/gif') {
        resolve(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const MAX_WIDTH = 1400;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to WebP'));
              return;
            }
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' });
            console.log(`Converted ${file.name} (${(file.size / 1024).toFixed(0)}KB) → WebP (${(webpFile.size / 1024).toFixed(0)}KB)`);
            resolve(webpFile);
          },
          'image/webp',
          0.8
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for conversion'));
      };
      
      img.src = url;
    });
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    console.log('Starting image upload for file:', file.name, 'Size:', file.size);
    
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('הקובץ חייב להיות תמונה');
      }
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('התמונה גדולה מדי. מקסימום 10MB');
      }

      // Convert to WebP before upload
      const convertedFile = await convertToWebP(file);
      
      const fileExt = convertedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
        throw new Error('סוג קובץ לא נתמך. השתמש ב-JPG, PNG, WebP או GIF');
      }

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
            filter_tags: Object.keys(newItem.filter_tags).length > 0 ? newItem.filter_tags : undefined
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
        setNewItem({ category_id: '', title: '', price: '', image_url: '', filter_tags: {} });
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
      filter_tags: Object.keys(newItem.filter_tags).length > 0 ? newItem.filter_tags : undefined
    });
    setNewItem({ category_id: '', title: '', price: '', image_url: '', filter_tags: {} });
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
      filter_tags: editingItem.filter_tags
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
      i.category_id === item.category_id
    ).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
    const currentIndex = itemsInGroup.findIndex(i => i.id === item.id);
    const newOrder = direction === 'up' ? 
      (itemsInGroup[currentIndex - 1]?.display_order || 0) :
      (itemsInGroup[currentIndex + 1]?.display_order || currentIndex + 2);
    
    updateItemOrderMutation.mutate({ id: item.id, newOrder });
  };

  const handleClearFilters = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך להסיר את המסננים מפריט זה?')) {
      clearItemFiltersMutation.mutate(id);
    }
  };

  // Get filters for selected category
  const getFiltersForCategory = (categoryId: string): FilterOption[] => {
    const category = categories.find(c => c.id === categoryId);
    if (!category?.filters || !Array.isArray(category.filters)) return [];
    return category.filters as FilterOption[];
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

          {/* Filter selection for new item */}
          {newItem.category_id && getFiltersForCategory(newItem.category_id).length > 0 && (
            <Select 
              value={(Object.entries(newItem.filter_tags || {})[0]?.[1] as string) || "no-filter"} 
              onValueChange={(value) => {
                if (value === "no-filter") {
                  setNewItem({...newItem, filter_tags: {}});
                } else {
                  // Find which filter this option belongs to
                  const filters = getFiltersForCategory(newItem.category_id);
                  for (const filter of filters) {
                    if (filter.options.includes(value)) {
                      setNewItem({...newItem, filter_tags: { [filter.name]: value }});
                      break;
                    }
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מסנן (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-filter">ללא מסנן</SelectItem>
                {getFiltersForCategory(newItem.category_id).map((filter) => (
                  filter.options.map((option) => (
                    <SelectItem key={`${filter.name}-${option}`} value={option}>
                      {filter.name}: {option}
                    </SelectItem>
                  ))
                ))}
              </SelectContent>
            </Select>
          )}
          
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

      {/* Download Images by Category */}
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">הורדת תמונות לפי קטגוריה</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const categoryItemCount = items.filter(item => item.category_id === category.id).length;
            const isDownloading = downloadingCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                onClick={() => downloadCategoryImages(category.id, category.name)}
                disabled={isDownloading || categoryItemCount === 0}
                className="flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">({categoryItemCount})</span>
              </Button>
            );
          })}
        </div>
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
                i.category_id === item.category_id
              ).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
              
              const currentIndex = itemsInGroup.findIndex(i => i.id === item.id);
              const canMoveUp = currentIndex > 0;
              const canMoveDown = currentIndex < itemsInGroup.length - 1;
              const itemFilterTags = item.filter_tags || {};
              
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

                         {/* Filter selection for editing item */}
                         {getFiltersForCategory(editingItem.category_id).length > 0 && (
                           <Select 
                             value={(Object.entries(editingItem.filter_tags || {})[0]?.[1] as string) || "no-filter"} 
                             onValueChange={(value) => {
                               if (value === "no-filter") {
                                 setEditingItem({...editingItem, filter_tags: {}});
                               } else {
                                 const filters = getFiltersForCategory(editingItem.category_id);
                                 for (const filter of filters) {
                                   if (filter.options.includes(value)) {
                                     setEditingItem({...editingItem, filter_tags: { [filter.name]: value }});
                                     break;
                                   }
                                 }
                               }
                             }}
                           >
                             <SelectTrigger>
                               <SelectValue placeholder="בחר מסנן" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="no-filter">ללא מסנן</SelectItem>
                               {getFiltersForCategory(editingItem.category_id).map((filter) => (
                                 filter.options.map((option) => (
                                   <SelectItem key={`${filter.name}-${option}`} value={option}>
                                     {filter.name}: {option}
                                   </SelectItem>
                                 ))
                               ))}
                             </SelectContent>
                           </Select>
                         )}
                        
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
                        {Object.keys(itemFilterTags).length > 0 && (
                          <p className="text-xs text-blue-600">
                            מסנן: {Object.entries(itemFilterTags).map(([key, val]) => `${key}: ${val}`).join(', ')}
                          </p>
                        )}
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
                        
                        {/* Clear filters button */}
                        {Object.keys(itemFilterTags).length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleClearFilters(item.id)}
                            disabled={clearItemFiltersMutation.isPending}
                            title="הסר מסננים"
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
