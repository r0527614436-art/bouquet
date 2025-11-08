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
  const {
    addToCart,
    getTotalItems
  } = useCart();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Auto-generate HTML catalog when changes occur
  useAutoGeneratePDF();
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const handleDownloadCatalog = async () => {
    try {
      toast({
        title: "מוריד קטלוג",
        description: "הקטלוג יורד כעת..."
      });
      const {
        data
      } = supabase.storage.from('catalog-pdfs').getPublicUrl('catalog-bouquet.html');
      if (data?.publicUrl) {
        // Force download with proper file name
        const res = await fetch(data.publicUrl, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch catalog file');
        const htmlText = await res.text();
        const blob = new Blob([htmlText], {
          type: 'text/html;charset=utf-8'
        });
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
          description: "הקטלוג הורד בהצלחה"
        });
      } else {
        throw new Error('No catalog URL available');
      }
    } catch (error) {
      console.error('Error downloading catalog:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהורדת הקטלוג",
        variant: "destructive"
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
  const {
    data: categories = []
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').order('created_at', {
        ascending: true
      });
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
  const {
    data: items = []
  } = useQuery({
    queryKey: ['catalog-items', 'categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('catalog_items').select('*');
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
  const filteredItems = selectedCategory ? sortedItems.filter(item => item.category_id === selectedCategory) : sortedItems;
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
      description: `${item.title} נוסף לסל המוצרים`
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
  return <div className="min-h-screen bg-background" id="catalog-page">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[70vh] bg-cover bg-center" style={{
        backgroundImage: `url('/lovable-uploads/catalog-hero-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* White Cloud Gradient Overlay - ends at second third from top */}
        <div className="absolute inset-0" 
             style={{
               background: `
                 radial-gradient(ellipse 120% 35% at 50% 40%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0.3) 80%, transparent 100%),
                 radial-gradient(ellipse 90% 30% at 30% 38%, rgba(255,255,255,0.8) 0%, transparent 70%),
                 radial-gradient(ellipse 100% 32% at 70% 42%, rgba(255,255,255,0.7) 0%, transparent 75%)
               `,
               filter: 'blur(30px)'
             }} 
        />
        
        {/* Smooth transition layer - connects cloud to solid white */}
        <div className="absolute inset-0" 
             style={{
               background: `
                 linear-gradient(to bottom, 
                   transparent 0%, 
                   transparent 30%, 
                   rgba(255,255,255,0.2) 35%,
                   rgba(255,255,255,0.5) 42%,
                   rgba(255,255,255,0.8) 50%,
                   rgba(255,255,255,0.95) 58%,
                   white 65%
                 )
               `,
               filter: 'blur(20px)'
             }} 
        />
        
        {/* Final solid white bottom section */}
        <div className="absolute inset-0" 
             style={{
               background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, white 70%)'
             }} 
        />
        
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 z-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg">
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" className="h-32 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
          </div>
        </div>

        {/* Top Right Buttons */}
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
          <Button onClick={handleDownloadCatalog} className="bg-white/90 hover:bg-white text-gray-800 rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur-sm">
            <Download className="h-4 w-4 ml-2" />
            הורד קטלוג
          </Button>
          <Link to="/" className="flex items-center text-white hover:text-pink-200 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowRight className="h-5 w-5 ml-2" />
            חזרה לעמוד הבית
          </Link>
        </div>

        {/* Content Container - positioned at the transition */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          {/* Title with Layered Effect - Hebrew in front, English in back */}
          <div className="relative mb-8">
            {/* English Background Text - more visible and smaller */}
            <h1 className="font-['Gloria'] text-[100px] md:text-[140px] font-bold text-gray-400/70 leading-none select-none">
              Catalog
            </h1>
            {/* Hebrew Front Text */}
            <h1 className="font-ploni-black-2 text-[100px] md:text-[140px] font-bold text-[#3d5a3d] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none" 
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                }}>
              קטלוג
            </h1>
          </div>

          {/* Description Text - on white section */}
          <div className="text-gray-800 text-base md:text-lg space-y-1 mt-24">
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
            <Button onClick={() => setSelectedCategory('')} className="bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white rounded-full px-6 py-2">
              הכל
            </Button>
            {categories.map(category => <div key={category.id}>
                <Button onClick={() => setSelectedCategory(category.id)} className="bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white rounded-full px-6 py-2">
                  {category.name}
                </Button>
              </div>)}
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
          {selectedCategory === '' ? (/* Show all categories with their items */
        categories.map(category => {
          const categoryItems = sortedItems.filter(item => item.category_id === category.id);
          if (categoryItems.length === 0) return null;

          // Group items by subcategory
          const groupedItems = categoryItems.reduce((groups: Record<string, CatalogItem[]>, item) => {
            const key = item.subcategory || 'main';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
          }, {});
          return <div key={category.id} className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                    {category.subtitle && <p className="text-gray-600 mt-1">{category.subtitle}</p>}
                  </div>
                  
                  {Object.entries(groupedItems).map(([subcategoryKey, items]) => <div key={subcategoryKey} className="space-y-4">
                      {subcategoryKey !== 'main' && <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
                            {subcategoryKey}
                          </h3>
                        </div>}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => {
                  return <div key={item.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => handleImageClick(item)}>
                              <div className="aspect-square overflow-hidden relative">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="p-4">
                                    <p className="text-white text-sm font-medium">דגם {item.title}</p>
                                  </div>
                                </div>
                                
                                {/* Bottom overlay with price and button */}
                                <div className="absolute bottom-0 left-0 right-0 bg-[#3d5a3d] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">להזמנה</span>
                                    <ArrowRight className="h-4 w-4" />
                                  </div>
                                  {item.price && <span className="text-lg font-bold">₪{item.price}</span>}
                                </div>
                              </div>
                            </div>;
                })}
                      </div>
                    </div>)}
                </div>;
        })) : (/* Show single category items with subcategories */
        (() => {
          const selectedCategoryItems = sortedItems.filter(item => item.category_id === selectedCategory);

          // Group items by subcategory
          const groupedItems = selectedCategoryItems.reduce((groups: Record<string, CatalogItem[]>, item) => {
            const key = item.subcategory || 'main';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
          }, {});
          return <div className="space-y-8">
                  {Object.entries(groupedItems).map(([subcategoryKey, items]) => <div key={subcategoryKey} className="space-y-4">
                      {subcategoryKey !== 'main' && <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
                            {subcategoryKey}
                          </h3>
                        </div>}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(item => {
                  return <div key={item.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => handleImageClick(item)}>
                              <div className="aspect-square overflow-hidden relative">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="p-4">
                                    <p className="text-white text-sm font-medium">דגם {item.title}</p>
                                  </div>
                                </div>
                                
                                {/* Bottom overlay with price and button */}
                                <div className="absolute bottom-0 left-0 right-0 bg-[#3d5a3d] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">להזמנה</span>
                                    <ArrowRight className="h-4 w-4" />
                                  </div>
                                  {item.price && <span className="text-lg font-bold">₪{item.price}</span>}
                                </div>
                              </div>
                            </div>;
                })}
                      </div>
                    </div>)}
                </div>;
        })())}
        </div>

        {filteredItems.length === 0 && <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין פריטים בקטגוריה זו</p>
          </div>}

        {/* Contact Section */}
        <div className="mt-16 border-t pt-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-['Gloria'] text-center mb-8">
              <span className="text-gray-400">Contact</span>
              <span className="mr-3">צור קשר</span>
            </h2>
            
            <div className="space-y-4 text-right">
              <div>
                <input type="text" placeholder="שם מלא" className="w-full border-b border-gray-300 py-2 px-0 focus:outline-none focus:border-[#3d5a3d] bg-transparent" />
              </div>
              <div>
                <input type="tel" placeholder="טלפון" className="w-full border-b border-gray-300 py-2 px-0 focus:outline-none focus:border-[#3d5a3d] bg-transparent" />
              </div>
              <div>
                <input type="email" placeholder="אימייל" className="w-full border-b border-gray-300 py-2 px-0 focus:outline-none focus:border-[#3d5a3d] bg-transparent" />
              </div>
              
              <div className="pt-6">
                <button onClick={() => window.open('https://wa.me/972527614436', '_blank')} className="w-full bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white py-3 rounded-full transition-colors">
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

        {getTotalItems() > 0 && <div className="fixed bottom-6 right-6 z-50">
            <Link to="/cart">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-200 relative">
                <ShoppingCart className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-sm w-7 h-7 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              </Button>
            </Link>
          </div>}

        {/* Image Viewer Modal */}
        <ImageViewer isOpen={imageViewerOpen} onClose={() => setImageViewerOpen(false)} currentItem={currentImageItem} items={filteredItems} onPrevious={handlePreviousImage} onNext={handleNextImage} />
      </div>
    </div>;
};
export default Catalog;