
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  items: Item[];
}

interface Item {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  price: string;
  created_at: string;
}

const Catalog = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('catalog_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      return categoriesData.map(category => ({
        ...category,
        items: itemsData.filter(item => item.category_id === category.id)
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600">טוען קטלוג...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center text-pink-600 hover:text-pink-700">
              <ArrowRight className="h-5 w-5 ml-2" />
              חזרה לעמוד הראשי
            </Link>
            
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-16 w-auto ml-4"
              />
              <h1 className="text-2xl font-bold text-pink-800">קטלוג בוקט</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">הקטלוג בהכנה... בקרוב יתווספו פריטים חדשים!</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="mb-12">
              <h2 className="text-3xl font-bold text-pink-800 mb-6 border-b-2 border-pink-200 pb-2">
                {category.name}
              </h2>
              
              {category.items.length === 0 ? (
                <p className="text-gray-600">אין פריטים בקטגוריה זו כרגע</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-pink-800 mb-2">{item.title}</h3>
                        {item.price && (
                          <p className="text-pink-600 font-bold text-xl">₪{item.price}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowNotification(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-pink-800 mb-4">לקוחות יקרים, לידיעתכם!</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                יתכנו שינויים קלים בגוונים ובסוגי הפרחים בהתאם לזמינות העונתית.<br/>
                השזירה תבוצע בהשראת העיצוב שבתמונה, תוך שמירה על הקו הכללי והאווירה.<br/>
                תודה על ההבנה ושיתוף הפעולה!
              </p>
              <Button 
                onClick={() => setShowNotification(false)}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                הבנתי
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
