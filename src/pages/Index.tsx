import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Menu, X } from 'lucide-react';
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
      {/* Header - Minimalist with Logo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
              <Link 
                to="/catalog" 
                className="px-4 py-2 text-gray-800 hover:text-pink-600 font-medium transition-colors"
              >
                קטלוג
              </Link>
              <a 
                href="#contact" 
                className="px-4 py-2 text-gray-800 hover:text-pink-600 font-medium transition-colors"
              >
                צור קשר
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="lg"
              className="md:hidden text-gray-800 hover:bg-gray-100 w-10 h-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/catalog" 
                  className="px-4 py-2 text-gray-800 hover:text-pink-600 font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  קטלוג
                </Link>
                <a 
                  href="#contact" 
                  className="px-4 py-2 text-gray-800 hover:text-pink-600 font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  צור קשר
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Black Background with Logo */}
      <motion.section 
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={isHeroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-black text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-wider">
            בוקט
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-300">
            שזירת פרחים מקצועית
          </p>
          
          {/* Quick Links */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              to="/catalog"
              className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium"
            >
              קטלוג
            </Link>
            <a 
              href="#about"
              className="border border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors font-medium"
            >
              אודות
            </a>
            <a 
              href="#contact"
              className="border border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors font-medium"
            >
              צור קשר
            </a>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about"
        ref={aboutRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isAboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              אודות בוקט
            </h2>
          </div>

          {/* Services List */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-black text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">השירותים שלנו</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3 text-xl">זרי כלה</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• זר כלה קלאסי</li>
                    <li>• זר כלה מודרני</li>
                    <li>• זר כלה מינימליסטי</li>
                    <li>• זר כלה רומנטי</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-xl">עיצוב אירועים</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• חופות מעוצבות</li>
                    <li>• כיסאות כלה</li>
                    <li>• עיצוב שולחנות</li>
                    <li>• קישוטי אולם</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-xl">מתנות</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• סידורי פרחים לאירועים</li>
                    <li>• מתנות עם שוקולדים</li>
                    <li>• קשתות גיבסניות</li>
                    <li>• זרי חישוק</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-xl">אירועים</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• זרי אירוסין</li>
                    <li>• עיצוב חתונות</li>
                    <li>• הפקת אירועים דתיים</li>
                    <li>• משלוחים לכל המרכז</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="text-center mb-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-4">
                משלוחים לכל אזור המרכז
              </h3>
              <p className="text-gray-700 leading-relaxed">
                אנו מספקים משלוחי פרחים איכותיים לכל אזור המרכז - ירושלים, מודיעין עילית, בני ברק, פתח תקווה, רעננה, כפר סבא, רמת גן ועוד. השירות שלנו כולל הובלה בטוחה ומקצועית כדי להבטיח שהפרחים יגיעו במצב מושלם.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Gallery Section with Carousel Images */}
      <motion.section 
        ref={servicesRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-black text-center mb-12">
            הגלריה שלנו
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.slice(0, 5).map((image, index) => (
              <div 
                key={image.id}
                className="aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Featured Image with Title */}
          <div className="mt-12 text-center">
            <div className="relative max-w-4xl mx-auto">
              <img
                src={images[currentImageIndex]?.image_url}
                alt={images[currentImageIndex]?.title}
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-3xl font-bold text-white">
                  {images[currentImageIndex]?.title}
                </h3>
              </div>
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
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">צור קשר</h2>
            <p className="text-lg text-gray-600">נשמח לעזור לכם בתכנון האירוע המושלם</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Phone className="h-10 w-10 mx-auto mb-4 text-pink-600" />
                <h3 className="text-xl font-semibold text-black mb-3">טלפון</h3>
                <a href="tel:0527614436" className="text-lg text-gray-700 hover:text-pink-600 block">
                  0527614436
                </a>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-4">
                  <Button 
                    onClick={openWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full p-0 shadow-lg"
                    size="icon"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
                    </svg>
                  </Button>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">וואטסאפ</h3>
                <p className="text-gray-600">שלחו הודעה</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <MapPin className="h-10 w-10 mx-auto mb-4 text-pink-600" />
                <h3 className="text-xl font-semibold text-black mb-3">כתובת</h3>
                <p className="text-gray-700 mb-3">שערי תשובה 14<br />מודיעין עילית</p>
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={openGoogleMaps}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:border-pink-600 hover:text-pink-600"
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
                    className="border-gray-300 hover:border-pink-600 hover:text-pink-600"
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

            {/* Email */}
            <div className="text-center">
              <a 
                href="mailto:r0527614436@gmail.com" 
                className="text-lg text-gray-700 hover:text-pink-600 inline-flex items-center gap-2"
              >
                <span>r0527614436@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer - Black with Logo */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט לוגו" 
              className="h-32 w-auto mx-auto mb-6 opacity-90"
            />
            <h3 className="text-2xl font-bold mb-3">בוקט - שזירת פרחים</h3>
            <p className="text-gray-400 mb-6">
              שזירת פרחים מקצועית | עיצוב אירועים | זרי כלה
            </p>
            <div className="flex justify-center gap-6 mb-6 flex-wrap">
              <a href="tel:0527614436" className="text-gray-400 hover:text-white transition-colors">
                0527614436
              </a>
              <span className="text-gray-600">|</span>
              <a href="mailto:r0527614436@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                r0527614436@gmail.com
              </a>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-500">
                © 2025 כל הזכויות שמורות ל{' '}
                <a 
                  href="https://jobclic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline"
                >
                  AD אתרים
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
