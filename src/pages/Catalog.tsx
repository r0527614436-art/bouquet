
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Plus, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ImageViewer } from '@/components/ui/image-viewer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAutoGeneratePDF } from '@/hooks/useAutoGeneratePDF';

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
  
  // Auto-generate HTML catalog when changes occur
  useAutoGeneratePDF();
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDownloadCatalog = async () => {
    try {
      toast({
        title: "מוריד קטלוג",
        description: "הקטלוג יורד כעת...",
      });

      const { data } = supabase.storage
        .from('catalog-pdfs')
        .getPublicUrl('catalog-bouquet.html');

      if (data?.publicUrl) {
        // Force download with proper file name
        const res = await fetch(data.publicUrl, { cache: 'no-store' });
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
      } else {
        throw new Error('No catalog URL available');
      }
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
    <div className="min-h-screen bg-background" id="catalog-page">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('/lovable-uploads/catalog-hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 z-20">
          <img 
            src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
            alt="בוקט לוגו" 
            className="h-20 w-auto cursor-pointer"
            onClick={handleLogoClick}
          />
        </div>

        {/* Top Right Buttons */}
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
          <Button
            onClick={handleDownloadCatalog}
            className="bg-white/90 hover:bg-white text-gray-800 rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur-sm"
          >
            <Download className="h-4 w-4 ml-2" />
            הורד קטלוג
          </Button>
          <Link to="/" className="flex items-center text-white hover:text-pink-200 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowRight className="h-5 w-5 ml-2" />
            חזרה לעמוד הבית
          </Link>
        </div>

        {/* Content Container */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="font-['Gloria'] text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Catalog</span>
            <span className="font-['Gloria'] text-white mr-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>קטלוג</span>
          </h1>

          {/* Description Text */}
          <div className="text-white text-base md:text-lg space-y-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            <p className="font-bold">כל זר נולד מתוך שיחה תיאום ציפיות, הבנה, השראה וחיבור...</p>
            <p>בקטלוג שלנו תגלו זרים מרהיבים עיצובים מוקפדים</p>
            <p>גלו,התרשמו ,ותנו לעצמכם להנות מכל הטוב הזה</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === '' ? 'bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white rounded-full px-6 py-2' : 'border-[#3d5a3d] text-[#3d5a3d] hover:bg-[#3d5a3d] hover:text-white rounded-full px-6 py-2'}
            >
              הכל
            </Button>
            {categories.map((category) => (
              <div key={category.id}>
                <Button
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white rounded-full px-6 py-2' : 'border-[#3d5a3d] text-[#3d5a3d] hover:bg-[#3d5a3d] hover:text-white rounded-full px-6 py-2'}
                >
                  {category.name}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <button className="text-gray-600 hover:text-gray-800">• גלריה</button>
            <button className="text-gray-600 hover:text-gray-800">• צבע</button>
            <button className="text-gray-600 hover:text-gray-800">• זר פרחים</button>
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
                    <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                    {category.subtitle && (
                      <p className="text-gray-600 mt-1">{category.subtitle}</p>
                    )}
                  </div>
                  
                  {Object.entries(groupedItems).map(([subcategoryKey, items]) => (
                    <div key={subcategoryKey} className="space-y-4">
                      {subcategoryKey !== 'main' && (
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
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
                                  <p className="text-gray-700 font-bold text-xl mb-3">₪{item.price}</p>
                                )}
                                
                                {/* Cart button - only show if category allows cart */}
                                {allowCart && (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="absolute top-4 right-4 bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white p-2 rounded-full shadow-lg transition-all duration-200"
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
                          <h3 className="text-lg font-semibold text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
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
                                  <p className="text-gray-700 font-bold text-xl mb-3">₪{item.price}</p>
                                )}
                                
                                {/* Cart button - only show if category allows cart */}
                                {allowCart && (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="absolute top-4 right-4 bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white p-2 rounded-full shadow-lg transition-all duration-200"
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

        {/* Contact Section */}
        <div className="mt-16 border-t pt-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-['Gloria'] text-center mb-8">
              <span className="text-gray-400">Contact</span>
              <span className="mr-3">צור קשר</span>
            </h2>
            
            <div className="space-y-4 text-right">
              <div>
                <input
                  type="text"
                  placeholder="שם מלא"
                  className="w-full border-b border-gray-300 py-2 px-0 focus:outline-none focus:border-[#3d5a3d] bg-transparent"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="טלפון"
                  className="w-full border-b border-gray-300 py-2 px-0 focus:outline-none focus:border-[#3d5a3d] bg-transparent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="אימייל"
                  className="w-full border-b border-gray-300 py-2 px-0 focus:outline-none focus:border-[#3d5a3d] bg-transparent"
                />
              </div>
              
              <div className="pt-6">
                <button 
                  onClick={() => window.open('https://wa.me/972527614436', '_blank')}
                  className="w-full bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white py-3 rounded-full transition-colors"
                >
                  שיחה
                </button>
              </div>
            </div>

            <div className="mt-8 text-center space-y-2 text-sm text-gray-600">
              <p>שערי תשובה 14, מודיעין עילית</p>
              <p>052-7614436</p>
              <p>R0522614436@GMAIL.COM</p>
            </div>
          </div>
        </div>

        {/* Cart button at bottom of page */}
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => window.open('https://wa.me/972527614436', '_blank')}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </button>
        </div>

        {getTotalItems() > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Link to="/cart">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-200 relative">
                <ShoppingCart className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-sm w-7 h-7 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              </Button>
            </Link>
          </div>
        )}

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
