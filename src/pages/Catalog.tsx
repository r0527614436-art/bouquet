
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface CatalogItem {
  id: string;
  title: string;
  image_url: string;
  price: string | null;
  category_id: string;
  created_at: string;
}

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart, getTotalItems } = useCart();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: items = [] } = useQuery({
    queryKey: ['catalog-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category_id === selectedCategory);

  const handleAddToCart = (item: CatalogItem) => {
    addToCart({
      id: item.id,
      title: item.title,
      image_url: item.image_url,
      price: item.price || '',
      category_id: item.category_id
    });
    
    toast({
      title: "נוסף לעגלה",
      description: `${item.title} נוסף לעגלת הקניות`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="flex items-center text-pink-600 hover:text-pink-800">
                <ArrowRight className="h-5 w-5 ml-2" />
                חזרה לעמוד הבית
              </Link>
              <Link 
                to="/cart" 
                className="flex items-center text-pink-600 hover:text-pink-800 relative"
              >
                <ShoppingCart className="h-5 w-5 ml-2" />
                עגלת קניות
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
            
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-24 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">קטלוג המוצרים</h1>
          <p className="text-lg text-gray-700">בחרו מתוך מגוון הפרחים והעיצובים שלנו</p>
        </div>

        {/* Category Filter - Removed "כל הקטגוריות" button */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? 'bg-pink-600 hover:bg-pink-700' : 'border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                {item.price && (
                  <p className="text-pink-600 font-bold text-xl mb-3">₪{item.price}</p>
                )}
                
                {/* Small cart icon button in corner */}
                <button
                  onClick={() => handleAddToCart(item)}
                  className="absolute top-4 right-4 bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                  title="הוסף לעגלה"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4" />
                    <Plus className="h-3 w-3 -ml-1" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין פריטים בקטגוריה זו</p>
          </div>
        )}

        {/* Cart button at bottom of page */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link to="/cart">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 relative">
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
