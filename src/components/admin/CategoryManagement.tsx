import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAdminCategories } from '@/hooks/useAdminCategories';

interface Category {
  id: string;
  name: string;
  subtitle: string | null;
  allow_cart: boolean;
  subcategories?: string[];
}

interface CategoryManagementProps {
  categories: Category[];
  items: any[];
}

const CategoryManagement = ({ categories, items }: CategoryManagementProps) => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubtitle, setNewCategorySubtitle] = useState('');
  const [newCategoryAllowCart, setNewCategoryAllowCart] = useState(true);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState('');

  const {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation
  } = useAdminCategories();

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({
        name: newCategoryName.trim(),
        subtitle: newCategorySubtitle.trim() || null,
        allow_cart: newCategoryAllowCart,
        subcategories: subcategories
      });
      resetForm();
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategorySubtitle(category.subtitle || '');
    setNewCategoryAllowCart(category.allow_cart);
    setSubcategories(category.subcategories || []);
    setShowCategoryDialog(true);
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        name: newCategoryName.trim(),
        subtitle: newCategorySubtitle.trim() || null,
        allow_cart: newCategoryAllowCart,
        subcategories: subcategories
      });
      resetForm();
    }
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      handleUpdateCategory();
    } else {
      handleCreateCategory();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const itemsInCategory = items.filter(item => item.category_id === categoryId).length;
    const confirmMessage = itemsInCategory > 0 
      ? `האם אתה בטוח שברצונך למחוק את הקטגוריה? יש ${itemsInCategory} פריטים בקטגוריה זו שיימחקו גם כן.`
      : 'האם אתה בטוח שברצונך למחוק את הקטגוריה?';
    
    if (confirm(confirmMessage)) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategorySubtitle('');
    setNewCategoryAllowCart(true);
    setSubcategories([]);
    setNewSubcategory('');
    setShowCategoryDialog(false);
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-800">קטגוריות</h2>
        <Button
          onClick={() => {
            resetForm();
            setShowCategoryDialog(true);
          }}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="h-4 w-4 ml-2" />
          הוסף קטגוריה
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {category.subtitle && (
                  <p className="text-sm text-gray-600">{category.subtitle}</p>
                )}
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {items.filter(item => item.category_id === category.id).length} פריטים
              </p>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className={`text-xs px-2 py-1 rounded ${category.allow_cart ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {category.allow_cart ? 'ניתן להזמנה' : 'תצוגה בלבד'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'ערוך את פרטי הקטגוריה הקיימת' : 'צור קטגוריה חדשה למוצרים שלך'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">שם הקטגוריה</Label>
              <Input
                id="categoryName"
                placeholder="שם הקטגוריה"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCategory();
                  }
                }}
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="categorySubtitle">כותרת משנה (אופציונלי)</Label>
              <Textarea
                id="categorySubtitle"
                placeholder="כותרת משנה לקטגוריה"
                value={newCategorySubtitle}
                onChange={(e) => setNewCategorySubtitle(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="allowCart"
                checked={newCategoryAllowCart}
                onCheckedChange={setNewCategoryAllowCart}
              />
              <Label htmlFor="allowCart">אפשר הוספה לסל</Label>
            </div>

            {/* Subcategories Management */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">קטגוריות משנה</Label>
              
              {/* Add new subcategory */}
              <div className="flex gap-2">
                <Input
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="הוסף קטגוריית משנה"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newSubcategory.trim() && !subcategories.includes(newSubcategory.trim())) {
                      setSubcategories([...subcategories, newSubcategory.trim()]);
                      setNewSubcategory('');
                    }
                  }}
                >
                  הוסף
                </Button>
              </div>

              {/* Existing subcategories */}
              {subcategories.length > 0 && (
                <div className="space-y-2">
                  {subcategories.map((subcategory, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{subcategory}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (index > 0) {
                              const newOrder = [...subcategories];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              setSubcategories(newOrder);
                            }
                          }}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (index < subcategories.length - 1) {
                              const newOrder = [...subcategories];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              setSubcategories(newOrder);
                            }
                          }}
                          disabled={index === subcategories.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSubcategories(subcategories.filter((_, i) => i !== index));
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                onClick={handleSaveCategory}
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? 'שומר...' : 'שמור'}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
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

export default CategoryManagement;