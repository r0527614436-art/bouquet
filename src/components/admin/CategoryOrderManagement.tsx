import React, { useState } from 'react';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
}

interface CategoryOrderManagementProps {
  categories: Category[];
  onReorderCategories: (reorderedCategories: Category[]) => void;
}

const CategoryOrderManagement = ({ categories, onReorderCategories }: CategoryOrderManagementProps) => {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...localCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newCategories.length) {
      const temp = newCategories[index];
      newCategories[index] = newCategories[targetIndex];
      newCategories[targetIndex] = temp;
      
      setLocalCategories(newCategories);
      onReorderCategories(newCategories);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-pink-800">סידור קטגוריות</CardTitle>
        <p className="text-sm text-gray-600">
          השתמש בכפתורים כדי לשנות את סדר הקטגוריות בקטלוג
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {localCategories.map((category, index) => (
          <div 
            key={category.id} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <GripVertical className="h-5 w-5 text-gray-400" />
              <span className="font-medium">{category.name}</span>
            </div>
            
            <div className="flex space-x-1 rtl:space-x-reverse">
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveCategory(index, 'up')}
                disabled={index === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveCategory(index, 'down')}
                disabled={index === localCategories.length - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CategoryOrderManagement;