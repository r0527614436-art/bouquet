import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
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

        {/* Top Right Button */}
        <div className="absolute top-8 right-8 z-20">
          <Link to="/" className="flex items-center text-white hover:text-pink-200 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowRight className="h-5 w-5 ml-2" />
            חזרה לעמוד הבית
          </Link>
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
          <div className="text-gray-800 text-base md:text-lg space-y-3 mt-24 font-ploni-aaa max-w-3xl mx-auto">
            <p className="font-semibold">
              אנו בבוקט שמחים להיות שותפים לרגעים המרגשים שבהם תחינות ובקשות הופכות למציאות של ממש.
            </p>
            <p className="font-light">
              ומאמינם שכל שמחה ראויה לפרחים מושלמים שישלימו את האווירה וכשיש שילוב של איכות טעם רגש והשראה - התוצאה מדברת בעד עצמה כי אנחנו בבוקט לא רק שוזרים פרחים אלא יוצרים חווית חושים. תגלו את הקסם שבפרחים ותזכו לראות איך כל חלום הופך ליצירת אומנות מלאת השראה.
            </p>
          </div>
        </div>
      </div>

      {/* Images Gallery - 5 images in a row */}
      <section className="py-12" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="w-full px-0">
          <div className="flex gap-0 overflow-hidden">
            {/* Placeholder for 5 images - user will provide them */}
            <div className="flex-1 h-64 md:h-80 bg-gray-200">
              <img src="/lovable-uploads/about-image-1.png" alt="עיצוב פרחים 1" width="384" height="320" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 h-64 md:h-80 bg-gray-200">
              <img src="/lovable-uploads/about-image-2.png" alt="עיצוב פרחים 2" width="384" height="320" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 h-64 md:h-80 bg-gray-200">
              <img src="/lovable-uploads/about-image-3.png" alt="עיצוב פרחים 3" width="384" height="320" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 h-64 md:h-80 bg-gray-200">
              <img src="/lovable-uploads/about-image-4.png" alt="עיצוב פרחים 4" width="384" height="320" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 h-64 md:h-80 bg-gray-200">
              <img src="/lovable-uploads/about-image-5.png" alt="עיצוב פרחים 5" width="384" height="320" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Excellence Section Title */}
      <section className="py-12" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-center">
          <h2 className="font-synopsis text-4xl md:text-5xl font-bold text-[#314020]">אצלינו המצוינות</h2>
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
                <div className="w-24 h-24 rounded-full bg-[#314020] border-4 border-[#314020] flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <img src={service.icon} alt={service.text} width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 object-contain brightness-0 invert" />
                </div>
                <p className="text-[#314020] font-ploni-aaa font-black text-sm md:text-base whitespace-pre-line">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט לוגו" width="476" height="726" loading="lazy" decoding="async" className="h-20 w-auto mb-6 brightness-0 invert" />
            <p className="text-white/60 text-sm text-center">
              © 2024 בוקט - עיצוב פרחים ואירועים. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
