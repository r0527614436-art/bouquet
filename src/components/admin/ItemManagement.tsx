
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAdminItems } from '@/hooks/useAdminItems';

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
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({
    title: '',
    price: '',
    image_url: '',
    category_id: ''
  });

  const {
    createItemMutation,
    updateItemMutation,
    deleteItemMutation
  } = useAdminItems();

  const handleSaveItem = () => {
    if (editingItem) {
      updateItemMutation.mutate({
        ...editingItem,
        ...itemForm
      });
    } else {
      createItemMutation.mutate(itemForm);
    }
    setShowItemDialog(false);
    setEditingItem(null);
    setItemForm({ title: '', price: '', image_url: '', category_id: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-800">פריטים</h2>
        <Button
          onClick={() => {
            setEditingItem(null);
            setItemForm({ title: '', price: '', image_url: '', category_id: '' });
            setShowItemDialog(true);
          }}
          className="bg-pink-600 hover:bg-pink-700"
          disabled={categories.length === 0}
        >
          <Plus className="h-4 w-4 ml-2" />
          הוסף פריט
        </Button>
      </div>
      
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">יש ליצור קטגוריה לפני הוספת פריטים</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const category = categories.find(cat => cat.id === item.category_id);
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{category?.name}</p>
                  {item.price && (
                    <p className="text-pink-600 font-bold mb-3">₪{item.price}</p>
                  )}
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingItem(item);
                        setItemForm({
                          title: item.title,
                          price: item.price,
                          image_url: item.image_url,
                          category_id: item.category_id
                        });
                        setShowItemDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('האם אתה בטוח שברצונך למחוק את הפריט?')) {
                          deleteItemMutation.mutate(item.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'ערוך פריט' : 'הוסף פריט חדש'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="כותרת הפריט"
              value={itemForm.title}
              onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="מחיר (אופציונלי)"
              value={itemForm.price}
              onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
            />
            <Input
              placeholder="כתובת התמונה (URL)"
              value={itemForm.image_url}
              onChange={(e) => setItemForm(prev => ({ ...prev, image_url: e.target.value }))}
            />
            <select
              value={itemForm.category_id}
              onChange={(e) => setItemForm(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">בחר קטגוריה</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                onClick={handleSaveItem}
                disabled={!itemForm.title.trim() || !itemForm.category_id || !itemForm.image_url.trim()}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Save className="h-4 w-4 ml-2" />
                שמור
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowItemDialog(false)}
              >
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemManagement;
