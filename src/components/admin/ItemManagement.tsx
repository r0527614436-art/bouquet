
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminItems } from '@/hooks/useAdminItems';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  price: string;
}

interface ItemManagementProps {
  categories: Category[];
  items: Item[];
}

const ItemManagement = ({ categories, items }: ItemManagementProps) => {
  const [newItem, setNewItem] = useState({ category_id: '', title: '', price: '', image_url: '' });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createItemMutation, updateItemMutation, deleteItemMutation } = useAdminItems();
  const { toast } = useToast();

  const handleImageUpload = async (file: File, isEditing = false) => {
    console.log('Uploading single image:', file.name);
    setIsUploading(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      
      if (isEditing && editingItem) {
        setEditingItem({ ...editingItem, image_url: imageUrl });
      } else {
        setNewItem({ ...newItem, image_url: imageUrl });
      }
      
      console.log('Single image uploaded successfully');
      toast({
        title: "הצלחה",
        description: "התמונה הועלתה בהצלחה"
      });
    } catch (error) {
      console.error('Error uploading single image:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהעלאת התמונה",
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
        console.log('Checking file:', file.name, 'Type:', file.type);
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
          const imageUrl = URL.createObjectURL(file);
          const fileName = file.name.split('.')[0];
          
          await createItemMutation.mutateAsync({
            category_id: newItem.category_id,
            title: fileName,
            price: '',
            image_url: imageUrl
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
          title: "הצלחה",
          description: `${successCount} תמונות הועלו בהצלחה${errorCount > 0 ? ` (${errorCount} נכשלו)` : ''}`
        });
        
        setNewItem({ category_id: '', title: '', price: '', image_url: '' });
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
    
    console.log('Creating single item:', newItem);
    createItemMutation.mutate({
      category_id: newItem.category_id,
      title: newItem.title || '',
      price: newItem.price,
      image_url: newItem.image_url
    });
    setNewItem({ category_id: '', title: '', price: '', image_url: '' });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    
    console.log('Updating item:', editingItem);
    updateItemMutation.mutate({
      id: editingItem.id,
      category_id: editingItem.category_id,
      title: editingItem.title,
      price: editingItem.price,
      image_url: editingItem.image_url
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
      console.log('Deleting item:', id);
      deleteItemMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold text-pink-800 mb-6">ניהול פריטים</h2>
      
      {/* Add New Item */}
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">הוספת פריט חדש</h3>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
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
            placeholder="כותרת (אופציונלי)"
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
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              className="hidden"
              id="single-image-upload"
            />
            <Button
              onClick={() => document.getElementById('single-image-upload')?.click()}
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
            webkitdirectory=""
            directory=""
            onChange={(e) => {
              console.log('Bulk upload triggered, files:', e.target.files?.length);
              if (e.target.files && e.target.files.length > 0) {
                handleBulkUpload(e.target.files);
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
          הוסף פריט
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">פריטים קיימים</h3>
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 border rounded-lg">
            <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
            
            {editingItem?.id === item.id ? (
              <>
                <div className="flex-1 grid md:grid-cols-3 gap-2">
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
                  
                  <Input
                    placeholder="כותרת (אופציונלי)"
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
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                    className="hidden"
                    id={`edit-image-${item.id}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById(`edit-image-${item.id}`)?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleUpdateItem} className="bg-green-600 hover:bg-green-700">
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
                  {item.title && <p className="text-sm text-gray-600">{item.title}</p>}
                  {item.price && <p className="text-sm font-bold text-pink-600">₪{item.price}</p>}
                </div>
                
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemManagement;
