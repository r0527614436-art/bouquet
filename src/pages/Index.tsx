import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, Heart, Gift, Crown, Sparkles, Camera, Phone, Mail, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GalleryCarousel } from '@/components/GalleryCarousel';
import Testimonials from '@/components/Testimonials';
import wazeIcon from '@/assets/waze-icon.png';
import downloadCatalogBtn from '@/assets/download-catalog-btn.png';
import downloadArrow from '@/assets/download-arrow.png';
import heroImage from '@/assets/hero-image.jpg';
import arrowCircle from '@/assets/arrow-circle.png';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  return <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Side Navigation Bar - Full Height */}
      <div className={`fixed right-0 top-0 h-screen bg-primary transition-all duration-300 ease-in-out z-50 ${isMenuOpen ? 'w-80' : 'w-20'}`} onMouseEnter={() => setIsMenuOpen(true)} onMouseLeave={() => setIsMenuOpen(false)}>
        <div className="flex flex-col h-full py-8 bg-[#11150d]">
          {/* Hamburger Icon */}
          <div className={`flex justify-center mb-12 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col gap-1.5 cursor-pointer">
              <div className="w-8 h-0.5 bg-white"></div>
              <div className="w-8 h-0.5 bg-white"></div>
              <div className="w-8 h-0.5 bg-white"></div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col justify-start gap-12 px-4 bg-[#11150d]">
            {[{
            num: '01',
            label: 'בית',
            href: '#',
            isLink: false
          }, {
            num: '02',
            label: 'אודות',
            href: '#about',
            isLink: false
          }, {
            num: '03',
            label: 'קטלוג',
            href: '/catalog',
            isLink: true
          }, {
            num: '04',
            label: 'צור קשר',
            href: '#contact',
            isLink: false
          }].map(item => <div key={item.num} className="flex items-center gap-4">
                {/* Collapsed State - Number and Dot */}
                <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 absolute' : 'opacity-100'}`}>
                  <span className="font-assistant text-white text-base font-medium whitespace-nowrap">{item.num}</span>
                  <div className="w-2 h-2 rounded-full bg-[#89a86c]"></div>
                </div>

                {/* Expanded State - Full Menu */}
                <div className={`flex items-center gap-4 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                  <span className="font-assistant text-white text-xl font-light min-w-[3rem]">{item.num}</span>
                  <div className="w-2 h-2 rounded-full bg-[#89a86c] flex-shrink-0"></div>
                  {item.isLink ? <Link to={item.href} className="font-assistant text-white text-xl font-medium hover:text-[#89a86c] transition-colors whitespace-nowrap" onClick={() => setIsMenuOpen(false)}>
                      {item.label}
                    </Link> : <a href={item.href} className="font-assistant text-white text-xl font-medium hover:text-[#89a86c] transition-colors whitespace-nowrap" onClick={() => setIsMenuOpen(false)}>
                      {item.label}
                    </a>}
                </div>
              </div>)}
          </nav>
        </div>
      </div>

      {/* Main Content - Add padding to prevent overlap with sidebar */}
      <div className="pr-20">

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-visible">
        {/* Logo - Absolute Position in Hero */}
        <div className="absolute left-4 top-8 z-40 bg-gray-500/40 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px]">
          <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" className="h-32 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick} />
        </div>
        
        <div className="relative w-full h-full">
          {/* Single hero image - no carousel */}
          <div className="absolute inset-0">
            <img src={heroImageData.image_url} alt={heroImageData.title} fetchPriority="high" className="w-full h-full object-cover scale-110" />
          </div>
          
          {/* Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/40 flex flex-col items-end justify-center px-4 md:pr-20">
            <h1 style={{
              textShadow: '4px 4px 8px rgba(0,0,0,0.6)'
            }} className="font-ploni-black-2 text-[120px] sm:text-[160px] md:text-[220px] font-semibold text-primary mb-2 tracking-wider ml-auto">
              בוקט
            </h1>
            <p style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }} className="font-ploni-ultralight text-2xl sm:text-3xl md:text-5xl text-green-900 ml-auto mr-8 md:mr-12 font-normal">כשהפרחים הופכים לרגעים של קסם</p>
          </div>
        </div>

        {/* Dots Indicator - removed as we only have single image */}

        {/* Download Catalog Button - Positioned at section boundary */}
        <div className="absolute left-4 bottom-0 translate-y-1/2 z-[100]">
          {/* White circle background - behind the button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 w-32 h-16 bg-white rounded-b-full shadow-lg -z-10" />
          
          <button onClick={handleDownloadCatalog} className="relative z-10 group" aria-label="להורדת הקטלוג הדיגיטלי שלנו">
            <div className="relative w-24 h-24 hover:scale-110 transition-transform duration-300 mx-[59px] py-0 px-0 my-0 rounded-full">
              {/* Rotating text circle */}
              <img src={downloadCatalogBtn} alt="" className="w-full h-full drop-shadow-2xl animate-spin-slow mix-blend-multiply relative z-20" />
              {/* Static arrow in center */}
              <img src={downloadArrow} alt="להורדת הקטלוג הדיגיטלי שלנו" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-30" />
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

      {/* Gallery Carousel Section */}
      <section className="relative py-16 bg-[#1a1a1a] mt-0">
        <GalleryCarousel slides={carouselImages} />
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Section */}
      <section id="about" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-start">
            {/* Images - Right Side */}
            <div className="flex gap-6">
              {/* Second smaller image - now leftmost */}
              <div className="flex flex-col justify-end h-[600px]">
                <div className="w-48 h-48 rounded-br-[60px] rounded-bl-lg overflow-hidden">
                  <img src="/lovable-uploads/about-image-3.png" alt="סידורי פרחים" width="192" height="192" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Single smaller image */}
              <div className="flex flex-col justify-end h-[600px]">
                <div className="w-48 h-48 rounded-2xl overflow-hidden">
                  <img src="/lovable-uploads/about-image-2.png" alt="עיצוב אירועים" width="192" height="192" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Large image with top-left rounded */}
              <div className="w-64 h-[600px] rounded-tl-[180px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden flex-shrink-0">
                <img src="/lovable-uploads/about-image-1.png" alt="זרי כלה" width="256" height="600" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Text Content - Left Side */}
            <div className="w-full text-right flex flex-col justify-start pt-12">
              {/* Title with layered effect */}
              <div className="relative mb-6">
                <h2 className="font-ploni-black-2 text-[80px] md:text-[90px] font-semibold text-gray-300 opacity-50 leading-none select-none -translate-y-6">
                  About
                </h2>
                <h2 className="font-ploni-black-2 text-6xl md:text-7xl font-semibold text-gray-800 absolute top-1/2 right-0 -translate-y-1/2 leading-none">
                  אודות
                </h2>
              </div>
              <div className="space-y-5 text-gray-700 text-xl leading-relaxed font-ploni-ultralight mt-10">
                <p>
                  כל אירוע מיוחד מתחיל בפרטים הקטנים והפרחים הם אלה שמעניקים לו את הקסם. מתוך אהבה לשזירה ובעזרת סייעתא דשמיא, הפכתי את התחביב לעסק שמלווה אירועים ברגעים הכי חשובים.
                </p>
                <p className="font-semibold">
                  המטרה שלי ברורה:
                </p>
                <p>
                  לדאוג שבאירוע שלכם תהיה נגיעה ייחודית של יופי, רגש וסטייל, דרך זרים, עיצובים וסידורי פרחים שנשזרים מכל הלב.
                </p>
              </div>

              {/* More About Button */}
              <div className="mt-6">
                <Link to="/about">
                  <button className="flex items-center gap-4 hover:scale-105 transition-transform">
                    <span className="font-assistant text-2xl font-bold text-gray-800">עוד עלינו</span>
                    <div className="w-12 h-12">
                      <img src={arrowCircle} alt="עוד עלינו" className="w-full h-full" />
                    </div>
                  </button>
                </Link>
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
                <div className="w-24 h-24 rounded-full bg-white border-4 border-black flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <img src={service.icon} alt={service.text} width="48" height="48" loading="lazy" className="h-12 w-12 object-contain" />
                </div>
                <p className="text-white font-ploni text-sm md:text-base font-black whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Gallery Full Width Image */}
      <section className="w-full">
        <img src="/lovable-uploads/gallery-full.png" alt="גלריה" width="1920" height="600" loading="lazy" className="w-full h-auto object-cover" />
      </section>

      {/* Catalog Section */}
      <section className="py-20 bg-stone-50">
        <div className="text-center">
          <div className="max-w-4xl mx-auto px-4">
            {/* Title with layered effect */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
                <h2 className="font-ploni-black-2 text-[80px] md:text-[90px] font-semibold text-gray-300 opacity-50 leading-none select-none">
                  Catalog
                </h2>
                <h2 className="font-ploni-black-2 text-6xl md:text-7xl font-semibold text-gray-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
                  קטלוג
                </h2>
              </div>
            </div>

            <p className="text-gray-700 text-xl leading-relaxed font-ploni-ultralight mb-8 mt-12">
              כל אירוע מיוחד מתחיל בפרטים הקטנים – והפרחים הם אלה שמעניקים לו את הקסם. מתוך אהבה לשזירה ובעזרת סייעתא דשמיא, הפכתי את התחביב לעסק שמלווה אירועים ברגעים הכי חשובים.
            </p>

            {/* Button with Arrow */}
            <div className="mt-8 mb-12">
              <Link to="/catalog">
                <button className="flex items-center gap-4 hover:scale-105 transition-transform mx-auto">
                  <span className="font-assistant text-2xl font-bold text-gray-800">לכל העיצובים</span>
                  <div className="w-12 h-12">
                    <img src={arrowCircle} alt="לכל העיצובים" className="w-full h-full" />
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
                <img src={item.img} alt={item.title} width="600" height="900" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6">
                  <h3 className="font-assistant text-xl md:text-2xl font-bold text-white">{item.title}</h3>
                </div>
              </Link>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Right Side - Sticky Title */}
            <div className="lg:sticky lg:top-20 lg:self-start pr-8">
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative text-right">
                  <h2 className="font-ploni-black-2 text-[80px] md:text-[90px] font-semibold text-gray-400 opacity-60 leading-tight select-none -mt-4">
                    Work<br />process
                  </h2>
                  <h2 className="font-ploni-black-2 text-6xl md:text-7xl font-semibold text-gray-800 absolute top-[55%] right-4 -translate-y-1/2 leading-tight whitespace-nowrap">
                    איך זה<br />עובד אצלינו?
                  </h2>
                </div>
              </div>
            </div>

            {/* Left Side - Content */}
            <div className="space-y-12">
              {/* Step 01 */}
              <div className="space-y-4">
                <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full">
                  <span className="font-ploni-black-2 text-2xl">01</span>
                </div>
                <h3 className="font-ploni-black-2 text-3xl text-gray-800">
                  שיחת מיקוד להבנת הצרכים
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפגש הראשונה של אושר משותף לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4">
                <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full">
                  <span className="font-ploni-black-2 text-2xl">02</span>
                </div>
                <h3 className="font-ploni-black-2 text-3xl text-gray-800">
                  בחירה והזמנה
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין. בנקודת המפגש הראשונה של אושר משותף, לצד התרגשות נואה, שבירת צלחת ורגעי חוויה קסומים מבשר את בשורת השמחה - זר האירוסין.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4">
                <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-full">
                  <span className="font-ploni-black-2 text-2xl">03</span>
                </div>
                <h3 className="font-ploni-black-2 text-3xl text-gray-800">
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

      {/* How It Works Section */}
      

      {/* Flower Selection Section */}
      

      {/* Presentation Section */}
      

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
                <img src={wazeIcon} alt="Waze" width="200" height="200" loading="lazy" className="h-5 w-5" />
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
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" loading="lazy" className="h-20 w-auto mb-6 brightness-0 invert" />
            <p className="text-white/60 text-sm text-center">
              © 2024 בוקט - עיצוב פרחים ואירועים. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>;
};
export default Index;