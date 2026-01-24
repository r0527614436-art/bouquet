import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
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

  const openGoogleMaps = () => {
    const address = 'שערי תשובה 14, מודיעין עילית';
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF4' }}>
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[45vh] md:min-h-[70vh] w-full" style={{
        backgroundImage: `url('/lovable-uploads/contact-hero-new.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
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

        {/* Content Container */}
        <div className="absolute top-[20%] md:top-[45%] left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          {/* Title with Layered Effect */}
          <div className="relative mb-4 md:mb-8 h-[70px] md:h-auto flex items-center justify-center">
            {/* English Background Text */}
            <h1 className="font-allura text-[45px] md:text-[120px] font-bold text-gray-400/70 leading-none select-none" style={{ transform: 'translate(15px, -10px)' }}>
              Contact us
            </h1>
            {/* Hebrew Front Text */}
            <h1 className="font-synopsis text-[40px] md:text-[100px] font-bold text-[#314020] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none whitespace-nowrap text-center"
                style={{
                  textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                }}>
              צור קשר
            </h1>
          </div>
        </div>
      </div>

      {/* Description Text - Between hero and form section */}
      <div className="text-center px-4 py-6 md:py-8 -mt-4 md:-mt-8 relative z-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-gray-800 text-sm md:text-lg space-y-1">
          <p className="font-ploni-aaa font-semibold">בתהליך בחירת הפרחים והשזירה</p>
          <p className="font-ploni-aaa font-light">מושקע מאמץ רב ע״מ להנגיש לכם זר עמיד יפה ורענן</p>
          <p className="font-ploni-aaa font-light">עם כל זאת מכיון שהפרחים -בחלקם- אינם זמינים בכל ימות השנה</p>
          <p className="font-ploni-aaa font-light">ייתכנו שינויים קלים בסוג הפרח /גוון ובשלבי הפתיחה</p>
        </div>
      </div>

      {/* Contact Form and Info Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form - Now on the Right */}
          <div className="md:order-2">
            <h2 className="text-3xl font-synopsis font-bold text-[#314020] mb-8 text-center">בואו נדבר</h2>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="email"
                    placeholder="אימייל"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-0 py-3 border-0 border-b-2 border-[#314020] bg-transparent outline-none font-ploni-aaa font-light text-[#314020] focus:outline-none focus:border-[#314020] focus:ring-0 text-right transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="שם"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-0 py-3 border-0 border-b-2 border-[#314020] bg-transparent outline-none font-ploni-aaa font-light text-[#314020] focus:outline-none focus:border-[#314020] focus:ring-0 text-right transition-colors"
                  />
                </div>
              </div>
              <div>
                <textarea
                  placeholder="מה אנחנו יכולים לעזור לך?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={4}
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#314020] bg-transparent outline-none font-ploni-aaa font-light text-[#314020] resize-none focus:outline-none focus:border-[#314020] focus:ring-0 text-right transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full py-3 text-lg font-ploni-aaa font-medium transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'שולח...' : 'שליחה'}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                בשליחת הטופס את/ה מסכימ/ה ל<Link to="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</Link>
              </p>
            </form>
          </div>

          {/* Contact Info - Now on the Left with Background */}
          <div className="space-y-6 md:order-1">
            <div className="p-8 rounded-2xl" style={{ backgroundColor: '#F0CFAF4D' }}>
              <h3 className="text-3xl font-synopsis font-bold text-[#314020] mb-8 text-center">פנו אלינו</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-[#314020] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-ploni-aaa font-bold text-[#314020]">כתובת:</p>
                    <p className="font-ploni-aaa font-light text-gray-700">שערי תשובה 14, מודיעין עילית</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-[#314020] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-ploni-aaa font-bold text-[#314020]">טלפון:</p>
                    <a href="tel:052-7614436" className="font-ploni-aaa font-light text-gray-700 hover:text-[#314020]">
                      052-7614436
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#314020] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-ploni-aaa font-bold text-[#314020]">אימייל:</p>
                    <a href="mailto:r0527614436@gmail.com" className="font-ploni-aaa font-light text-gray-700 hover:text-[#314020] break-all">
                      r0527614436@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="text-white/60 text-sm hover:text-white transition-colors">
                מדיניות פרטיות
              </Link>
              <Link to="/accessibility" className="text-white/60 text-sm hover:text-white transition-colors">
                הצהרת נגישות
              </Link>
              <button 
                onClick={() => {
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
                }}
                className="text-white/60 text-sm hover:text-white transition-colors"
              >
                ביטול עסקה
              </button>
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

export default Contact;
