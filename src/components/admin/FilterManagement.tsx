import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  filters?: string[];
}

interface Item {
  id: string;
  title: string;
  image_url: string;
  category_id: string;
  filter_tags?: string[] | any;
}

interface FilterManagementProps {
  categories: Category[];
  items: Item[];
}

const FilterManagement = ({ categories, items }: FilterManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newFilter, setNewFilter] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assigningFilter, setAssigningFilter] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const categoryFilters = selectedCategoryData?.filters || [];
  const categoryItems = items.filter(i => i.category_id === selectedCategory);

  const updateCategoryFiltersMutation = useMutation({
    mutationFn: async ({ categoryId, filters }: { categoryId: string; filters: string[] }) => {
      const { error } = await supabase
        .from('categories')
        .update({ filters })
        .eq('id', categoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: "הצלחה",
        description: "המסננים עודכנו בהצלחה"
      });
    },
    onError: () => {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון המסננים",
        variant: "destructive"
      });
    }
  });

  const updateItemFilterTagsMutation = useMutation({
    mutationFn: async ({ itemId, filterTags }: { itemId: string; filterTags: string[] }) => {
      const { error } = await supabase
        .from('catalog_items')
        .update({ filter_tags: filterTags })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
    }
  });

  const handleAddFilter = () => {
    if (!selectedCategory || !newFilter.trim()) return;
    if (categoryFilters.includes(newFilter.trim())) {
      toast({
        title: "שגיאה",
        description: "מסנן זה כבר קיים",
        variant: "destructive"
      });
      return;
    }
    
    const updatedFilters = [...categoryFilters, newFilter.trim()];
    updateCategoryFiltersMutation.mutate({ categoryId: selectedCategory, filters: updatedFilters });
    setNewFilter('');
  };

  const handleDeleteFilter = (filterName: string) => {
    if (!selectedCategory) return;
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המסנן "${filterName}"? פריטים המשויכים למסנן זה יאבדו את השיוך.`)) return;
    
    const updatedFilters = categoryFilters.filter(f => f !== filterName);
    updateCategoryFiltersMutation.mutate({ categoryId: selectedCategory, filters: updatedFilters });
    
    // Remove filter tag from all items that have it
    categoryItems.forEach(item => {
      const itemTags = item.filter_tags || [];
      if (itemTags.includes(filterName)) {
        updateItemFilterTagsMutation.mutate({
          itemId: item.id,
          filterTags: itemTags.filter(t => t !== filterName)
        });
      }
    });
  };

  const openAssignDialog = (filterName: string) => {
    setAssigningFilter(filterName);
    const itemsWithFilter = categoryItems.filter(item => 
      (item.filter_tags || []).includes(filterName)
    ).map(item => item.id);
    setSelectedItems(itemsWithFilter);
    setShowAssignDialog(true);
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSaveAssignments = async () => {
    // Update all items in the category
    for (const item of categoryItems) {
      const currentTags = item.filter_tags || [];
      const shouldHaveFilter = selectedItems.includes(item.id);
      const hasFilter = currentTags.includes(assigningFilter);

      if (shouldHaveFilter && !hasFilter) {
        await updateItemFilterTagsMutation.mutateAsync({
          itemId: item.id,
          filterTags: [...currentTags, assigningFilter]
        });
      } else if (!shouldHaveFilter && hasFilter) {
        await updateItemFilterTagsMutation.mutateAsync({
          itemId: item.id,
          filterTags: currentTags.filter(t => t !== assigningFilter)
        });
      }
    }

    toast({
      title: "הצלחה",
      description: "השיוכים עודכנו בהצלחה"
    });
    setShowAssignDialog(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold text-pink-800 mb-6">ניהול מסננים</h2>
      
      {/* Category Selection */}
      <div className="mb-6">
        <Label className="mb-2 block">בחר קטגוריה</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full max-w-xs">
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
      </div>

      {selectedCategory && (
        <>
          {/* Add New Filter */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="שם המסנן החדש"
              value={newFilter}
              onChange={(e) => setNewFilter(e.target.value)}
              className="max-w-xs"
            />
            <Button
              onClick={handleAddFilter}
              disabled={!newFilter.trim() || updateCategoryFiltersMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף מסנן
            </Button>
          </div>

          {/* Existing Filters */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">מסננים קיימים</h3>
            {categoryFilters.length === 0 ? (
              <p className="text-gray-500">אין מסננים בקטגוריה זו</p>
            ) : (
              categoryFilters.map((filter) => {
                const assignedCount = categoryItems.filter(item => 
                  (item.filter_tags || []).includes(filter)
                ).length;
                
                return (
                  <div key={filter} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium">{filter}</span>
                      <span className="text-sm text-gray-500 mr-3">
                        ({assignedCount} פריטים)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignDialog(filter)}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        שייך פריטים
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFilter(filter)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Assign Items Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>שייך פריטים למסנן "{assigningFilter}"</DialogTitle>
            <DialogDescription>
              בחר את הפריטים שיופיעו תחת מסנן זה
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`relative border rounded-lg p-2 cursor-pointer transition-all ${
                  selectedItems.includes(item.id) 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleItem(item.id)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-24 object-cover rounded"
                />
                <p className="text-sm mt-1 text-center truncate">{item.title || 'ללא כותרת'}</p>
                {selectedItems.includes(item.id) && (
                  <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleSaveAssignments}
              className="bg-pink-600 hover:bg-pink-700"
            >
              שמור שיוכים
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterManagement;
