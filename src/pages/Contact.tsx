import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const { toast } = useToast();

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

  const openGoogleMaps = () => {
    const address = 'שערי תשובה 14, מודיעין עלית';
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF4' }}>
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[70vh] bg-cover bg-center" style={{
        backgroundImage: `url('/lovable-uploads/contact-hero.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* White Cloud Gradient Overlay */}
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
        
        {/* Multiple smooth transition layers */}
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

        {/* Back Button */}
        <div className="absolute top-8 right-8 z-20">
          <Link to="/" className="flex items-center text-white hover:text-pink-200 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowRight className="h-5 w-5 ml-2" />
            חזרה לעמוד הבית
          </Link>
        </div>

        {/* Content Container */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          {/* Title with Layered Effect */}
          <div className="relative mb-8">
            {/* English Background Text */}
            <h1 className="font-allura text-[115px] md:text-[160px] font-bold text-gray-400/70 leading-none select-none" style={{ transform: 'translate(15px, -10px)' }}>
              Contact us
            </h1>
            {/* Hebrew Front Text */}
            <h1 className="font-synopsis text-[100px] md:text-[140px] font-bold text-[#314020] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none"
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                }}>
              צור קשר
            </h1>
          </div>

          {/* Description Text */}
          <div className="text-gray-800 text-base md:text-lg space-y-1 mt-24 mb-16">
            <p className="font-ploni-aaa font-semibold">בתהליך בחירת הפרחים והשזירה</p>
            <p className="font-ploni-aaa font-light">מושקע מאמץ רב ע״מ להנגיש לכם זר עמיד יפה ורענן</p>
            <p className="font-ploni-aaa font-light">עם כל זאת מכיון שהפרחים -בחלקם- אינם זמינים בכל ימות השנה</p>
            <p className="font-ploni-aaa font-light">ייתכנו שינויים קלים בסוג הפרח /גוון ובשלבי הפתיחה</p>
          </div>
        </div>
      </div>

      {/* Contact Form and Info Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-ploni-aaa font-black text-gray-800 mb-6 text-center">בוא ונדבר</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="שם"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#3d5a3d] bg-transparent outline-none font-ploni-aaa transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="אימייל"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#3d5a3d] bg-transparent outline-none font-ploni-aaa transition-colors"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="טלפון"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#3d5a3d] bg-transparent outline-none font-ploni-aaa transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="מה אנחנו יכולים לעזור לך?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#3d5a3d] bg-transparent outline-none font-ploni-aaa resize-none transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#3d5a3d] hover:bg-[#6b8e6b] text-white rounded-full py-6 text-lg font-ploni-aaa font-bold shadow-lg hover:shadow-[0_0_20px_rgba(107,142,107,0.7)] transition-all duration-300"
              >
                שליחה
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-[#f5ebe0]/50 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-ploni-aaa font-black text-gray-800 mb-6 text-center">פנו אלינו</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                  <MapPin className="h-6 w-6 text-[#3d5a3d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-ploni-aaa font-bold text-gray-800">כתובת:</p>
                    <p className="font-ploni-aaa text-gray-600">שערי תשובה 14, מודיעין עלית</p>
                    <button 
                      onClick={openGoogleMaps}
                      className="text-[#3d5a3d] hover:text-[#6b8e6b] font-ploni-aaa font-medium text-sm mt-1"
                    >
                      פתח ב-Waze →
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                  <Phone className="h-6 w-6 text-[#3d5a3d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-ploni-aaa font-bold text-gray-800">טלפון:</p>
                    <a href="tel:052-7614436" className="font-ploni-aaa text-gray-600 hover:text-[#3d5a3d]">
                      052-7614436
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                  <Mail className="h-6 w-6 text-[#3d5a3d] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-ploni-aaa font-bold text-gray-800">אימייל:</p>
                    <a href="mailto:r0527614436@gmail.com" className="font-ploni-aaa text-gray-600 hover:text-[#3d5a3d] break-all">
                      r0527614436@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
