import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, Heart, Gift, Crown, Sparkles, Camera, Phone, Mail, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import wazeIcon from '@/assets/waze-icon.png';
import downloadCatalogBtn from '@/assets/download-catalog-btn.png';
import downloadArrow from '@/assets/download-arrow.png';
import { downloadCatalogPDF } from '@/utils/catalogPdf';
import { useToast } from '@/hooks/use-toast';

interface HomepageSlide {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  order_index: number;
  is_active: boolean;
  font_family: string;
}

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch slides from database
  const { data: slides = [] } = useQuery({
    queryKey: ['homepage-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fallback images if no slides in database
  const fallbackImages = [
    {
      id: '1',
      image_url: "/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png",
      title: "זרי אירוסין",
      description: "זרי פרחים מרהיבים לחגיגת האירוסין",
      order_index: 1,
      is_active: true,
      font_family: 'font-sans'
    },
    {
      id: '2',
      image_url: "/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png",
      title: "סדנאות",
      description: "סדנאות שזירת פרחים מקצועיות",
      order_index: 2,
      is_active: true,
      font_family: 'font-sans'
    },
    {
      id: '3',
      image_url: "/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png",
      title: "זרי כלה",
      description: "זרי כלה מעוצבים במיוחד ליום המיוחד שלכם",
      order_index: 3,
      is_active: true,
      font_family: 'font-sans'
    },
    {
      id: '4',
      image_url: "/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png",
      title: "עיצוב מתנות",
      description: "מתנות מעוצבות עם פרחים ושוקולדים",
      order_index: 4,
      is_active: true,
      font_family: 'font-sans'
    },
    {
      id: '5',
      image_url: "/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png",
      title: "כיסאות כלה",
      description: "כיסאות כלה מעוצבים במיוחד",
      order_index: 5,
      is_active: true,
      font_family: 'font-sans'
    }
  ];

  const images = slides.length > 0 ? slides : fallbackImages;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleLogoClick = () => {
    const currentTime = Date.now();
    
    if (currentTime - lastClickTime > 1000) {
      setLogoClickCount(1);
    } else {
      setLogoClickCount(prev => prev + 1);
    }
    
    setLastClickTime(currentTime);

    if (logoClickCount === 2) {
      navigate('/admin');
      setLogoClickCount(0);
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/972527614436', '_blank');
  };

  const openGoogleMaps = () => {
    window.open('https://maps.google.com/?q=שערי+תשובה+14+מודיעין+עילית', '_blank');
  };

  const openWaze = () => {
    window.open('https://waze.com/ul?q=שערי תשובה 14, מודיעין עילית', '_blank');
  };

  // Fetch categories and items for PDF download
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
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
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const handleDownloadCatalog = async () => {
    try {
      await downloadCatalogPDF(items, categories);
      toast({
        title: "הקטלוג הורד בהצלחה",
        description: "הקטלוג הדיגיטלי שלנו הורד למחשב שלך",
      });
    } catch (error) {
      console.error('Error downloading catalog:', error);
      toast({
        title: "שגיאה בהורדת הקטלוג",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Fixed WhatsApp Button */}
      <Button 
        onClick={openWhatsApp}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full p-0 shadow-2xl"
        size="icon"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
        </svg>
      </Button>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
              <Link 
                to="/catalog" 
                className="px-4 py-2 hover:text-primary font-medium transition-colors"
              >
                קטלוג
              </Link>
              <a 
                href="#about" 
                className="px-4 py-2 hover:text-primary font-medium transition-colors"
              >
                אודות
              </a>
              <a 
                href="#contact" 
                className="px-4 py-2 hover:text-primary font-medium transition-colors"
              >
                צור קשר
              </a>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t py-4">
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/catalog" 
                  className="px-4 py-2 hover:bg-secondary rounded-lg font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  קטלוג
                </Link>
                <a 
                  href="#about" 
                  className="px-4 py-2 hover:bg-secondary rounded-lg font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  אודות
                </a>
                <a 
                  href="#contact" 
                  className="px-4 py-2 hover:bg-secondary rounded-lg font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  צור קשר
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          
          {/* Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 flex flex-col items-center justify-center">
            <h1 className="font-gloria text-[140px] md:text-[200px] font-bold text-primary mb-2" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.6)' }}>
              בוקט
            </h1>
            <p className="font-assistant text-base md:text-lg text-white text-center px-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              מתמחים בשזירת פרחים לאירוסין ולחתונות של רגע
            </p>
            
            {/* Navigation Arrows */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronRight className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronLeft className="h-5 w-5 text-gray-800" />
              </button>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/60 hover:bg-white/80 w-2'
              }`}
            />
          ))}
        </div>

        {/* Download Catalog Button - Positioned at section boundary */}
        <div className="absolute left-8 bottom-0 translate-y-1/2 z-50">
          {/* White circle background */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 w-32 h-16 bg-white rounded-b-full shadow-lg z-10" />
          
          <button
            onClick={handleDownloadCatalog}
            className="relative hover:scale-110 transition-transform duration-300 group"
            aria-label="להורדת הקטלוג הדיגיטלי שלנו"
          >
            <div className="relative w-14 h-14">
              {/* Rotating text circle */}
              <img 
                src={downloadCatalogBtn} 
                alt="" 
                className="w-full h-full drop-shadow-2xl animate-spin-slow mix-blend-multiply"
              />
              {/* Static arrow in center */}
              <img 
                src={downloadArrow} 
                alt="להורדת הקטלוג הדיגיטלי שלנו" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6"
              />
            </div>
          </button>
        </div>
      </section>

      {/* Black Gallery Section with Center Focus */}
      <section className="relative py-16 bg-[#314020]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
            
            <div className="relative w-72 h-96 md:w-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={images[currentImageIndex]?.image_url}
                alt={images[currentImageIndex]?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 py-4 text-center">
                <p className="font-assistant font-bold text-xl text-gray-800">
                  {images[currentImageIndex]?.title}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Images */}
            <div className="flex gap-4">
              <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
                <img src="/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png" alt="זרי אירוסין" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4 pt-8">
                <div className="w-32 h-32 rounded-lg overflow-hidden shadow-lg">
                  <img src="/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png" alt="סדנאות" className="w-full h-full object-cover" />
                </div>
                <div className="w-32 h-32 rounded-lg overflow-hidden shadow-lg">
                  <img src="/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png" alt="זרי כלה" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="font-assistant text-5xl font-bold mb-6 text-gray-800">אודות</h2>
              <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                <p>
                  ברוכים הבאים לבוקט - עולם שזירת הפרחים המקצועי שלנו! 
                  אנו מתמחים בעיצוב וביצוע זרי כלה מרהיבים, עיצוב חופות חלומיות, 
                  והפקת אירועים מושלמים.
                </p>
                <p>
                  כל פרח נבחר בקפידה, כל עיצוב נוצר באהבה. 
                  המומחיות שלנו משתרעת על פני מגוון רחב של שירותים: 
                  מזרי אירוסין מרשימים ועד מתנות מעוצבות בקפידה עם שוקולדים ופרחים.
                </p>
                <p className="font-semibold text-xl">
                  כל יצירה היא ייחודית ומותאמת אישית ליום המיוחד שלכם!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Icons Section */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            {[
              { icon: Heart, text: 'זרי כלה' },
              { icon: Crown, text: 'כיסאות כלה' },
              { icon: Sparkles, text: 'עיצוב חופות' },
              { icon: Gift, text: 'מתנות מעוצבות' },
              { icon: Camera, text: 'הפקת אירועים' }
            ].map((service, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg hover:scale-105 transition-transform">
                  <service.icon className="h-12 w-12 text-black" />
                </div>
                <p className="text-white font-assistant text-sm md:text-base font-medium">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-12 text-gray-800">הגלריה שלנו</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.slice(0, 4).map((image, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                <img src={image.image_url} alt={image.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-12 text-gray-800">קטלוג</h2>
          <p className="text-center text-gray-600 mb-8 text-lg">
            גלו את המגוון המלא שלנו - מזרי כלה מרהיבים ועד עיצובי אירועים מושלמים
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { img: "/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png", title: "זרי אירוסין" },
              { img: "/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png", title: "זרי כלה" },
              { img: "/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png", title: "כיסאות כלה" },
              { img: "/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png", title: "אירועים" }
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to="/catalog"
                className="relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
              >
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-8">
                  <h3 className="font-assistant text-3xl font-bold text-white">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/catalog">
              <Button size="lg" className="px-12 py-6 text-lg">
                לקטלוג המלא
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-4 text-gray-800">איך זה עובד?</h2>
          <div className="bg-black text-white p-8 rounded-2xl shadow-xl">
            <p className="text-lg leading-relaxed text-center">
              התהליך שלנו פשוט ונעים: תתקשרו אלינו או שלחו הודעה בוואטסאפ, 
              נקבע פגישה להתייעצות, נבחר יחד את הפרחים והעיצוב המושלם עבורכם, 
              ונדאג שהכל יגיע במועד ובמצב מושלם ליום המיוחד שלכם.
            </p>
          </div>
        </div>
      </section>

      {/* Flower Selection Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-4 text-gray-800">בחירת הפרחים</h2>
          <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl shadow-lg">
            <p className="text-lg leading-relaxed text-center text-gray-700">
              אנו עובדים עם הפרחים הטריים והאיכותיים ביותר. 
              כל זר מעוצב בקפידה רבה, עם תשומת לב לכל פרט. 
              נייעץ לכם בבחירת הפרחים המתאימים ביותר לאירוע שלכם, 
              תוך התחשבות בעונה, בסגנון ובתקציב.
            </p>
          </div>
        </div>
      </section>

      {/* Presentation Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-4 text-gray-800">הצגת והמשלוח</h2>
          <div className="bg-black text-white p-8 rounded-2xl shadow-xl">
            <p className="text-lg leading-relaxed text-center">
              לפני האירוע, נציג לכם את העיצוב הסופי לאישור. 
              ביום האירוע, נדאג למשלוח מהיר ובטוח, ונוודא שהכל מושלם. 
              השירות שלנו כולל התקנה במקום האירוע והקפדה על כל פרט.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-12 text-white">
            זה הזמן שתאהבו לבלע נו
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "ניסיון עשיר",
                text: "שנות ניסיון בעיצוב אירועים ושזירת פרחים ברמה הגבוהה ביותר. עבדנו עם מאות זוגות ויצרנו אירועים בלתי נשכחים."
              },
              {
                title: "התאמה אישית",
                text: "כל עיצוב מותאם במיוחד עבורכם. אנו מקשיבים לחזון שלכם ומתרגמים אותו למציאות פרחונית מדהימה."
              },
              {
                title: "איכות ללא פשרות",
                text: "רק הפרחים הטריים והאיכותיים ביותר. אנו בוחרים בקפידה כל פרח ומתחייבים לשירות ואיכות ללא פשרות."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-xl">
                <h3 className="font-assistant text-2xl font-bold mb-4 text-gray-800 text-center">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed text-center">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-12 text-gray-800">צור קשר</h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-center gap-4 text-lg">
              <Phone className="h-6 w-6 text-primary" />
              <a href="tel:052-761-4436" className="hover:text-primary transition-colors font-medium">
                052-761-4436
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-lg">
              <Mail className="h-6 w-6 text-primary" />
              <a href="mailto:info@bouquet.co.il" className="hover:text-primary transition-colors font-medium">
                info@bouquet.co.il
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-lg text-center">
              <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="font-medium">שערי תשובה 14, מודיעין עילית</span>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button 
                onClick={openWaze}
                variant="outline"
                className="gap-2"
              >
                <img src={wazeIcon} alt="Waze" className="h-5 w-5" />
                נווט בווייז
              </Button>
              <Button 
                onClick={openGoogleMaps}
                variant="outline"
                className="gap-2"
              >
                <MapPin className="h-5 w-5" />
                גוגל מפות
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט לוגו" 
              className="h-20 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-white/60 text-sm text-center">
              © 2024 בוקט - עיצוב פרחים ואירועים. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
