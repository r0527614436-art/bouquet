import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Testimonials from '@/components/Testimonials';

const About = () => {
  const { toast } = useToast();
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF4' }} id="about-page">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[70vh] bg-cover bg-center" style={{
        backgroundImage: `url('/lovable-uploads/about-hero.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Cloud Gradient Overlay - only bottom fifth (20%) */}
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
          <div style={{ backgroundColor: '#F8FBF4' }} className="backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg">
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" fetchPriority="high" loading="eager" decoding="async" className="h-32 w-auto contrast-125 brightness-110" />
          </div>
        </div>

        {/* Content Container - positioned at the transition */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          {/* Title with Layered Effect - Hebrew in front, English in back */}
          <div className="relative mb-8">
            {/* English Background Text */}
            <h1 className="font-allura text-[115px] md:text-[160px] font-bold text-gray-400/70 leading-none select-none" style={{ transform: 'translate(15px, -10px)' }}>
              About
            </h1>
            {/* Hebrew Front Text */}
            <h1 className="font-synopsis text-[100px] md:text-[140px] font-bold text-[#314020] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none"
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                }}>
              אודות
            </h1>
          </div>

          {/* Description Text */}
          <div className="text-gray-800 text-base md:text-lg space-y-3 mt-32 mb-16 font-ploni-aaa max-w-3xl mx-auto">
            <p className="font-semibold">
              אנו בבוקט שמחים להיות שותפים לרגעים המרגשים שבהם תחינות ובקשות הופכות למציאות של ממש.
            </p>
            <p className="font-light">
              ומאמינם שכל שמחה ראויה לפרחים מושלמים שישלימו את האווירה וכשיש שילוב של איכות טעם רגש והשראה - התוצאה מדברת בעד עצמה כי אנחנו בבוקט לא רק שוזרים פרחים אלא יוצרים חווית חושים. תגלו את הקסם שבפרחים ותזכו לראות איך כל חלום הופך ליצירת אומנות מלאת השראה.
            </p>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Images */}
      <section className="py-16 pt-32 overflow-hidden" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="relative">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-256px * 4 - 24px * 4)); }
            }
            .animate-scroll {
              animation: scroll 40s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="flex gap-6 animate-scroll">
            {[...Array(6)].map((_, setIndex) => 
              [
                '/lovable-uploads/about-new-1.jpg',
                '/lovable-uploads/about-new-2.jpg',
                '/lovable-uploads/about-new-3.jpg',
                '/lovable-uploads/about-new-4.jpg'
              ].map((img, idx) => (
                <div key={`${setIndex}-${idx}`} className="flex-shrink-0 w-64 h-96 rounded-2xl overflow-hidden">
                  <img 
                    src={img} 
                    alt={`עיצוב פרחים ${idx + 1}`} 
                    width="256" 
                    height="384" 
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

      {/* Excellence Section Title */}
      <section className="py-12" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-center">
          <h2 className="font-synopsis text-4xl md:text-5xl font-bold text-[#314020]">אצלינו תמצאו</h2>
        </div>
      </section>

      {/* Services Icons Section */}
      <section className="py-16" style={{ backgroundColor: '#F8FBF4' }}>
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
            }].map((service, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full bg-[#314020] flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  {/* Inner white circle border - thin outer spacing */}
                  <div className="absolute inset-1 rounded-full border-2 border-white"></div>
                  <img src={service.icon} alt={service.text} width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 object-contain brightness-0 invert relative z-10" />
                </div>
                <p className="text-[#314020] font-ploni-aaa font-black text-sm md:text-base whitespace-pre-line">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

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
  );
};

export default About;
