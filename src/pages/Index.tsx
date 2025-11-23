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
import wazeIcon from '@/assets/waze-icon.png';
import downloadCatalogBtn from '@/assets/download-catalog-btn.png';
import downloadArrow from '@/assets/download-arrow.png';
import heroImage from '@/assets/hero-image.jpg';
import arrowCircle from '@/assets/arrow-circle.png';
import bouquetLogo3D from '@/assets/bouquet-logo-3d.png';
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
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Gallery slides - all images including new ones
  const gallerySlides = [{
    id: '1',
    image_url: '/lovable-uploads/bouquet-1.jpg',
    title: "זר כלה אלגנטי",
    description: "שילוב של ורדים ופרחים לבנים וורודים",
    order_index: 1,
    is_active: true,
    font_family: 'font-sans'
  }, {
    id: '2',
    image_url: '/lovable-uploads/bouquet-2.jpg',
    title: "זר כלה לבן",
    description: "עיצוב טהור ואלגנטי",
    order_index: 2,
    is_active: true,
    font_family: 'font-sans'
  }, {
    id: '3',
    image_url: '/lovable-uploads/bouquet-3.jpg',
    title: "בוקט שמנת",
    description: "גוונים חמים של שמנת וצהוב",
    order_index: 3,
    is_active: true,
    font_family: 'font-sans'
  }, {
    id: '4',
    image_url: '/lovable-uploads/bouquet-4.jpg',
    title: "זר רומנטי",
    description: "שילוב עדין של פרחים בגוונים פסטליים",
    order_index: 4,
    is_active: true,
    font_family: 'font-sans'
  }, {
    id: '5',
    image_url: '/lovable-uploads/bouquet-5.jpg',
    title: "בוקט ורוד",
    description: "עיצוב רומנטי בגוונים של ורוד",
    order_index: 5,
    is_active: true,
    font_family: 'font-sans'
  }, {
    id: '6',
    image_url: '/lovable-uploads/bouquet-6.jpg',
    title: "זר כלה מרהיב",
    description: "שילוב מושלם של צבעים ופרחים",
    order_index: 6,
    is_active: true,
    font_family: 'font-sans'
  }];

  // Use database slides if available, otherwise use gallery slides
  const carouselImages = slides.length > 0 ? slides : gallerySlides;
  // No auto-slide for hero section - only static image
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
  return <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8FBF4' }}>
      {/* Main Content */}
      <div>

      {/* Hero Section */}
      <section className="relative h-[55vh] overflow-visible">
        {/* Logo - Absolute Position in Hero */}
        <div className="absolute left-4 top-8 z-40 bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg">
          <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-32 w-auto cursor-pointer hover:opacity-80 transition-opacity contrast-125 brightness-110" onClick={handleLogoClick} />
        </div>
        
          <div className="relative w-full h-full">
          {/* Single hero image - no carousel */}
          <div className="absolute inset-0">
            <img src={heroImageData.image_url} alt={heroImageData.title} fetchPriority="high" loading="eager" decoding="async" className="w-full h-full object-cover scale-110" />
          </div>
          
          {/* Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 flex flex-col items-center justify-center px-4">
            <img 
              src={bouquetLogo3D} 
              alt="בוקט" 
              width="850" 
              height="283" 
              fetchPriority="high" 
              loading="eager" 
              decoding="async"
              className="w-[500px] sm:w-[650px] md:w-[850px] h-auto"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            />
          </div>
          
          {/* Subtitle at bottom center */}
          <div className="absolute bottom-24 left-0 right-0 flex justify-center px-4">
            <p className="font-ploni-aaa font-light text-2xl sm:text-3xl md:text-4xl text-[#314020]" style={{
              textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
            }}>יופי, אומנות ויוקרה נפגשים.</p>
          </div>
          </div>

        {/* Dots Indicator - removed as we only have single image */}

        {/* Download Catalog Button - Positioned at section boundary */}
        <div className="absolute left-4 bottom-0 translate-y-1/2 z-[100]">
          {/* White circle background - behind the button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 w-32 h-16 rounded-b-full shadow-lg -z-10" style={{ backgroundColor: '#F8FBF4' }} />
          
          <button onClick={handleDownloadCatalog} className="relative z-10 group" aria-label="להורדת הקטלוג הדיגיטלי שלנו">
            <div className="relative w-24 h-24 hover:scale-110 transition-transform duration-300 mx-[59px] py-0 px-0 my-0 rounded-full">
              {/* Rotating text circle */}
              <img src={downloadCatalogBtn} alt="" width="96" height="96" loading="lazy" decoding="async" className="w-full h-full drop-shadow-2xl animate-spin-slow mix-blend-multiply relative z-20" />
              {/* Static arrow in center */}
              <img src={downloadArrow} alt="להורדת הקטלוג הדיגיטלי שלנו" width="80" height="80" loading="lazy" decoding="async" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-30" />
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
      <section id="about" className="py-8 md:py-12 overflow-visible" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse lg:relative lg:pr-[340px] items-center lg:items-end justify-start gap-6 md:gap-8 lg:gap-0">
            {/* Images - Right Side */}
            <div className="flex gap-3 md:gap-6 items-end flex-shrink-0 lg:mt-[69px] lg:mb-[87px] w-full justify-center lg:w-auto">
              {/* Second smaller image - now leftmost */}
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-br-[40px] md:rounded-br-[60px] rounded-bl-lg overflow-hidden">
                <img src="/lovable-uploads/about-image-3.png" alt="סידורי פרחים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              {/* Single smaller image */}
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-2xl overflow-hidden">
                <img src="/lovable-uploads/about-image-2.png" alt="עיצוב אירועים" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              {/* Large image with top-left rounded */}
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
                  className="font-allura text-[50px] md:text-[95px] lg:text-[105px] font-semibold text-gray-300 opacity-50 leading-none select-none"
                >
                  About
                </h2>
                <h2 className="font-synopsis text-[40px] md:text-[80px] lg:text-[90px] font-semibold text-[#314020] absolute top-1/2 right-0 -translate-y-1/2 leading-none">
                  אודות
                </h2>
              </div>
              <div className="space-y-3 md:space-y-5 text-gray-700 text-sm md:text-xl leading-relaxed font-ploni-aaa font-light lg:pr-0 lg:pl-[280px]">
                <p className="text-right font-normal leading-loose lg:-mt-8">
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
                <Link to="/about">
                  <button className="flex items-center gap-3 md:gap-4 hover:scale-105 transition-transform">
                    <span className="font-synopsis text-lg md:text-2xl font-semibold text-[#314020]">עוד עלינו</span>
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                      <img src={arrowCircle} alt="עוד עלינו" width="48" height="48" loading="lazy" decoding="async" className="w-full h-full" />
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Icons Section */}
      <section className="py-16 bg-[#11150d]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
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
              }].map((service, idx) => <div key={idx} className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  {/* Inner green circle border - thin outer spacing */}
                  <div className="absolute inset-1 rounded-full border-2 border-[#314020]"></div>
                  <img src={service.icon} alt={service.text} width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 object-contain relative z-10" />
                </div>
                <p className="text-white font-ploni-aaa font-black text-sm md:text-base whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Gallery Full Width Image */}
      <section className="w-full">
        <img src="/lovable-uploads/gallery-full.png" alt="גלריה" width="1920" height="600" loading="lazy" decoding="async" className="w-full h-auto object-cover" />
      </section>

      {/* Catalog Section */}
      <section className="py-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-center">
          <div className="max-w-4xl mx-auto px-4">
            {/* Title with layered effect */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
                <h2 className="font-allura text-[95px] md:text-[105px] font-semibold text-gray-300 opacity-50 leading-none select-none" style={{
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
              <Link to="/catalog">
                <button className="flex items-center gap-4 hover:scale-105 transition-transform mx-auto">
                  <span className="font-synopsis text-2xl font-semibold text-[#314020]">לכל העיצובים</span>
                  <div className="w-12 h-12">
                    <img src={arrowCircle} alt="לכל העיצובים" width="48" height="48" loading="lazy" decoding="async" className="w-full h-full" />
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* Catalog Images Grid - Full Width */}
          <div className="grid grid-cols-4 gap-0 w-full mt-16 pr-16">
            {[{
              img: '/lovable-uploads/catalog-engagement.png',
              title: 'עיצוב אירועים'
            }, {
              img: '/lovable-uploads/catalog-bouquet.png',
              title: 'זרי אירוסין'
            }, {
              img: '/lovable-uploads/catalog-chairs.png',
              title: 'כסאות וזרי כלה'
            }, {
              img: '/lovable-uploads/catalog-hair.png',
              title: 'קישוטי שיער'
            }].map((item, idx) => <Link key={idx} to="/catalog" className={`group relative overflow-hidden aspect-[2/3] ${idx === 0 ? 'rounded-r-3xl' : ''}`}>
                <img src={item.img} alt={item.title} width="600" height="900" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6">
                  <h3 className="font-ploni-aaa font-semibold text-xl md:text-2xl text-white">{item.title}</h3>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 lg:gap-12">
            {/* Left Side - Sticky Title */}
            <div className="lg:sticky lg:top-2 lg:self-start lg:h-fit lg:pl-8">
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative text-right">
                  <h2 className="font-allura text-[75px] md:text-[85px] font-semibold text-gray-400 opacity-60 leading-tight select-none" style={{
                    transform: 'translate(15px, -10px)'
                  }}>
                    Work<br />process
                  </h2>
                  <h2 className="font-synopsis text-[65px] md:text-[75px] font-semibold text-[#314020] absolute top-[55%] right-4 -translate-y-1/2 leading-tight whitespace-nowrap">
                    איך זה<br />עובד אצלינו?
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-12">
              {/* Step 01 */}
              <div className="space-y-4">
                <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full">
                  <span className="font-ploni-aaa font-black text-2xl">01</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  שיחת מיקוד להבנת הצרכים
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפגש הראשונה של אושר משותף לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4">
                <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full">
                  <span className="font-ploni-aaa font-black text-2xl">02</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  בחירה והזמנה
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4">
                <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full">
                  <span className="font-ploni-aaa font-black text-2xl">03</span>
                </div>
                <h3 className="font-ploni-aaa font-black text-3xl text-gray-800">
                  הכנה ומשלוח
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
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
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#11150d] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <h3 className="text-white text-xl font-ploni-aaa font-bold">בוקט - שזירת פרחים</h3>
            <p className="text-white/80 font-ploni-aaa">שזירת פרחים מקצועית</p>
            <div className="space-y-2">
              <p className="text-white/80 font-ploni-aaa">
                <a href="tel:0527614436" className="hover:text-white transition-colors">0527614436</a>
              </p>
              <p className="text-white/80 font-ploni-aaa">
                <a href="mailto:r0527614436@gmail.com" className="hover:text-white transition-colors">r0527614436@gmail.com</a>
              </p>
            </div>
            <p className="text-white/60 text-sm pt-4">
              © 2025 כל הזכויות שמורות ל <a href="https://jobclic.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AD אתרים</a>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>;
};
export default Index;