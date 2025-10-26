import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, Heart, Gift, Crown, Sparkles, Camera, Phone, Mail, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import wazeIcon from '@/assets/waze-icon.png';
import downloadCatalogBtn from '@/assets/download-catalog-btn.png';
import downloadArrow from '@/assets/download-arrow.png';
import heroImage from '@/assets/hero-image.jpg';
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
  const {
    toast
  } = useToast();

  // Fetch slides from database
  const {
    data: slides = []
  } = useQuery({
    queryKey: ['homepage-slides'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('homepage_slides').select('*').eq('is_active', true).order('order_index', {
        ascending: true
      });
      if (error) throw error;
      return data || [];
    }
  });

  // Single hero image
  const fallbackImages = [{
    id: '1',
    image_url: heroImage,
    title: "בוקט",
    description: "מתמחים בשזירת פרחים לאירוסין ולחתונות של רגע",
    order_index: 1,
    is_active: true,
    font_family: 'font-sans'
  }];
  const images = slides.length > 0 ? slides : fallbackImages;
  // Auto-slide only if there are multiple images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => prevIndex === images.length - 1 ? 0 : prevIndex + 1);
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
  const {
    data: categories = []
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').order('order_index', {
        ascending: true
      });
      if (error) throw error;
      return data || [];
    }
  });
  const {
    data: items = []
  } = useQuery({
    queryKey: ['catalog-items'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('catalog_items').select('*').order('created_at', {
        ascending: true
      });
      if (error) throw error;
      return data || [];
    }
  });
  const handleDownloadCatalog = async () => {
    try {
      await downloadCatalogPDF(items, categories);
      toast({
        title: "הקטלוג הורד בהצלחה",
        description: "הקטלוג הדיגיטלי שלנו הורד למחשב שלך"
      });
    } catch (error) {
      console.error('Error downloading catalog:', error);
      toast({
        title: "שגיאה בהורדת הקטלוג",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Fixed WhatsApp Button */}
      

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            {/* Logo */}
            <div className="flex items-center">
              <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
              <Link to="/catalog" className="px-4 py-2 hover:text-primary font-medium transition-colors">
                קטלוג
              </Link>
              <a href="#about" className="px-4 py-2 hover:text-primary font-medium transition-colors">
                אודות
              </a>
              <a href="#contact" className="px-4 py-2 hover:text-primary font-medium transition-colors">
                צור קשר
              </a>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && <div className="md:hidden border-t py-4">
              <nav className="flex flex-col space-y-2">
                <Link to="/catalog" className="px-4 py-2 hover:bg-secondary rounded-lg font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  קטלוג
                </Link>
                <a href="#about" className="px-4 py-2 hover:bg-secondary rounded-lg font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  אודות
                </a>
                <a href="#contact" className="px-4 py-2 hover:bg-secondary rounded-lg font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  צור קשר
                </a>
              </nav>
            </div>}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-visible">
        <div className="relative w-full h-full">
          {images.map((image, index) => <div key={image.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>
              <img src={image.image_url} alt={image.title} className="w-full h-full object-cover scale-110" />
            </div>)}
          
          {/* Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 flex flex-col items-start justify-center pl-12 md:pl-20">
            <h1 style={{
            textShadow: '4px 4px 8px rgba(0,0,0,0.6)'
          }} className="font-gloria text-[140px] md:text-[200px] font-semibold text-primary mb-2 tracking-wider">
              בוקט
            </h1>
            <p style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }} className="font-assistant text-base text-green-900 font-extrabold md:text-3xl">כשהפרחים הופכים לרגעים של קסם</p>
            
            {/* Navigation Arrows - only show if multiple images */}
            {images.length > 1 && <div className="flex gap-3 mt-6">
                <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg">
                  <ChevronRight className="h-5 w-5 text-gray-800" />
                </button>
                <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg">
                  <ChevronLeft className="h-5 w-5 text-gray-800" />
                </button>
              </div>}
          </div>
        </div>

        {/* Dots Indicator - only show if multiple images */}
        {images.length > 1 && <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80 w-2'}`} />)}
          </div>}

        {/* Download Catalog Button - Positioned at section boundary */}
        <div className="absolute left-4 bottom-0 translate-y-1/2 z-[100]">
          {/* White circle background - behind the button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 w-32 h-16 bg-white rounded-b-full shadow-lg -z-10" />
          
          <button onClick={handleDownloadCatalog} className="relative z-10 group" aria-label="להורדת הקטלוג הדיגיטלי שלנו">
            <div className="relative w-24 h-24 hover:scale-110 transition-transform duration-300 mx-[13px] px-0 my-0">
              {/* Rotating text circle */}
              <img src={downloadCatalogBtn} alt="" className="w-full h-full drop-shadow-2xl animate-spin-slow mix-blend-multiply relative z-20" />
              {/* Static arrow in center */}
              <img src={downloadArrow} alt="להורדת הקטלוג הדיגיטלי שלנו" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-30" />
            </div>
          </button>
        </div>
        
        {/* Curved bottom edge with transparent cutout */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white overflow-visible pointer-events-none">
          <svg viewBox="0 0 1200 100" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <mask id="curve-mask">
                <rect width="1200" height="100" fill="white" />
                <ellipse cx="600" cy="0" rx="80" ry="100" fill="black" />
              </mask>
            </defs>
            <path d="M 0,0 L 0,100 L 1200,100 L 1200,0 Z" fill="white" mask="url(#curve-mask)" />
          </svg>
        </div>
      </section>

      {/* Black Gallery Section with Center Focus */}
      <section className="relative py-16 bg-[#314020] mt-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-6">
            <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
            
            <div className="relative w-72 h-96 md:w-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img src={images[currentImageIndex]?.image_url} alt={images[currentImageIndex]?.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 py-4 text-center">
                <p className="font-assistant font-bold text-xl text-gray-800">
                  {images[currentImageIndex]?.title}
                </p>
              </div>
            </div>
            
            <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
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
            {[{
            icon: Heart,
            text: 'זרי כלה'
          }, {
            icon: Crown,
            text: 'כיסאות כלה'
          }, {
            icon: Sparkles,
            text: 'עיצוב חופות'
          }, {
            icon: Gift,
            text: 'מתנות מעוצבות'
          }, {
            icon: Camera,
            text: 'הפקת אירועים'
          }].map((service, idx) => <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg hover:scale-105 transition-transform">
                  <service.icon className="h-12 w-12 text-black" />
                </div>
                <p className="text-white font-assistant text-sm md:text-base font-medium">{service.text}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-5xl font-bold text-center mb-12 text-gray-800">הגלריה שלנו</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.slice(0, 4).map((image, idx) => <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                <img src={image.image_url} alt={image.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>)}
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
            {[{
            img: "/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png",
            title: "זרי אירוסין"
          }, {
            img: "/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png",
            title: "זרי כלה"
          }, {
            img: "/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png",
            title: "כיסאות כלה"
          }, {
            img: "/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png",
            title: "אירועים"
          }].map((item, idx) => <Link key={idx} to="/catalog" className="relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-8">
                  <h3 className="font-assistant text-3xl font-bold text-white">{item.title}</h3>
                </div>
              </Link>)}
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
            {[{
            title: "ניסיון עשיר",
            text: "שנות ניסיון בעיצוב אירועים ושזירת פרחים ברמה הגבוהה ביותר. עבדנו עם מאות זוגות ויצרנו אירועים בלתי נשכחים."
          }, {
            title: "התאמה אישית",
            text: "כל עיצוב מותאם במיוחד עבורכם. אנו מקשיבים לחזון שלכם ומתרגמים אותו למציאות פרחונית מדהימה."
          }, {
            title: "איכות ללא פשרות",
            text: "רק הפרחים הטריים והאיכותיים ביותר. אנו בוחרים בקפידה כל פרח ומתחייבים לשירות ואיכות ללא פשרות."
          }].map((item, idx) => <div key={idx} className="bg-white p-8 rounded-2xl shadow-xl">
                <h3 className="font-assistant text-2xl font-bold mb-4 text-gray-800 text-center">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed text-center">{item.text}</p>
              </div>)}
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
              <Button onClick={openWaze} variant="outline" className="gap-2">
                <img src={wazeIcon} alt="Waze" className="h-5 w-5" />
                נווט בווייז
              </Button>
              <Button onClick={openGoogleMaps} variant="outline" className="gap-2">
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
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" className="h-20 w-auto mb-6 brightness-0 invert" />
            <p className="text-white/60 text-sm text-center">
              © 2024 בוקט - עיצוב פרחים ואירועים. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;