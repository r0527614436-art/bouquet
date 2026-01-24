import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Testimonials from '@/components/Testimonials';
const About = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
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
  return <div className="min-h-screen" style={{
    backgroundColor: '#F8FBF4'
  }} id="about-page">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[70vh] w-full" style={{
      backgroundImage: `url('/lovable-uploads/about-hero.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 70%',
      backgroundRepeat: 'no-repeat'
    }}>
        {/* Cloud Gradient Overlay - only bottom fifth (20%) */}
        <div className="absolute inset-0" style={{
        background: `
                 radial-gradient(ellipse 120% 25% at 50% 92%, #F8FBF4 0%, rgba(248,251,244,0.95) 20%, rgba(248,251,244,0.85) 40%, rgba(248,251,244,0.6) 60%, rgba(248,251,244,0.3) 80%, transparent 100%),
                 radial-gradient(ellipse 90% 20% at 30% 90%, rgba(248,251,244,0.8) 0%, transparent 70%),
                 radial-gradient(ellipse 100% 22% at 70% 94%, rgba(248,251,244,0.7) 0%, transparent 75%)
               `,
        filter: 'blur(35px)'
      }} />
        
        {/* Multiple smooth transition layers for seamless blend */}
        <div className="absolute inset-0" style={{
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
      }} />
        
        {/* Additional ultra-soft blend layer */}
        <div className="absolute inset-0" style={{
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
      }} />
        
        {/* Final solid bottom section */}
        <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, transparent 0%, transparent 92%, rgba(248,251,244,0.5) 95%, #F8FBF4 100%)'
      }} />
        
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 z-20">
          <div style={{
          backgroundColor: '#F8FBF4'
        }} className="backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-32 w-auto contrast-125 brightness-110" />
          </div>
        </div>

        {/* Content Container - positioned at the transition */}
        <div className="absolute top-[20%] md:top-[45%] left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          {/* Title with Layered Effect - Hebrew in front, English in back */}
          <div className="relative mb-4 md:mb-8 h-[80px] md:h-auto flex items-center justify-center">
            {/* English Background Text */}
            <h1 className="font-allura text-[50px] md:text-[160px] font-light text-gray-400/70 leading-none select-none" style={{
            transform: 'translate(15px, -10px)'
          }}>
              About
            </h1>
            {/* Hebrew Front Text */}
            <h1 className="font-synopsis text-[45px] md:text-[140px] font-bold text-[#314020] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none" style={{
            textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
          }}>
              אודות
            </h1>
          </div>
        </div>
      </div>

      {/* Description Text */}
      <div className="py-4 text-center px-4 w-full" style={{
      backgroundColor: '#F8FBF4'
    }}>
        <div className="text-gray-800 text-sm md:text-lg space-y-2 md:space-y-3 font-ploni-aaa max-w-3xl mx-auto px-4">
          <p className="font-medium">
            אנו בבוקט שמחים להיות שותפים לרגעים המרגשים שבהם תחינות ובקשות הופכות למציאות של ממש.
          </p>
          <p className="font-regular">ומאמינם שכל שמחה ראויה לפרחים מושלמים שישלימו את האווירה וכשיש שילוב של איכות טעם רגש והשראה - התוצאה מדברת בעד עצמה כי אנו בבוקט לא רק שוזרים פרחים אלא יוצרים חווית חושים. תגלו את הקסם שבפרחים ותזכו לראות איך כל חלום הופך ליצירת אומנות מלאת השראה.</p>
        </div>
      </div>

      {/* Infinite Scrolling Images */}
      <section className="pt-4 pb-16 overflow-hidden" style={{
      backgroundColor: '#F8FBF4'
    }}>
        <div className="relative overflow-visible">
          <style>{`
            @keyframes infiniteScroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .scroll-container {
              animation: infiniteScroll 45s linear infinite;
              direction: ltr;
            }
          `}</style>
          <div className="scroll-container flex gap-6 overflow-visible py-4">
            {[...Array(2)].map((_, setIndex) => ['/lovable-uploads/about-scroll-1.jpg', '/lovable-uploads/about-scroll-2.jpg', '/lovable-uploads/about-scroll-3.jpg', '/lovable-uploads/about-scroll-4.jpg', '/lovable-uploads/about-scroll-5.jpg', '/lovable-uploads/about-scroll-6.jpg', '/lovable-uploads/about-scroll-7.jpg', '/lovable-uploads/about-scroll-8.jpg', '/lovable-uploads/about-scroll-9.jpg', '/lovable-uploads/about-scroll-10.jpg', '/lovable-uploads/about-scroll-11.jpg', '/lovable-uploads/about-scroll-12.jpg', '/lovable-uploads/about-scroll-13.jpg', '/lovable-uploads/about-scroll-14.jpg', '/lovable-uploads/about-scroll-15.jpg', '/lovable-uploads/about-scroll-16.jpg', '/lovable-uploads/about-scroll-17.jpg', '/lovable-uploads/about-scroll-18.jpg', '/lovable-uploads/about-scroll-19.jpg', '/lovable-uploads/about-scroll-20.jpg', '/lovable-uploads/about-scroll-21.jpg', '/lovable-uploads/about-scroll-22.jpg', '/lovable-uploads/about-scroll-23.jpg', '/lovable-uploads/about-scroll-24.jpg', '/lovable-uploads/about-scroll-25.jpg', '/lovable-uploads/about-scroll-26.jpg', '/lovable-uploads/about-scroll-27.jpg', '/lovable-uploads/about-scroll-28.jpg'].map((img, idx) => <div key={`${setIndex}-${idx}`} className="flex-shrink-0 rounded-2xl overflow-hidden" style={{
            width: 'calc((100vw - 48px) / 5)',
            height: 'calc(((100vw - 48px) / 5) * 1.5)'
          }}>
                  <img src={img} alt={`עיצוב פרחים ${idx + 1}`} width="384" height="576" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 md:hidden" />
                  <img src={img} alt={`עיצוב פרחים ${idx + 1}`} width="384" height="576" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 hidden md:block" />
                </div>))}
          </div>
        </div>
      </section>

      {/* Excellence Section Title */}
      <section className="py-12" style={{
      backgroundColor: '#F8FBF4'
    }}>
        <div className="text-center">
          <h2 className="font-synopsis text-4xl md:text-5xl font-bold text-[#314020]">אצלינו תמצאו</h2>
        </div>
      </section>

      {/* Services Icons Section */}
      <section className="py-16 overflow-visible" style={{
      backgroundColor: '#F8FBF4'
    }}>
        <div className="max-w-6xl mx-auto px-4 overflow-visible">
          {/* Mobile: 3 on top, 2 on bottom */}
          <div className="md:hidden grid grid-cols-3 gap-4 overflow-visible pt-4">
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
                <div className="relative w-16 h-16 rounded-full bg-[#314020] flex items-center justify-center mb-2 shadow-lg">
                  <div className="absolute inset-1 rounded-full border border-white"></div>
                  <img src={service.icon} alt={service.text} width="32" height="32" loading="lazy" decoding="async" className="h-8 w-8 object-contain brightness-0 invert relative z-10" />
                </div>
                <p className="text-[#314020] font-ploni-aaa font-regular text-xs whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
          <div className="md:hidden grid grid-cols-2 gap-4 overflow-visible pt-4 max-w-[200px] mx-auto">
            {[{
            icon: '/lovable-uploads/icon-delivery.png',
            text: 'משלוחים\nבפריסה ארצית'
          }, {
            icon: '/lovable-uploads/icon-time.png',
            text: 'עמידה\nבזמנים'
          }].map((service, idx) => <div key={idx} className="flex flex-col items-center text-center cursor-pointer">
                <div className="relative w-16 h-16 rounded-full bg-[#314020] flex items-center justify-center mb-2 shadow-lg">
                  <div className="absolute inset-1 rounded-full border border-white"></div>
                  <img src={service.icon} alt={service.text} width="32" height="32" loading="lazy" decoding="async" className="h-8 w-8 object-contain brightness-0 invert relative z-10" />
                </div>
                <p className="text-[#314020] font-ploni-aaa font-regular text-xs whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
          {/* Desktop: 5 in a row */}
          <div className="hidden md:grid md:grid-cols-5 gap-12 overflow-visible pt-4">
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
                <div className="relative w-24 h-24 rounded-full bg-[#314020] flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full border-2 border-white"></div>
                  <img src={service.icon} alt={service.text} width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 object-contain brightness-0 invert relative z-10" />
                </div>
                <p className="text-[#314020] font-ploni-aaa font-regular text-base whitespace-pre-line">{service.text}</p>
              </div>)}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <Testimonials />

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{
      backgroundColor: '#F8FBF4'
    }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Side - Title and Contact Info */}
            <div className="w-full md:w-1/2 text-center md:text-right flex flex-col justify-start pt-12">
              {/* Title with layered effect */}
              <div className="relative mb-12 h-[100px] md:h-auto flex items-center justify-center md:block">
                <h2 className="font-allura text-[60px] md:text-[105px] font-light text-[#314020]/30 opacity-50 leading-none select-none" style={{
                transform: 'translate(15px, -10px)'
              }}>
                  Contact us
                </h2>
                <h2 className="font-synopsis text-[50px] md:text-[90px] font-semibold text-[#314020] absolute top-1/2 left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 leading-none text-center md:text-right">
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
    </div>;
};
export default About;