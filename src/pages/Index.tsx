import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, Heart, Gift, Crown, Sparkles, Camera, Phone, Mail, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GalleryCarousel } from '@/components/GalleryCarousel';
import Testimonials from '@/components/Testimonials';
import LoadingScreen from '@/components/LoadingScreen';
import wazeIcon from '@/assets/waze-icon.png';
import downloadCatalogBtn from '@/assets/download-catalog-btn.png';
import downloadArrow from '@/assets/download-arrow.png';
import heroImage from '@/assets/hero-image.jpg';
import arrowCircleGreen from '@/assets/arrow-circle-green.png';
import bouquetLogo3D from '@/assets/bouquet-logo-3d.png';
import { downloadCatalogPDF } from '@/utils/catalogPdf';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';
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
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroBackgrounds = [
    '/lovable-uploads/hero-bg-1.jpg',
    '/lovable-uploads/hero-bg-2.jpg',
    '/lovable-uploads/hero-bg-3.jpg'
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Track image loading
  useEffect(() => {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
      }
    });

    // Fallback timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      images.forEach((img) => {
        img.removeEventListener('load', checkAllLoaded);
        img.removeEventListener('error', checkAllLoaded);
      });
    };
  }, [slides]);

  // Hero image - single static image
  const heroImageData = {
    id: '1',
    image_url: heroImage,
    title: "בוקט",
    description: "מתמחים בשזירת פרחים לאירוסין ולחתונות של רגע",
    order_index: 1,
    is_active: true,
    font_family: 'font-sans'
  };

  // Gallery slides - empty array (no images)
  const gallerySlides: HomepageSlide[] = [];

  // Use database slides if available, otherwise use gallery slides
  const carouselImages = slides.length > 0 ? slides : gallerySlides;
  
  // Auto-slide for hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev === heroBackgrounds.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [heroBackgrounds.length]);

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
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    // Email validation
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
      // Send message via WhatsApp
      const message = `שם: ${contactForm.name}%0Aטלפון: ${contactForm.phone}%0Aמייל: ${contactForm.email}%0A%0Aהודעה:%0A${contactForm.message}`;
      window.open(`https://wa.me/972527614436?text=${encodeURIComponent(message)}`, '_blank');
      toast({
        title: "ההודעה נשלחה בהצלחה",
        description: "ניצור איתך קשר בהקדם"
      });

      // Reset form
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
  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8FBF4' }}>
      {/* Main Content */}
      <div>

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] overflow-visible">
        {/* Logo - Absolute Position in Hero - aligned with download button */}
        <div className="absolute left-4 top-8 z-40 bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg hidden md:block" style={{ marginLeft: '59px' }}>
          <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-32 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
        </div>
        {/* Mobile Logo */}
        <div className="absolute left-4 top-4 z-40 bg-white/80 backdrop-blur-sm rounded-t-[2rem] p-2 shadow-lg md:hidden">
          <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
        </div>
        
          <div className="relative w-full h-full">
          {/* Hero carousel images */}
          {heroBackgrounds.map((bg, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={bg} 
                alt={`רקע ${index + 1}`} 
                fetchPriority={index === 0 ? "high" : "low"} 
                loading={index === 0 ? "eager" : "lazy"} 
                decoding="async" 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
          
          {/* Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 flex flex-col items-center justify-center px-4 pt-16 sm:pt-20 md:pt-24">
            <img 
              src={bouquetLogo3D} 
              alt="בוקט" 
              width="1200" 
              height="400" 
              fetchPriority="high" 
              loading="eager" 
              decoding="async"
              className="h-auto w-[135vw] sm:w-[127vw] md:w-[120vw] lg:w-[112vw] xl:w-[105vw] max-w-[2400px] min-w-[450px]"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            />
          </div>
          
          {/* Subtitle at bottom center */}
          <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center px-4">
            <p className="font-ploni-aaa font-light text-2xl sm:text-3xl md:text-4xl text-[#314020]" style={{
              textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
            }}>יופי, אומנות ויוקרה נפגשים.</p>
          </div>
          </div>

        {/* Dots Indicator - removed as we only have single image */}

        {/* Download Catalog Button - Positioned at section boundary - Hidden on mobile */}
        <div className="absolute left-4 bottom-0 translate-y-1/2 z-[100] hidden md:block">
          {/* White circle background - behind the button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 w-20 sm:w-24 md:w-32 h-10 sm:h-12 md:h-16 rounded-b-full shadow-lg -z-10" style={{ backgroundColor: '#F8FBF4' }} />
          
          <button onClick={handleDownloadCatalog} className="relative z-10 group" aria-label="להורדת הקטלוג הדיגיטלי שלנו">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 hover:scale-110 transition-transform duration-300 mx-[30px] sm:mx-[45px] md:mx-[59px] py-0 px-0 my-0 rounded-full">
              {/* Rotating text circle */}
              <img src={downloadCatalogBtn} alt="" width="96" height="96" loading="lazy" decoding="async" className="w-full h-full drop-shadow-2xl animate-spin-slow mix-blend-multiply relative z-20" />
              {/* Static arrow in center */}
              <img src={downloadArrow} alt="להורדת הקטלוג הדיגיטלי שלנו" width="80" height="80" loading="lazy" decoding="async" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 z-30" />
            </div>
          </button>
        </div>

        {/* Navigation arrows - in the light transition area */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentHeroIndex((prev) => (prev === heroBackgrounds.length - 1 ? 0 : prev + 1))}
              className="hover:scale-110 transition-transform duration-300"
              aria-label="תמונה הבאה"
            >
              <img src={arrowCircleGreen} alt="" className="w-10 h-10 md:w-12 md:h-12" />
            </button>
            <button 
              onClick={() => setCurrentHeroIndex((prev) => (prev === 0 ? heroBackgrounds.length - 1 : prev - 1))}
              className="hover:scale-110 transition-transform duration-300 rotate-180"
              aria-label="תמונה קודמת"
            >
              <img src={arrowCircleGreen} alt="" className="w-10 h-10 md:w-12 md:h-12" />
            </button>
          </div>
          {/* Mobile Download Button - Below arrows */}
          <button onClick={handleDownloadCatalog} className="md:hidden relative z-10 group mt-2" aria-label="להורדת הקטלוג הדיגיטלי שלנו">
            <div className="relative w-14 h-14 hover:scale-110 transition-transform duration-300 rounded-full">
              <img src={downloadCatalogBtn} alt="" width="96" height="96" loading="lazy" decoding="async" className="w-full h-full drop-shadow-2xl animate-spin-slow mix-blend-multiply relative z-20" />
              <img src={downloadArrow} alt="להורדת הקטלוג הדיגיטלי שלנו" width="80" height="80" loading="lazy" decoding="async" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 z-30" />
            </div>
          </button>
        </div>
        
        {/* Curved bottom edge with transparent cutout */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-visible pointer-events-none" style={{ backgroundColor: '#F8FBF4' }}>
          <svg viewBox="0 0 1200 100" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <mask id="curve-mask">
                <rect width="1200" height="100" fill="white" />
                <ellipse cx="600" cy="0" rx="80" ry="100" fill="black" />
              </mask>
            </defs>
            <path d="M 0,0 L 0,100 L 1200,100 L 1200,0 Z" fill="#F8FBF4" mask="url(#curve-mask)" />
          </svg>
        </div>
      </section>

      {/* Gallery Carousel Section */}
      <section className="relative py-16 mt-0 bg-[#11150d]">
        <GalleryCarousel slides={carouselImages} />
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16 overflow-visible" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row-reverse lg:relative lg:pr-[340px] items-center lg:items-end justify-start gap-8 md:gap-10 lg:gap-0">
            {/* Images - Right Side (below text on mobile) */}
            <div className="flex md:hidden gap-3 items-center flex-shrink-0 w-full justify-center flex-wrap">
              {/* Mobile: All same size with rounded corners */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-1.png" alt="זרי כלה" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="w-28 h-28 rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-2.png" alt="עיצוב אירועים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="w-28 h-28 rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-3.png" alt="סידורי פרחים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Desktop: Original layout */}
            <div className="hidden md:flex gap-3 md:gap-6 items-end flex-shrink-0 lg:mt-[69px] lg:mb-[87px] w-full justify-center lg:w-auto">
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-br-[40px] md:rounded-br-[60px] rounded-bl-lg overflow-hidden">
                <img src="/lovable-uploads/about-image-3.png" alt="סידורי פרחים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-2.png" alt="עיצוב אירועים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="w-36 h-48 md:w-64 md:h-[450px] rounded-tl-[120px] md:rounded-tl-[180px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden flex-shrink-0">
                <img src="/lovable-uploads/about-image-1.png" alt="זרי כלה" width="256" height="450" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Text Content - Left Side */}
            <div className="w-full px-2 sm:px-4 lg:px-0 lg:absolute lg:top-6 lg:right-0 lg:z-10">
              {/* Title with layered effect */}
              <div className="relative mb-4 md:mb-6">
                <h2
                  style={{ transform: 'translate(10px, -8px)' }}
                  className="font-allura text-[50px] md:text-[95px] lg:text-[105px] font-light text-gray-400 opacity-60 leading-none select-none"
                >
                  About
                </h2>
                <h2 className="font-synopsis text-[40px] md:text-[80px] lg:text-[90px] font-semibold text-[#314020] absolute top-1/2 right-0 -translate-y-1/2 leading-none">
                  אודות
                </h2>
              </div>
              <div className="space-y-3 md:space-y-5 text-gray-700 text-sm md:text-xl leading-relaxed font-ploni-aaa lg:pr-0 lg:pl-[280px]">
                <p className="text-right font-regular leading-loose lg:-mt-8">
                  אנו בבוקט שמחים להיות שותפים לרגעים המרגשים שבהם תחינות ובקשות 
הופכות למציאות של ממש. 
ומאמינם שכל שמחה ראויה לפרחים מושלמים שישלימו את האווירה.
                </p>
                <p className="font-medium leading-loose text-right lg:pl-[420px] lg:mt-8">
                  זרי בוקט ישלימו לך את הלוק. דור 
חדש של זרי כלה בסגנון אירופאי וטאצ' מיוחד עם הטופ בפרחים טבעיים, באיכות גבוהה, עיצוב עדכני וגימור מושלם מזכרת שתשאר לנצח.
                </p>
              </div>

              {/* More About Button */}
              <div className="mt-6 md:mt-8 mb-4">
                <Link to="/about" onClick={() => window.scrollTo(0, 0)}>
                  <button className="flex items-center gap-3 md:gap-4 hover:scale-105 transition-transform">
                    <span className="font-synopsis text-lg md:text-2xl font-semibold text-[#314020]">עוד עלינו</span>
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                      <img src={arrowCircleGreen} alt="עוד עלינו" width="48" height="48" loading="lazy" decoding="async" className="w-full h-full rotate-180" />
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Icons Section */}
      <section className="py-12 md:py-16 pb-8 bg-[#11150d] relative z-20 overflow-visible">
        <div className="max-w-6xl mx-auto px-4 overflow-visible">
          {/* Mobile: 3 on top, 2 on bottom */}
          <div className="grid grid-cols-3 md:hidden gap-6 overflow-visible mb-6">
            {[{
              icon: '/lovable-uploads/icon-flower.png',
              text: 'פרחים טריים\nיום-יום'
            }, {
              icon: '/lovable-uploads/icon-bouquet.png',
              text: 'מגוון עיצובים\nמקוריים'
            }, {
              icon: '/lovable-uploads/icon-gift.png',
              text: 'עיצוב מתנות\nופרחים'
            }].map((service, idx) => <div key={idx} className="flex flex-col items-center text-center cursor-pointer">
                <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full border-2 border-[#314020]"></div>
                  <img src={service.icon} alt={service.text} width="40" height="40" loading="lazy" decoding="async" className="h-10 w-10 object-contain relative z-10" />
                </div>
                <p className="text-white font-ploni-aaa font-regular text-xs whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
          <div className="grid grid-cols-2 md:hidden gap-6 overflow-visible justify-items-center">
            {[{
              icon: '/lovable-uploads/icon-delivery.png',
              text: 'משלוחים\nבפריסה ארצית'
            }, {
              icon: '/lovable-uploads/icon-time.png',
              text: 'עמידה\nבזמנים'
            }].map((service, idx) => <div key={idx} className="flex flex-col items-center text-center cursor-pointer">
                <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full border-2 border-[#314020]"></div>
                  <img src={service.icon} alt={service.text} width="40" height="40" loading="lazy" decoding="async" className="h-10 w-10 object-contain relative z-10" />
                </div>
                <p className="text-white font-ploni-aaa font-regular text-xs whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
          {/* Desktop: 5 in a row */}
          <div className="hidden md:grid md:grid-cols-5 gap-8 md:gap-12 overflow-visible">
            {[{
              icon: '/lovable-uploads/icon-flower.png',
              text: 'פרחים טריים\nיום-יום'
            }, {
              icon: '/lovable-uploads/icon-bouquet.png',
              text: 'מגוון עיצובים\nמקוריים'
            }, {
              icon: '/lovable-uploads/icon-gift.png',
              text: 'עיצוב מתנות\nופרחים'
            }, {
              icon: '/lovable-uploads/icon-delivery.png',
              text: 'משלוחים\nבפריסה ארצית'
            }, {
              icon: '/lovable-uploads/icon-time.png',
              text: 'עמידה\nבזמנים'
}].map((service, idx) => <div key={idx} className="flex flex-col items-center text-center cursor-pointer">
                <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full border-2 border-[#314020]"></div>
                  <img src={service.icon} alt={service.text} width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 object-contain relative z-10" />
                </div>
                <p className="text-white font-ploni-aaa font-regular text-sm md:text-base whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Diagonal Scrolling Gallery */}
      <section className="overflow-hidden relative z-10" style={{ backgroundColor: '#F8FBF4', marginTop: '-120px', paddingTop: '80px', paddingBottom: '40px' }}>
        <div className="relative" style={{ transform: 'rotate(-3deg)', margin: '0 -60px' }}>
          <style>{`
            @keyframes infiniteScrollDiagonal {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .diagonal-scroll-container {
              animation: infiniteScrollDiagonal 40s linear infinite;
              direction: ltr;
            }
          `}</style>
          <div className="diagonal-scroll-container flex gap-4">
            {[...Array(2)].map((_, setIndex) => 
              [
                '/lovable-uploads/about-scroll-1.jpg',
                '/lovable-uploads/about-scroll-2.jpg',
                '/lovable-uploads/about-scroll-3.jpg',
                '/lovable-uploads/about-scroll-4.jpg',
                '/lovable-uploads/about-scroll-5.jpg',
                '/lovable-uploads/about-scroll-6.jpg',
                '/lovable-uploads/about-scroll-7.jpg',
                '/lovable-uploads/about-scroll-8.jpg',
                '/lovable-uploads/about-scroll-9.jpg',
                '/lovable-uploads/about-scroll-10.jpg',
                '/lovable-uploads/about-scroll-11.jpg',
                '/lovable-uploads/about-scroll-12.jpg',
                '/lovable-uploads/about-scroll-13.jpg',
                '/lovable-uploads/about-scroll-14.jpg'
              ].map((img, idx) => (
                <div key={`${setIndex}-${idx}`} className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg" style={{ width: '280px', height: '380px' }}>
                  <img 
                    src={img} 
                    alt={`עיצוב פרחים ${idx + 1}`} 
                    width="280" 
                    height="200" 
                    loading="lazy" 
                    decoding="async" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-center">
          <div className="max-w-4xl mx-auto px-4">
            {/* Title with layered effect */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
              <h2 className="font-allura text-[95px] md:text-[105px] font-light text-gray-400 opacity-60 leading-none select-none" style={{
                  transform: 'translate(15px, -10px)'
                }}>
                  Catalog
                </h2>
                <h2 className="font-synopsis text-[80px] md:text-[90px] font-semibold text-[#314020] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
                  קטלוג
                </h2>
              </div>
            </div>

            <p className="text-gray-700 text-xl leading-relaxed font-ploni-aaa font-light mb-8 mt-12">
              כל אירוע מיוחד מתחיל בפרטים הקטנים – והפרחים הם אלה שמעניקים לו את הקסם. מתוך אהבה לשזירה ובעזרת סייעתא דשמיא, הפכתי את התחביב לעסק שמלווה אירועים ברגעים הכי חשובים.
            </p>

            {/* Button with Arrow */}
            <div className="mt-8 mb-12">
              <Link to="/catalog" onClick={() => window.scrollTo(0, 0)}>
                <button className="flex items-center gap-4 hover:scale-105 transition-transform mx-auto">
                  <span className="font-synopsis text-2xl font-semibold text-[#314020]">לכל העיצובים</span>
                  <div className="w-12 h-12">
                    <img src={arrowCircleGreen} alt="לכל העיצובים" width="48" height="48" loading="lazy" decoding="async" className="w-full h-full rotate-180" />
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* Catalog Images Grid - Full Width - Vertical on mobile */}
          <div className="hidden md:grid grid-cols-4 gap-0 w-full mt-16 pr-16">
            {[{
              img: '/lovable-uploads/catalog-engagement.png',
              title: 'זרי\nאירוסין'
            }, {
              img: '/lovable-uploads/catalog-bouquet.png',
              title: 'כסאות וזרי\nכלה'
            }, {
              img: '/lovable-uploads/catalog-chairs.png',
              title: 'עיצוב\nאירועים'
            }, {
              img: '/lovable-uploads/catalog-hair.png',
              title: 'קישוטי\nשיער'
            }].map((item, idx) => <Link key={idx} to="/catalog" className={`group relative overflow-hidden aspect-[2/3] ${idx === 0 ? 'rounded-r-3xl' : ''}`}>
                <img src={item.img} alt={item.title} width="600" height="900" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6">
                  <h3 className="font-gloria font-bold text-3xl md:text-4xl text-white text-center whitespace-pre-line">{item.title}</h3>
                </div>
              </Link>)}
          </div>
          {/* Mobile: Vertical stacked layout */}
          <div className="md:hidden flex flex-col gap-4 w-full mt-8 px-4">
            {[{
              img: '/lovable-uploads/catalog-engagement.png',
              title: 'זרי אירוסין'
            }, {
              img: '/lovable-uploads/catalog-bouquet.png',
              title: 'כסאות וזרי כלה'
            }, {
              img: '/lovable-uploads/catalog-chairs.png',
              title: 'עיצוב אירועים'
            }, {
              img: '/lovable-uploads/catalog-hair.png',
              title: 'קישוטי שיער'
            }].map((item, idx) => <Link key={idx} to="/catalog" className="group relative overflow-hidden aspect-[16/9] rounded-2xl">
                <img src={item.img} alt={item.title} width="600" height="340" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-4">
                  <h3 className="font-gloria font-bold text-2xl text-white text-center">{item.title}</h3>
                </div>
              </Link>)}
          </div>
            }, {
              img: '/lovable-uploads/catalog-chairs.png',
              title: 'עיצוב\nאירועים'
            }, {
              img: '/lovable-uploads/catalog-hair.png',
              title: 'קישוטי\nשיער'
            }].map((item, idx) => <Link key={idx} to="/catalog" className={`group relative overflow-hidden aspect-[2/3] ${idx === 0 ? 'rounded-r-3xl' : ''}`}>
                <img src={item.img} alt={item.title} width="600" height="900" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6">
                  <h3 className="font-gloria font-bold text-3xl md:text-4xl text-white text-center whitespace-pre-line">{item.title}</h3>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Sticky Title */}
            <div className="lg:sticky lg:top-8 lg:self-start lg:h-fit z-20">
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative text-right">
                <h2 className="font-allura text-[75px] md:text-[85px] font-light text-gray-500 opacity-70 leading-none select-none transition-all duration-300" style={{
                    transform: 'translate(-25px, -10px)'
                  }}>
                    Work process
                  </h2>
                  <h2 className="font-synopsis text-[65px] md:text-[75px] font-semibold text-[#314020] absolute top-[55%] right-4 -translate-y-1/2 leading-none whitespace-nowrap">
                    איך זה<br />עובד אצלינו?
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-12 max-w-md lg:mr-auto">
              {/* Step 01 */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{ backgroundColor: '#000000' }}>
                  <span className="font-synopsis font-normal text-4xl">01</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  שיחת מיקוד להבנת הצרכים
                </h3>
                <p className="text-gray-700 text-lg leading-loose">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפגש הראשונה של אושר משותף לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{ backgroundColor: '#314020' }}>
                  <span className="font-synopsis font-normal text-4xl">02</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  בחירה והזמנה
                </h3>
                <p className="text-gray-700 text-lg leading-loose">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{ backgroundColor: '#11150D' }}>
                  <span className="font-synopsis font-normal text-4xl">03</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  הכנה ומשלוח
                </h3>
                <p className="text-gray-700 text-lg leading-loose">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפנש הראשונה של אושר משותף לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Flower Selection Section */}
      

      {/* Presentation Section */}
      

      {/* Why Choose Us Section */}
      

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Side - Title and Contact Info */}
            <div className="w-full md:w-1/2 text-right flex flex-col justify-start pt-12">
              {/* Title with layered effect */}
              <div className="relative mb-12">
              <h2 className="font-allura text-[95px] md:text-[105px] font-light text-[#314020]/40 opacity-60 leading-none select-none" style={{
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
                  <input id="name" type="text" value={contactForm.name} onChange={e => setContactForm({
                    ...contactForm,
                    name: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" required />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="phone" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    טלפון
                  </label>
                  <input id="phone" type="tel" value={contactForm.phone} onChange={e => setContactForm({
                    ...contactForm,
                    phone: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" required />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="email" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    אימייל
                  </label>
                  <input id="email" type="email" value={contactForm.email} onChange={e => setContactForm({
                    ...contactForm,
                    email: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" required />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="message" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    הודעה
                  </label>
                  <textarea id="message" value={contactForm.message} onChange={e => setContactForm({
                    ...contactForm,
                    message: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light min-h-[60px] resize-none text-[#314020]" required />
                </div>

                <button type="submit" className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white font-ploni-aaa font-medium text-lg py-3 rounded-full transition-all duration-300 disabled:opacity-50" disabled={isSubmitting}>
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

      {/* Footer */}
      <footer className="bg-[#11150d] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="text-white/90 font-ploni-aaa text-base">
              בוקט - שזירת פרחים מקצועית | <a href="tel:0527614436" className="hover:text-white transition-colors">0527614436</a> | <a href="mailto:r0527614436@gmail.com" className="hover:text-white transition-colors">r0527614436@gmail.com</a>
            </p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="text-white/60 text-sm hover:text-white transition-colors">
                מדיניות פרטיות
              </Link>
              <Link to="/accessibility" className="text-white/60 text-sm hover:text-white transition-colors">
                הצהרת נגישות
              </Link>
            </div>
            <p className="text-white/60 text-sm">
              © 2025 כל הזכויות שמורות ל <a href="https://jobclic.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AD אתרים</a>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
    </>
  );
};
export default Index;