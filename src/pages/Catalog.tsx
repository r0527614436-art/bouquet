
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Plus, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ImageViewer } from '@/components/ui/image-viewer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  subtitle: string | null;
  allow_cart: boolean;
  created_at: string;
}

interface CatalogItem {
  id: string;
  title: string;
  image_url: string;
  price: string | null;
  category_id: string;
  created_at: string;
  subcategory?: string;
  display_order?: number;
}

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageItem, setCurrentImageItem] = useState<CatalogItem | null>(null);
  const { addToCart, getTotalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDownloadCatalog = async () => {
    try {
      toast({
        title: "מכין קטלוג",
        description: "בודק אם יש גרסה מעודכנת להורדה...",
      });

      const { data } = supabase.storage
        .from('catalog-pdfs')
        .getPublicUrl('catalog-bouquet.html');

      let finalUrl = data?.publicUrl || '';
      let exists = false;

      if (finalUrl) {
        try {
          const head = await fetch(finalUrl, { method: 'HEAD', cache: 'no-store' });
          exists = head.ok;
        } catch (_) {
          exists = false;
        }
      }

      if (!exists) {
        const { data: genData, error } = await supabase.functions.invoke('generate-catalog-html');
        if (error) throw error;
        finalUrl = genData.url;
      }

      // Force download with proper file name
      const res = await fetch(finalUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch catalog file');
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'קטלוג בוקט.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "הורדת קטלוג",
        description: "הקטלוג הורד בהצלחה",
      });
    } catch (error) {
      console.error('Error downloading catalog:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהורדת הקטלוג",
        variant: "destructive",
      });
    }
  };

  const handleLogoClick = () => {
    clickCount.current += 1;
    
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }
    
    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 3) {
        navigate('/admin');
      }
      clickCount.current = 0;
    }, 500);
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Set empty (all) as selected when categories are loaded
  useEffect(() => {
    if (selectedCategory === null && categories.length > 0) {
      setSelectedCategory('');
    }
  }, [categories, selectedCategory]);

  const { data: items = [] } = useQuery({
    queryKey: ['catalog-items', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Sort items by category order and display_order
  const sortedItems = items.sort((a, b) => {
    const categoryIndexA = categories.findIndex(cat => cat.id === a.category_id);
    const categoryIndexB = categories.findIndex(cat => cat.id === b.category_id);
    
    // If categories are the same, sort by display_order then creation date
    if (categoryIndexA === categoryIndexB) {
      // First by display_order
      if (a.display_order !== b.display_order) {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      // Then by creation date
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    // Sort by category order
    return categoryIndexA - categoryIndexB;
  });

  const filteredItems = selectedCategory 
    ? sortedItems.filter(item => item.category_id === selectedCategory)
    : sortedItems;

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
      description: `${item.title} נוסף לסל המוצרים`,
    });
  };

  const handleImageClick = (item: CatalogItem) => {
    setCurrentImageItem(item);
    setImageViewerOpen(true);
  };

  const handlePreviousImage = () => {
    if (!currentImageItem) return;
    const currentIndex = filteredItems.findIndex(item => item.id === currentImageItem.id);
    if (currentIndex > 0) {
      setCurrentImageItem(filteredItems[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    if (!currentImageItem) return;
    const currentIndex = filteredItems.findIndex(item => item.id === currentImageItem.id);
    if (currentIndex < filteredItems.length - 1) {
      setCurrentImageItem(filteredItems[currentIndex + 1]);
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const getCategoryByItem = (item: CatalogItem) => {
    return categories.find(cat => cat.id === item.category_id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white" id="catalog-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="flex items-center text-pink-600 hover:text-pink-800">
                <ArrowRight className="h-5 w-5 ml-2" />
                חזרה לעמוד הבית
              </Link>
              <Button
                onClick={handleDownloadCatalog}
                className="flex items-center bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-2.5"
              >
                <Download className="h-4 w-4 ml-2" />
                הורד קטלוג
              </Button>
            </div>
            
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-24 w-auto cursor-pointer"
                onClick={handleLogoClick}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">קטלוג</h1>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="text-center">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('')}
                className={selectedCategory === '' ? 'bg-pink-600 hover:bg-pink-700' : 'border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'}
              >
                הכל
              </Button>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="text-center">
                <Button
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-pink-600 hover:bg-pink-700' : 'border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'}
                >
                  {category.name}
                </Button>
                {category.subtitle && selectedCategory === category.id && (
                  <p className="text-sm text-gray-600 mt-1">{category.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="space-y-12">
          {selectedCategory === '' ? (
            /* Show all categories with their items */
            categories.map((category) => {
              const categoryItems = sortedItems.filter(item => item.category_id === category.id);
              if (categoryItems.length === 0) return null;
              
              // Group items by subcategory
              const groupedItems = categoryItems.reduce((groups: Record<string, CatalogItem[]>, item) => {
                const key = item.subcategory || 'main';
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
                return groups;
              }, {});
              
              return (
                <div key={category.id} className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-pink-800">{category.name}</h2>
                    {category.subtitle && (
                      <p className="text-gray-600 mt-1">{category.subtitle}</p>
                    )}
                  </div>
                  
                  {Object.entries(groupedItems).map(([subcategoryKey, items]) => (
                    <div key={subcategoryKey} className="space-y-4">
                      {subcategoryKey !== 'main' && (
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-pink-600 bg-pink-50 py-2 px-4 rounded-lg inline-block">
                            {subcategoryKey}
                          </h3>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => {
                          const allowCart = category?.allow_cart !== false;
                          
                          return (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                              <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => handleImageClick(item)}>
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
                                
                                {/* Cart button - only show if category allows cart */}
                                {allowCart && (
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
                                )}

                                {/* Display only indicator */}
                                {!allowCart && (
                                  <div className="absolute top-4 right-4 bg-gray-600 text-white p-2 rounded-full shadow-lg">
                                    <span className="text-xs font-medium">דוגמה</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            /* Show single category items with subcategories */
            (() => {
              const selectedCategoryItems = sortedItems.filter(item => item.category_id === selectedCategory);
              
              // Group items by subcategory
              const groupedItems = selectedCategoryItems.reduce((groups: Record<string, CatalogItem[]>, item) => {
                const key = item.subcategory || 'main';
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
                return groups;
              }, {});

              return (
                <div className="space-y-8">
                  {Object.entries(groupedItems).map(([subcategoryKey, items]) => (
                    <div key={subcategoryKey} className="space-y-4">
                      {subcategoryKey !== 'main' && (
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-pink-600 bg-pink-50 py-2 px-4 rounded-lg inline-block">
                            {subcategoryKey}
                          </h3>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => {
                          const category = getCategoryByItem(item);
                          const allowCart = category?.allow_cart !== false;
                          
                          return (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                              <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => handleImageClick(item)}>
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
                                
                                {/* Cart button - only show if category allows cart */}
                                {allowCart && (
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
                                )}

                                {/* Display only indicator */}
                                {!allowCart && (
                                  <div className="absolute top-4 right-4 bg-gray-600 text-white p-2 rounded-full shadow-lg">
                                    <span className="text-xs font-medium">דוגמה</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין פריטים בקטגוריה זו</p>
          </div>
        )}

        {/* Cart button at bottom of page */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link to="/cart">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-200 relative scale-[1.3]">
              <ShoppingCart className="h-9 w-9" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full text-sm w-9 h-9 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Image Viewer Modal */}
        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          currentItem={currentImageItem}
          items={filteredItems}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
        />
      </div>
    </div>
  );
};

export default Catalog;
