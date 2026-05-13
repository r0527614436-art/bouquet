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
import CatalogNotReadyPopup from '@/components/CatalogNotReadyPopup';
import wazeIcon from '@/assets/waze-icon.png';
import downloadCatalogBtn from '@/assets/download-catalog-btn.webp';
import downloadArrow from '@/assets/download-arrow.png';
import heroImage from '@/assets/hero-image.webp';
import arrowCircleGreen from '@/assets/arrow-circle-new.png';
import bouquetLogo3D from '@/assets/bouquet-logo-3d.webp';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
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
  const heroBackgrounds = ['/lovable-uploads/hero-new-1.webp', '/lovable-uploads/hero-new-2.webp', '/lovable-uploads/hero-new-3.webp'];
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
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCatalogNotReadyPopup, setShowCatalogNotReadyPopup] = useState(false);
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

  // Loading timeout - show loading screen for a fixed short duration
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

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
      setCurrentHeroIndex(prev => prev === heroBackgrounds.length - 1 ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroBackgrounds.length]);
  const handleLogoClick = () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime > 500) {
      setLogoClickCount(1);
      // Single click - navigate home after short delay to check for double/triple click
      setTimeout(() => {
        if (logoClickCount <= 1) {
          // Already on home page, no need to navigate
        }
      }, 600);
    } else {
      setLogoClickCount(prev => prev + 1);
      if (logoClickCount >= 2) {
        navigate('/admin');
        setLogoClickCount(0);
      }
    }
    setLastClickTime(currentTime);
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
      // Use Storage API list to check file existence (reliable, not affected by CDN/cache)
      const {
        data: files,
        error: listError
      } = await supabase.storage.from('catalog-pdfs').list('', {
        search: 'catalog-download.pdf'
      });
      const fileExists = !listError && files && files.some(f => f.name === 'catalog-download.pdf');
      if (!fileExists) {
        console.log('Catalog PDF not found via storage.list');
        setShowCatalogNotReadyPopup(true);
        return;
      }

      // Get the PDF file URL from storage with cache-busting
      const {
        data
      } = supabase.storage.from('catalog-pdfs').getPublicUrl('catalog-download.pdf');
      if (!data?.publicUrl) {
        throw new Error('No catalog URL available');
      }

      // Add cache-busting to avoid NetFree/CDN caching issues
      const cacheBustedUrl = `${data.publicUrl}?v=${Date.now()}`;

      // Fetch the file as blob to force download
      const response = await fetch(cacheBustedUrl);

      // Check if blocked by NetFree (status 418) or other issues
      if (!response.ok || response.status === 418) {
        console.warn('Catalog fetch failed or blocked:', response.status, response.statusText);
        // File exists in storage but fetch failed - try direct link as fallback
        const link = document.createElement('a');
        link.href = cacheBustedUrl;
        link.download = 'קטלוג בוקט.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "הורדת קטלוג",
          description: "הקטלוג נפתח בחלון חדש"
        });
        return;
      }
      const blob = await response.blob();

      // Verify it's actually a PDF (not an error page)
      if (!blob.type.includes('pdf') && blob.size < 10000) {
        console.warn('Response is not a valid PDF, using direct link');
        const link = document.createElement('a');
        link.href = cacheBustedUrl;
        link.download = 'קטלוג בוקט.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "הורדת קטלוג",
          description: "הקטלוג נפתח בחלון חדש"
        });
        return;
      }
      const url = window.URL.createObjectURL(blob);

      // Download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = 'קטלוג בוקט.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "הורדת קטלוג",
        description: "הקטלוג הורד בהצלחה"
      });
    } catch (error) {
      console.error('Error downloading catalog:', error);
      setShowCatalogNotReadyPopup(true);
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

    if (!privacyAccepted) {
      toast({
        title: "שגיאה",
        description: "יש לאשר את מדיניות הפרטיות",
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
      // Send email via edge function
      const response = await supabase.functions.invoke('send-contact', {
        body: {
          name: contactForm.name,
          phone: contactForm.phone,
          email: contactForm.email,
          message: contactForm.message
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "שגיאה בשליחת ההודעה");
      }

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
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      
      <CatalogNotReadyPopup isOpen={showCatalogNotReadyPopup} onClose={() => setShowCatalogNotReadyPopup(false)} />
      
      <div className="min-h-screen" style={{
      backgroundColor: '#F8FBF4'
    }}>
      <Helmet>
        <title>בוקט — שזירת פרחים ועיצוב אירועים</title>
        <meta name="description" content="בוקט — שזירת פרחים מקצועית: זרי אירוסין, זרי כלה, עיצוב חופות וכסאות כלה והפקת אירועים במגזר החרדי באזור ירושלים, בני ברק והמרכז." />
        <link rel="canonical" href="https://bouquet-flowers.co.il/" />
        <meta property="og:title" content="בוקט — שזירת פרחים ועיצוב אירועים" />
        <meta property="og:description" content="זרי אירוסין, זרי כלה, עיצוב חופות וכסאות כלה והפקת אירועים במגזר החרדי." />
        <meta property="og:url" content="https://bouquet-flowers.co.il/" />
      </Helmet>
      <h1 className="sr-only">בוקט — שזירת פרחים ועיצוב אירועים</h1>
      {/* Main Content */}
      <div>

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] overflow-visible">
        {/* Logo - Absolute Position in Hero - aligned with download button */}
        <div className="absolute left-4 top-8 z-40 bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg hidden md:block" style={{
            marginLeft: '59px'
          }}>
          <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-32 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
        </div>
        {/* Mobile Logo */}
        <div className="absolute left-4 top-4 z-40 bg-white/80 backdrop-blur-sm rounded-t-[2rem] p-2 shadow-lg md:hidden">
          <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
        </div>
        
          <div className="relative w-full h-full overflow-hidden">
          {/* Hero carousel images */}
          {heroBackgrounds.map((bg, index) => <div key={index} className={`absolute inset-0 transition-opacity duration-700 ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`}>
              <img src={bg} alt={`רקע ${index + 1}`} fetchPriority={index === 0 ? "high" : "low"} loading={index === 0 ? "eager" : "lazy"} decoding="async" className="w-full h-full object-cover" />
            </div>)}
          
          {/* Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 flex flex-col items-center justify-center px-4 pt-16 sm:pt-20 md:pt-24">
            <img src={bouquetLogo3D} alt="בוקט" width="1200" height="400" fetchPriority="high" loading="eager" decoding="async" className="h-auto w-[135vw] sm:w-[127vw] md:w-[120vw] lg:w-[112vw] xl:w-[105vw] max-w-[2400px] min-w-[450px]" style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }} />
          </div>
          
          {/* Subtitle at bottom center - moved higher on mobile */}
          <div className="absolute bottom-32 md:bottom-24 left-0 right-0 flex flex-col items-center px-4">
            <p className="font-ploni-aaa font-light text-2xl sm:text-3xl md:text-4xl text-[#314020]" style={{
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
              }}>יופי, אומנות ויוקרה נפגשים.</p>
          </div>
          </div>

        {/* Dots Indicator - removed as we only have single image */}

        {/* Download Catalog Button - Positioned at section boundary - Hidden on mobile */}
        <div className="absolute left-4 md:left-8 bottom-0 translate-y-1/2 z-[100] hidden md:block">
          {/* Full circle background - behind the button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full -z-10" style={{
              backgroundColor: '#F8FBF4'
            }} />
          
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[80] flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentHeroIndex(prev => prev === heroBackgrounds.length - 1 ? 0 : prev + 1)} className="hover:scale-110 transition-transform duration-300" aria-label="תמונה הבאה">
              <img src={arrowCircleGreen} alt="" className="w-10 h-10 md:w-12 md:h-12" />
            </button>
            <button onClick={() => setCurrentHeroIndex(prev => prev === 0 ? heroBackgrounds.length - 1 : prev - 1)} className="hover:scale-110 transition-transform duration-300 rotate-180" aria-label="תמונה קודמת">
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
        
        {/* Cloud blending effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56 pointer-events-none z-30">
          {/* Main cloud shapes using radial gradients */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-full"
            style={{
              background: `
                radial-gradient(ellipse 80% 100% at 20% 100%, #F8FBF4 0%, transparent 70%),
                radial-gradient(ellipse 60% 90% at 50% 100%, #F8FBF4 0%, transparent 65%),
                radial-gradient(ellipse 70% 95% at 80% 100%, #F8FBF4 0%, transparent 70%)
              `
            }}
          />
          {/* Additional layered clouds for depth */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-3/4"
            style={{
              background: `
                radial-gradient(ellipse 50% 80% at 10% 100%, #F8FBF4 0%, transparent 60%),
                radial-gradient(ellipse 45% 70% at 35% 100%, #F8FBF4 0%, transparent 55%),
                radial-gradient(ellipse 55% 85% at 65% 100%, #F8FBF4 0%, transparent 60%),
                radial-gradient(ellipse 50% 75% at 90% 100%, #F8FBF4 0%, transparent 55%)
              `
            }}
          />
          {/* Soft gradient base */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              background: 'linear-gradient(to top, #F8FBF4 0%, #F8FBF4 30%, transparent 100%)'
            }}
          />
          {/* Blur layer for softness */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-24 md:h-32"
            style={{
              background: 'linear-gradient(to top, #F8FBF4 0%, transparent 100%)',
              filter: 'blur(20px)'
            }}
          />
        </div>
      </section>

      {/* Gallery Carousel Section */}
      <section className="relative py-16 mt-0 bg-[#11150d]">
        {/* Light circle cutout for download button - positioned behind the button */}
        <div className="absolute hidden md:block z-[90] bg-background" style={{
            left: '78px',
            top: '-26px',
            width: '73px',
            height: '73px',
            borderRadius: '50%'
          }} />
        <GalleryCarousel slides={carouselImages} />
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16 overflow-hidden" style={{
          backgroundColor: '#F8FBF4'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row-reverse lg:relative lg:pr-[340px] items-center lg:items-end justify-start gap-8 md:gap-10 lg:gap-0">
            {/* Images - Right Side (below text on mobile) */}
            <div className="flex md:hidden gap-2 items-stretch flex-shrink-0 w-full justify-center">
              {/* Mobile: With special rounded corners and object positioning */}
              <div className="flex-1 max-w-[110px] aspect-square rounded-br-[30px] rounded-tl-lg rounded-bl-lg rounded-tr-lg overflow-hidden">
                <img src="/lovable-uploads/about-image-3.webp" alt="סידורי פרחים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover object-bottom" />
              </div>
              <div className="flex-1 max-w-[110px] aspect-square rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-2.webp" alt="עיצוב אירועים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 max-w-[110px] aspect-square rounded-tl-[30px] rounded-tr-lg rounded-bl-lg rounded-br-lg overflow-hidden">
                <img src="/lovable-uploads/about-image-1.webp" alt="זרי כלה" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
              </div>
            </div>
            {/* Desktop: Original layout */}
            <div className="hidden md:flex gap-3 md:gap-6 items-end flex-shrink-0 lg:mt-[69px] lg:mb-[87px] w-full justify-center lg:w-auto">
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-br-[40px] md:rounded-br-[60px] rounded-bl-lg overflow-hidden">
                <img src="/lovable-uploads/about-image-3.webp" alt="סידורי פרחים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-2.webp" alt="עיצוב אירועים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="w-36 h-48 md:w-64 md:h-[450px] rounded-tl-[120px] md:rounded-tl-[180px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden flex-shrink-0">
                <img src="/lovable-uploads/about-image-1.webp" alt="זרי כלה" width="256" height="450" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Text Content - Left Side */}
            <div className="w-full px-2 sm:px-4 lg:px-0 lg:absolute lg:top-6 lg:right-0 lg:z-10">
              {/* Title with layered effect */}
              <div className="relative mb-4 md:mb-6">
                <h2 style={{
                    transform: 'translate(10px, -8px)'
                  }} className="font-allura text-[50px] md:text-[95px] lg:text-[105px] font-light text-gray-400 opacity-60 leading-none select-none">
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
      <section className="overflow-hidden relative z-10" style={{
          backgroundColor: '#F8FBF4',
          marginTop: '-120px',
          paddingTop: '80px',
          paddingBottom: '40px'
        }}>
        <div className="relative" style={{
            transform: 'rotate(-3deg)',
            margin: '0 -60px'
          }}>
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
          <div className="diagonal-scroll-container flex gap-2 md:gap-4">
            {[...Array(2)].map((_, setIndex) => ['/lovable-uploads/about-scroll-1.webp', '/lovable-uploads/about-scroll-2.webp', '/lovable-uploads/about-scroll-3.webp', '/lovable-uploads/about-scroll-4.webp', '/lovable-uploads/about-scroll-5.webp', '/lovable-uploads/about-scroll-6.webp', '/lovable-uploads/about-scroll-7.webp', '/lovable-uploads/about-scroll-8.webp', '/lovable-uploads/about-scroll-9.webp', '/lovable-uploads/about-scroll-10.webp', '/lovable-uploads/about-scroll-11.webp', '/lovable-uploads/about-scroll-12.webp', '/lovable-uploads/about-scroll-13.webp', '/lovable-uploads/about-scroll-14.webp'].map((img, idx) => <div key={`${setIndex}-${idx}`} className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg w-[100px] h-[140px] md:w-[280px] md:h-[380px]">
                  <img src={img} alt={`עיצוב פרחים ${idx + 1}`} width="280" height="200" loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-20" style={{
          backgroundColor: '#F8FBF4'
        }}>
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

            <p className="text-gray-700 text-sm md:text-xl leading-relaxed font-ploni-aaa font-regular mb-8 mt-12">כל אירוע מיוחד מתחיל בפרטים הקטנים – והפרחים הם אלה שמעניקים לו את הקסם. מתוך אהבה לשזירה ובס"ד, הפכתי את התחביב לעסק שמלווה אירועים ברגעים הכי חשובים.</p>

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
                img: '/lovable-uploads/catalog-bouquet.webp',
                title: 'כסאות וזרי\nכלה',
                category: 'זרי כלה'
              }, {
                img: '/lovable-uploads/catalog-engagement.webp',
                title: 'זרי\nאירוסין',
                category: 'זרי אירוסין'
              }, {
                img: '/lovable-uploads/catalog-hair.webp',
                title: 'קישוטי\nשיער',
                category: 'קישוטי שיער'
              }, {
                img: '/lovable-uploads/catalog-chairs.webp',
                title: 'עיצוב\nאירועים',
                category: 'מתנות מעוצבות'
              }].map((item, idx) => <Link key={idx} to={`/catalog?category=${encodeURIComponent(item.category)}`} onClick={() => window.scrollTo(0, 0)} className={`relative overflow-hidden aspect-[2/3] cursor-pointer hover:scale-[1.02] transition-transform ${idx === 0 ? 'rounded-r-3xl' : ''}`}>
                <img src={item.img} alt={item.title} width="600" height="900" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6">
                  <h3 className="font-synopsis font-bold text-3xl md:text-4xl text-white text-center whitespace-pre-line">{item.title}</h3>
                </div>
              </Link>)}
          </div>
          {/* Mobile: Vertical stacked layout with rounded corners */}
          <div className="md:hidden flex flex-col gap-0 w-full mt-8 px-4">
            {[{
                img: '/lovable-uploads/catalog-bouquet.webp',
                title: 'כסאות וזרי כלה',
                category: 'זרי כלה'
              }, {
                img: '/lovable-uploads/catalog-engagement.webp',
                title: 'זרי אירוסין',
                category: 'זרי אירוסין'
              }, {
                img: '/lovable-uploads/catalog-hair.webp',
                title: 'קישוטי שיער',
                category: 'קישוטי שיער'
              }, {
                img: '/lovable-uploads/catalog-chairs.webp',
                title: 'עיצוב אירועים',
                category: 'מתנות מעוצבות'
              }].map((item, idx) => <Link key={idx} to={`/catalog?category=${encodeURIComponent(item.category)}`} onClick={() => window.scrollTo(0, 0)} className={`relative overflow-hidden aspect-[16/9] cursor-pointer active:scale-[0.98] transition-transform ${idx === 0 ? 'rounded-t-2xl' : ''} ${idx === 3 ? 'rounded-b-2xl' : ''}`}>
                <img src={item.img} alt={item.title} width="600" height="340" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-6">
                  <h3 className="font-synopsis font-bold text-3xl text-white text-center">{item.title}</h3>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative" style={{
          backgroundColor: '#F8FBF4'
        }}>
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
            {/* Left Side - Sticky Title */}
            <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit z-20 mb-6 sm:mb-8 lg:mb-0">
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative text-center md:text-right">
                <h2 className="font-allura text-[32px] sm:text-[45px] md:text-[85px] font-light text-gray-500 opacity-70 leading-none select-none transition-all duration-300" style={{
                      transform: 'translate(-25px, -10px)'
                    }}>
                    Work process
                  </h2>
                  <h2 className="font-synopsis text-[28px] sm:text-[40px] md:text-[75px] font-semibold text-[#314020] absolute top-[55%] left-1/2 md:left-auto md:right-4 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 leading-none whitespace-nowrap">
                    איך זה<br />עובד אצלינו?
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Content - Centered on mobile */}
            <div className="space-y-8 sm:space-y-12 max-w-[280px] sm:max-w-md lg:max-w-xl xl:max-w-2xl lg:mr-auto mx-auto md:mx-0 mt-8 sm:mt-4 lg:mt-0">
              {/* Step 01 */}
              <div className="space-y-4 text-center md:text-right">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{
                    backgroundColor: '#000000'
                  }}>
                  <span className="font-synopsis font-normal text-4xl">01</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  שיחת מיקוד
                </h3>
                <p className="text-gray-700 text-lg leading-loose">אנו יוצרות שיחת מיקוד קצרה ומדויקת, שבה אנו מגדירות יחד את סגנון הזר/העיצוב התקציב, הגוונים המועדפים והאווירה שאת רוצה לייצר. המטרה היא להבין את כל הפרטים הדרושים כדי לדייק את הבחירה ולהתאימה בצורה מושלמת.</p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4 text-center md:text-right">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{
                    backgroundColor: '#314020'
                  }}>
                  <span className="font-synopsis font-normal text-4xl">02</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  בחירה והשלמת ההזמנה
                </h3>
                <p className="text-gray-700 text-lg leading-loose">לאחר שדייקנו את המטרה על מנת שתוכלי לקבל את ההשראה הנגשנו לך את קטלוג מרהיב מסודר לבחירה נוחה וברורה. את בוחרת את העיצוב הרצוי כמובן שניתן לשנות גוונים ולשלב בין סוגי הזרים וביחד אנו מבצעות התאמות של צבעים, שילובים ופרטים עיצוביים כך שיתאימו לקונספט הכולל.</p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4 text-center md:text-right">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{
                    backgroundColor: '#11150D'
                  }}>
                  <span className="font-synopsis font-normal text-4xl">03</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  הזמנה
                </h3>
                <p className="text-gray-700 text-lg leading-loose">
                  לאחר בחירת הזר הנחשק יש למלא את פרטי ההזמנה באתר או במייל ע"י שליחת המילה הזמנה בשורת הנושא ומלוי טופס ההזמנה הנשלח אליכם אוטומטית.
                </p>
              </div>

              {/* Step 04 */}
              <div className="space-y-4 text-center md:text-right">
                <div className="inline-flex items-center justify-center text-white px-10 py-0.5 rounded-full" style={{
                    backgroundColor: '#000000'
                  }}>
                  <span className="font-synopsis font-normal text-4xl">04</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  הכנה ומשלוח
                </h3>
                <p className="text-gray-700 text-lg leading-loose">ביום האירוע אנו שוזרים את הזר בהשקעה מרבית ובשימת לב מיוחדת לפרחים טריים, איכותיים ומעוררי השראה בקו נקי עדכני מרשים ומפתיע ובדגש על שירות מקצועי אדיב ואמין. הפרחים המעוצבים נשלחים בפריסה ארצית ומגיעים אליכם במראה טבעי ורענן המשלים את חווית השמחה.</p>
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
      <section id="contact" className="py-20" style={{
          backgroundColor: '#F8FBF4'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Title on top, form, then contact info */}
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Side - Title and Contact Info (desktop) */}
            <div className="w-full md:w-1/2 text-center md:text-right flex flex-col justify-start pt-12">
              {/* Title with layered effect */}
              <div className="relative mb-12 h-[80px] md:h-auto flex items-center justify-center md:block">
              <h2 className="font-allura text-[50px] md:text-[105px] font-light text-[#314020]/40 opacity-60 leading-none select-none" style={{
                    transform: 'translate(15px, -10px)'
                  }}>
                  Contact us
                </h2>
                <h2 className="font-synopsis text-[40px] md:text-[90px] font-semibold text-[#314020] absolute top-1/2 left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 leading-none text-center md:text-right">
                  צור קשר
                </h2>
              </div>

              {/* Contact Information - Hidden on mobile, shown after form */}
              <div className="hidden md:block space-y-6 mt-10">
                <div className="flex items-center justify-start gap-3 text-lg">
                  <MapPin className="h-6 w-6 text-[#314020]" />
                  <button onClick={openGoogleMaps} className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-left text-[#314020]">
                    שערי תשובה 14 - מודיעין עילית
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

                <div className="flex items-start gap-3 mt-4">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      id="privacy-checkbox-index"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="privacy-checkbox-index"
                      className="flex h-4 w-4 cursor-pointer items-center justify-center rounded border-2 border-[#314020] bg-transparent transition-all duration-200 peer-checked:border-[#314020]"
                    >
                      <svg
                        className="h-10 w-10 text-[#314020] transition-transform duration-200 mt-0.5 ml-0.5"
                        style={{ transform: privacyAccepted ? 'scale(1)' : 'scale(0)' }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </label>
                  </div>
                  <label htmlFor="privacy-checkbox-index" className="text-sm text-gray-600 font-ploni-aaa cursor-pointer text-right">
                    קראתי ואני מסכימ/ה ל<Link to="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</Link>
                  </label>
                </div>
                <button type="submit" className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white font-ploni-aaa font-medium text-lg py-3 rounded-full transition-all duration-300 disabled:opacity-50" disabled={isSubmitting || !privacyAccepted}>
                  {isSubmitting ? 'שולח...' : 'שליחה'}
                </button>
              </form>
              
              {/* Mobile: Contact info under form */}
              <div className="md:hidden space-y-4 mt-8 px-8">
                <div className="flex items-center justify-center gap-3 text-lg">
                  <MapPin className="h-5 w-5 text-[#314020]" />
                  <button onClick={openGoogleMaps} className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    שערי תשובה 14 - מודיעין עילית
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-3 text-lg">
                  <Mail className="h-5 w-5 text-[#314020]" />
                  <a href="mailto:R0527614436@GMAIL.COM" className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    R0527614436@GMAIL.COM
                  </a>
                </div>
                
                <div className="flex items-center justify-center gap-3 text-lg">
                  <Phone className="h-5 w-5 text-[#314020]" />
                  <a href="tel:0527614436" className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    0527614436
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#11150d] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="text-white/90 font-ploni-aaa text-base">
              בוקט | <a href="tel:0527614436" className="hover:text-white transition-colors">0527614436</a> | <a href="mailto:r0527614436@gmail.com" className="hover:text-white transition-colors">r0527614436@gmail.com</a>
            </p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="text-white/60 text-sm hover:text-white transition-colors">
                מדיניות פרטיות
              </Link>
              <Link to="/accessibility" className="text-white/60 text-sm hover:text-white transition-colors">
                הצהרת נגישות
              </Link>
              <button onClick={() => {
                  const modal = document.createElement('div');
                  modal.innerHTML = `
                    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="this.remove()">
                      <div style="background:#F8FBF4;padding:32px;border-radius:16px;max-width:400px;text-align:center;direction:rtl;" onclick="event.stopPropagation()">
                        <h3 style="font-size:24px;font-weight:bold;color:#314020;margin-bottom:16px;">ביטול עסקה</h3>
                        <p style="color:#314020;margin-bottom:24px;">לביטול עסקה ניתן לפנות אלינו:</p>
                        <div style="display:flex;flex-direction:column;gap:12px;">
                          <a href="tel:0527614436" style="background:#314020;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;">📞 טלפון: 052-7614436</a>
                          <a href="https://wa.me/972527614436" target="_blank" style="background:#25D366;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;">💬 וואצאפ</a>
                        </div>
                        <button onclick="this.closest('[style*=position]').remove()" style="margin-top:16px;color:#314020;background:transparent;border:none;cursor:pointer;">סגור</button>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(modal.firstElementChild!);
                }} className="text-white/60 text-sm hover:text-white transition-colors">
                ביטול עסקה
              </button>
            </div>
            <p className="text-white/60 text-sm">
              <span className="font-bold">בניה</span> <a href="https://jobclic.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AD אתרים</a>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
    </>;
};
export default Index;