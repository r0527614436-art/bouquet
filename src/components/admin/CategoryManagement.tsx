
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAdminCategories } from '@/hooks/useAdminCategories';

interface Category {
  id: string;
  name: string;
}

interface CategoryManagementProps {
  categories: Category[];
  items: any[];
}

const CategoryManagement = ({ categories, items }: CategoryManagementProps) => {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation
  } = useAdminCategories();

  const handleSaveCategory = async () => {
    console.log('Saving category:', { editingCategory, newCategoryName });
    
    if (!newCategoryName.trim()) {
      console.log('Category name is empty');
      return;
    }

    try {
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id, newCategoryName);
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          name: newCategoryName.trim()
        });
      } else {
        console.log('Creating new category:', newCategoryName);
        await createCategoryMutation.mutateAsync(newCategoryName.trim());
      }
      
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את הקטגוריה? כל הפריטים בקטגוריה זו יימחקו גם כן.')) {
      try {
        console.log('Deleting category:', categoryId);
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-800">קטגוריות</h2>
        <Button
          onClick={() => {
            console.log('Opening add category dialog');
            setEditingCategory(null);
            setNewCategoryName('');
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
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Editing category:', category);
                    setEditingCategory(category);
                    setNewCategoryName(category.name);
                    setShowCategoryDialog(true);
                  }}
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
            <p className="text-sm text-gray-600 mt-2">
              {items.filter(item => item.category_id === category.id).length} פריטים
            </p>
          </div>
        ))}
      </div>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="שם הקטגוריה"
              value={newCategoryName}
              onChange={(e) => {
                console.log('Category name changed:', e.target.value);
                setNewCategoryName(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveCategory();
                }
              }}
            />
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
                onClick={() => {
                  setShowCategoryDialog(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                }}
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
