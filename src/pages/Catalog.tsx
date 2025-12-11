import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Plus, X, ChevronLeft, ChevronRight, Download, MapPin, Mail, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import arrowSimple from '@/assets/arrow-simple.png';
import { Button } from '@/components/ui/button';
import { ImageViewer } from '@/components/ui/image-viewer';
import { OrderDialog } from '@/components/ui/order-dialog';
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
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [currentImageItem, setCurrentImageItem] = useState<CatalogItem | null>(null);
  const [currentOrderItem, setCurrentOrderItem] = useState<CatalogItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const {
    addToCart,
    getTotalItems
  } = useCart();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  const openGoogleMaps = () => {
    const address = 'שערי תשובה 14, מודיעין עלית';
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.phone || !contactForm.email || !contactForm.message) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast({
        title: "שגיאה",
        description: "אנא הזן כתובת מייל תקינה",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const message = `שם: ${contactForm.name}%0Aטלפון: ${contactForm.phone}%0Aמייל: ${contactForm.email}%0A%0Aהודעה:%0A${contactForm.message}`;
      window.open(`https://wa.me/972527614436?text=${encodeURIComponent(message)}`, '_blank');
      toast({
        title: "ההודעה נשלחה בהצלחה",
        description: "ניצור איתך קשר בהקדם"
      });

      setContactForm({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleOrderClick = (item: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening image viewer
    setCurrentOrderItem(item);
    setOrderDialogOpen(true);
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
  return <div className="min-h-screen" style={{ backgroundColor: '#F8FBF4' }} id="catalog-page">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[70vh] bg-cover bg-center" style={{
        backgroundImage: `url('/lovable-uploads/catalog-hero-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* White Cloud Gradient Overlay - only bottom fifth (20%) */}
        <div className="absolute inset-0" 
             style={{
               background: `
                 radial-gradient(ellipse 120% 25% at 50% 92%, #F8FBF4 0%, rgba(248,251,244,0.95) 20%, rgba(248,251,244,0.85) 40%, rgba(248,251,244,0.6) 60%, rgba(248,251,244,0.3) 80%, transparent 100%),
                 radial-gradient(ellipse 90% 20% at 30% 90%, rgba(248,251,244,0.8) 0%, transparent 70%),
                 radial-gradient(ellipse 100% 22% at 70% 94%, rgba(248,251,244,0.7) 0%, transparent 75%)
               `,
               filter: 'blur(35px)'
             }} 
        />
        
        {/* Multiple smooth transition layers for seamless blend */}
        <div className="absolute inset-0" 
             style={{
               background: `
                 linear-gradient(to bottom, 
                   transparent 0%, 
                   transparent 72%, 
                   rgba(248,251,244,0.1) 76%,
                   rgba(248,251,244,0.25) 80%,
                   rgba(248,251,244,0.45) 84%,
                   rgba(248,251,244,0.65) 88%,
                   rgba(248,251,244,0.85) 92%,
                   rgba(248,251,244,0.95) 96%,
                   #F8FBF4 100%
                 )
               `,
               filter: 'blur(25px)'
             }} 
        />
        
        {/* Additional ultra-soft blend layer */}
        <div className="absolute inset-0" 
             style={{
               background: `
                 linear-gradient(to bottom, 
                   transparent 0%, 
                   transparent 78%, 
                   rgba(248,251,244,0.3) 85%,
                   rgba(248,251,244,0.7) 92%,
                   #F8FBF4 100%
                 )
               `,
               filter: 'blur(40px)'
             }} 
        />
        
         {/* Final solid bottom section */}
        <div className="absolute inset-0" 
             style={{
               background: 'linear-gradient(to bottom, transparent 0%, transparent 92%, rgba(248,251,244,0.5) 95%, #F8FBF4 100%)'
             }} 
        />
        
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 z-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg">
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-32 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
          </div>
        </div>

        {/* Content Container - positioned at the transition */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          {/* Title with Layered Effect - Hebrew in front, English in back */}
          <div className="relative mb-8">
            {/* English Background Text - more visible and smaller */}
            <h1 className="font-allura text-[115px] md:text-[160px] font-bold text-gray-400/70 leading-none select-none" style={{ transform: 'translate(15px, -10px)' }}>
              Catalog
            </h1>
            {/* Hebrew Front Text */}
            <h1 className="font-synopsis text-[100px] md:text-[140px] font-bold text-[#314020] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none"
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                }}>
              קטלוג
            </h1>
          </div>

          {/* Description Text - on white section */}
          <div className="text-gray-800 text-base md:text-lg space-y-1 mt-24 mb-16">
            <p className="font-ploni-aaa font-semibold">כל זר נולד מתוך שיחה תיאום ציפיות, הבנה, השראה וחיבור...</p>
            <p className="font-ploni-aaa font-light">בקטלוג שלנו תגלו זרים מרהיבים עיצובים מוקפדים</p>
            <p className="font-ploni-aaa font-light">גלו,התרשמו ,ותנו לעצמכם להנות מכל הטוב הזה</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6 mt-12">
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              onClick={() => {
                console.log('Selecting all categories');
                setSelectedCategory('');
              }} 
              className={`${
                selectedCategory === '' 
                  ? 'bg-[#6b8e6b] shadow-[0_0_20px_rgba(107,142,107,0.7)]' 
                  : 'bg-[#3d5a3d]'
              } hover:bg-[#6b8e6b] text-white rounded-full px-6 py-2 shadow-lg hover:shadow-[0_0_20px_rgba(107,142,107,0.7)] transition-all duration-300`}
            >
              הכל
            </Button>
            {categories.map(category => 
              <Button 
                key={category.id}
                onClick={() => {
                  console.log('Selecting category:', category.name, category.id);
                  setSelectedCategory(category.id);
                }} 
                className={`${
                  selectedCategory === category.id 
                    ? 'bg-[#6b8e6b] shadow-[0_0_20px_rgba(107,142,107,0.7)]' 
                    : 'bg-[#3d5a3d]'
                } hover:bg-[#6b8e6b] text-white rounded-full px-6 py-2 shadow-lg hover:shadow-[0_0_20px_rgba(107,142,107,0.7)] transition-all duration-300`}
              >
                {category.name}
              </Button>
            )}
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
                    <h2 className="text-2xl font-ploni-aaa font-black text-gray-800">{category.name}</h2>
                    {category.subtitle && <p className="text-gray-600 mt-1 font-ploni-aaa font-light">{category.subtitle}</p>}
                  </div>
                  
                  {Object.entries(groupedItems).map(([subcategoryKey, items]) => <div key={subcategoryKey} className="space-y-4">
                      {subcategoryKey !== 'main' && <div className="text-center">
                          <h3 className="text-lg font-ploni-aaa font-semibold text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
                            {subcategoryKey}
                          </h3>
                        </div>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {items.map(item => {
                  return <div key={item.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => handleImageClick(item)}>
                              <div className="aspect-[3/4] overflow-hidden relative">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                
                                 {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {item.title && (
                                    <div className="p-4">
                                      <p className="text-white text-base font-synopsis font-light">דגם {item.title}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Bottom overlay with price and button */}
                                {category.allow_cart && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-[#3d5a3d] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center px-4 py-3">
                                    {item.price && (
                                      <>
                                        <span className="text-lg font-ploni-aaa font-bold">{item.price} ש״ח</span>
                                        <div className="h-6 w-px bg-white/40 mx-3"></div>
                                      </>
                                    )}
                                    <button 
                                      onClick={(e) => handleOrderClick(item, e)}
                                      className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-auto"
                                    >
                                      <span className="text-base font-synopsis font-light">להזמנה מהירה</span>
                                      <img src={arrowSimple} alt="" className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>;
                })}
                      </div>
                    </div>)}
                </div>;
        })) : (/* Show single category items with subcategories */
        (() => {
          const selectedCategoryData = categories.find(c => c.id === selectedCategory);
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
                          <h3 className="text-lg font-ploni-aaa font-semibold text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
                            {subcategoryKey}
                          </h3>
                        </div>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {items.map(item => {
                  return <div key={item.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => handleImageClick(item)}>
                              <div className="aspect-[3/4] overflow-hidden relative">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {item.title && (
                                    <div className="p-4">
                                      <p className="text-white text-base font-synopsis font-light">דגם {item.title}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Bottom overlay with price and button */}
                                {selectedCategoryData?.allow_cart && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-[#3d5a3d] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center px-4 py-3">
                                    {item.price && (
                                      <>
                                        <span className="text-lg font-ploni-aaa font-bold">{item.price} ש״ח</span>
                                        <div className="h-6 w-px bg-white/40 mx-3"></div>
                                      </>
                                    )}
                                    <button 
                                      onClick={(e) => handleOrderClick(item, e)}
                                      className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-auto"
                                    >
                                      <span className="text-base font-synopsis font-light">להזמנה מהירה</span>
                                      <img src={arrowSimple} alt="" className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>;
                })}
                      </div>
                    </div>)}
                </div>;
        })())}
        </div>

        {filteredItems.length === 0 && <div className="text-center py-12">
            <p className="text-gray-500 text-lg font-ploni-aaa font-light">אין פריטים בקטגוריה זו</p>
          </div>}

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
        
        {/* Order Dialog */}
        <OrderDialog isOpen={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} item={currentOrderItem} />
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Side - Title and Contact Info */}
            <div className="w-full md:w-1/2 text-right flex flex-col justify-start pt-12">
              {/* Title with layered effect */}
              <div className="relative mb-12">
                <h2 className="font-allura text-[95px] md:text-[105px] font-semibold text-[#314020]/30 opacity-50 leading-none select-none" style={{
                  transform: 'translate(15px, -10px)'
                }}>
                  Contact us
                </h2>
                <h2 className="font-synopsis text-[80px] md:text-[90px] font-semibold text-[#314020] absolute top-1/2 right-0 -translate-y-1/2 leading-none">
                  צור קשר
                </h2>
              </div>

              {/* Contact Information */}
              <div className="space-y-6 mt-10">
                <div className="flex items-center justify-start gap-3 text-lg">
                  <MapPin className="h-6 w-6 text-[#314020]" />
                  <button onClick={openGoogleMaps} className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-left text-[#314020]">
                    שערי תשובה 14 - מודיעין עלית
                  </button>
                </div>
                
                <div className="flex items-center justify-start gap-3 text-lg">
                  <Mail className="h-6 w-6 text-[#314020]" />
                  <a href="mailto:R0527614436@GMAIL.COM" className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    R0527614436@GMAIL.COM
                  </a>
                </div>
                
                <div className="flex items-center justify-start gap-3 text-lg">
                  <Phone className="h-6 w-6 text-[#314020]" />
                  <a href="tel:0527614436" className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    0527614436
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="w-full md:w-1/2">
              <form onSubmit={handleContactSubmit} className="space-y-4 p-8">
                <div className="space-y-1 text-right">
                  <label htmlFor="name" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    שם מלא
                  </label>
                  <input 
                    id="name" 
                    type="text" 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} 
                    className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" 
                    required 
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="phone" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    טלפון
                  </label>
                  <input 
                    id="phone" 
                    type="tel" 
                    value={contactForm.phone} 
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} 
                    className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" 
                    required 
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="email" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    אימייל
                  </label>
                  <input 
                    id="email" 
                    type="email" 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} 
                    className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" 
                    required 
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="message" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    הודעה
                  </label>
                  <textarea 
                    id="message" 
                    value={contactForm.message} 
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} 
                    className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light min-h-[60px] resize-none text-[#314020]" 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white font-ploni-aaa font-medium text-lg py-3 rounded-full transition-all duration-300 disabled:opacity-50" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'שליחה'}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  בשליחת הטופס את/ה מסכימ/ה ל<Link to="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

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
        
        {/* Order Dialog */}
        <OrderDialog isOpen={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} item={currentOrderItem} />
    </div>;
};
export default Catalog;