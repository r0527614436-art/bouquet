import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Menu, X, ChevronLeft, ChevronRight, Heart, Gift, Crown, Sparkles, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import wazeIcon from '@/assets/waze-icon.png';

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

  // Refs for animation triggers
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const servicesRef = useRef(null);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const isAboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const isContactInView = useInView(contactRef, { once: true, margin: "-100px" });
  const isServicesInView = useInView(servicesRef, { once: true, margin: "-100px" });

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

      {/* Hero Section with Large Title */}
      <motion.section 
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={isHeroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-[60vh] md:h-[70vh] overflow-hidden"
      >
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
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
            <h1 className="font-amatic-sc text-[120px] md:text-[180px] lg:text-[220px] font-bold text-white mb-4" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
              בוקט
            </h1>
            <p className="font-assistant text-lg md:text-xl text-white text-center px-4 mb-8">
              מתמחים בשזירת פרחים לאירוסין ולחתונות של רגע
            </p>
            
            {/* Navigation Arrows */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                className="w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)}
                className="w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </motion.section>

      {/* Gallery Section with Center Focus */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative">
            {/* Main centered image */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
              
              <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={images[currentImageIndex]?.image_url}
                  alt={images[currentImageIndex]?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white py-3 text-center">
                  <p className="font-assistant font-semibold text-lg">
                    {images[currentImageIndex]?.title}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <motion.section 
        id="about"
        ref={aboutRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isAboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-stone-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto">
                <img src="/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png" alt="זרי אירוסין" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img src="/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png" alt="סדנאות" className="w-full h-full object-cover" />
                </div>
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img src="/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png" alt="זרי כלה" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="font-assistant text-4xl font-bold mb-6">אודות</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  ברוכים הבאים לבוקט - עולם שזירת הפרחים המקצועי שלנו!
                </p>
                <p>
                  אנו מתמחים בעיצוב וביצוע זרי כלה מרהיבים, עיצוב חופות חלומיות, 
                  והפקת אירועים מושלמים. כל פרח נבחר בקפידה, כל עיצוב נוצר באהבה.
                </p>
                <p>
                  המומחיות שלנו משתרעת על פני מגוון רחב של שירותים: 
                  מזרי אירוסין מרשימים ועד מתנות מעוצבות בקפידה עם שוקולדים ופרחים.
                </p>
                <p className="font-semibold">
                  כל יצירה היא ייחודית ומותאמת אישית ליום המיוחד שלכם! 🌸
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Services Icons Section */}
      <section className="py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { icon: Heart, text: 'זרי כלה' },
              { icon: Crown, text: 'כיסאות כלה' },
              { icon: Sparkles, text: 'עיצוב חופות' },
              { icon: Gift, text: 'מתנות מעוצבות' },
              { icon: Camera, text: 'אירועים' }
            ].map((service, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3">
                  <service.icon className="h-10 w-10 text-black" />
                </div>
                <p className="text-white font-assistant">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-4xl font-bold text-center mb-12">הגלריה שלנו</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.slice(0, 4).map((image, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src={image.image_url} alt={image.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-4xl font-bold text-center mb-12">קטלוג</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Link to="/catalog" className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <img src="/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png" alt="זרי אירוסין" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white font-assistant text-3xl font-bold">זרי אירוסין</h3>
              </div>
            </Link>
            
            <Link to="/catalog" className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <img src="/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png" alt="כיסאות כלה" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white font-assistant text-3xl font-bold">כיסאות כלה</h3>
              </div>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/catalog" className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <img src="/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png" alt="אירועים פרחים" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white font-assistant text-3xl font-bold">אירועים פרחים</h3>
              </div>
            </Link>
            
            <Link to="/catalog" className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <img src="/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png" alt="פינת מתנות" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white font-assistant text-3xl font-bold">פינת מתנות</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-assistant text-4xl font-bold text-center mb-12">איך זה עובד?</h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl flex-shrink-0">1</div>
                <div>
                  <h3 className="font-assistant text-xl font-semibold mb-2">בחירת סגנון</h3>
                  <p className="text-gray-600">בחרו מתוך מגוון עיצובים בקטלוג שלנו או בואו עם רעיון משלכם. אנחנו כאן כדי להגשים את החזון שלכם.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl flex-shrink-0">2</div>
                <div>
                  <h3 className="font-assistant text-xl font-semibold mb-2">התאמה אישית</h3>
                  <p className="text-gray-600">נתאים את העיצוב לצרכים שלכם - צבעים, סגנון, גודל ותקציב. כל פרט חשוב לנו.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl flex-shrink-0">3</div>
                <div>
                  <h3 className="font-assistant text-xl font-semibold mb-2">יצירה ומשלוח</h3>
                  <p className="text-gray-600">אנחנו יוצרים את העיצוב במיומנות ובקפידה, ומספקים אותו אליכם בזמן ובמצב מושלם.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <motion.section 
        ref={servicesRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-black text-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-assistant text-4xl font-bold text-center mb-12">למה לבחור בנו?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <h3 className="font-assistant text-2xl font-semibold mb-4">ניסיון עשיר</h3>
              <p className="text-gray-300">שנים של ניסיון בעיצוב אירועים ושזירת פרחים מקצועית</p>
            </div>

            <div className="bg-white/5 rounded-lg p-8 text-center">
              <h3 className="font-assistant text-2xl font-semibold mb-4">איכות מעולה</h3>
              <p className="text-gray-300">שימוש בפרחים הטריים ביותר ובחומרים האיכותיים ביותר</p>
            </div>

            <div className="bg-white/5 rounded-lg p-8 text-center">
              <h3 className="font-assistant text-2xl font-semibold mb-4">שירות אישי</h3>
              <p className="text-gray-300">ליווי צמוד ותשומת לב לכל פרט כדי להבטיח את שביעות רצונכם</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        ref={contactRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-stone-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-assistant text-4xl font-bold mb-4">יצירת קשר</h2>
            <p className="text-lg text-gray-700">נשמח לעזור לכם להפוך את החלום שלכם למציאות</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <Phone className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-assistant text-xl font-semibold mb-4">טלפון</h3>
              <a href="tel:0527614436" className="text-lg text-primary hover:underline block mb-2">
                052-761-4436
              </a>
              <a href="mailto:r0527614436@gmail.com" className="text-gray-600 hover:text-primary hover:underline block">
                r0527614436@gmail.com
              </a>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-assistant text-xl font-semibold mb-4">כתובת</h3>
              <p className="text-gray-700 mb-4">שערי תשובה 14, מודיעין עילית</p>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={openGoogleMaps}
                  variant="outline"
                  size="sm"
                >
                  <img 
                    src="/lovable-uploads/fd24647a-2b32-46d8-9868-413519b08b8a.png" 
                    alt="Google Maps" 
                    className="h-5 w-5"
                  />
                </Button>
                <Button
                  onClick={openWaze}
                  variant="outline"
                  size="sm"
                >
                  <img 
                    src={wazeIcon} 
                    alt="Waze" 
                    className="h-5 w-5"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט לוגו" 
              className="h-24 w-auto mx-auto mb-4 brightness-0 invert"
            />
            <h3 className="font-assistant text-xl font-semibold mb-2">בוקט - שזירת פרחים</h3>
            <p className="text-gray-400 mb-4">
              שזירת פרחים מקצועית לכל אירוע
            </p>
            <div className="flex justify-center gap-6 mb-4 text-sm">
              <a href="tel:0527614436" className="text-gray-400 hover:text-white transition-colors">
                052-761-4436
              </a>
              <a href="mailto:r0527614436@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                r0527614436@gmail.com
              </a>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 כל הזכויות שמורות ל{' '}
              <a 
                href="https://jobclic.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white underline"
              >
                AD אתרים
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
