import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-background" id="about-page">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[70vh] bg-cover bg-center" style={{
        backgroundImage: `url('/lovable-uploads/about-hero.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* White Cloud Gradient Overlay - only bottom fifth (20%) */}
        <div className="absolute inset-0" 
             style={{
               background: `
                 radial-gradient(ellipse 120% 25% at 50% 92%, rgba(248,251,244,1) 0%, rgba(248,251,244,0.95) 20%, rgba(248,251,244,0.85) 40%, rgba(248,251,244,0.6) 60%, rgba(248,251,244,0.3) 80%, transparent 100%),
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
                   rgba(248,251,244,1) 100%
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
                   rgba(248,251,244,1) 100%
                 )
               `,
               filter: 'blur(40px)'
             }} 
        />
        
        {/* Final solid bottom section */}
        <div className="absolute inset-0" 
             style={{
               background: 'linear-gradient(to bottom, transparent 0%, transparent 92%, rgba(248,251,244,0.5) 95%, rgba(248,251,244,1) 100%)'
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
          <div className="text-gray-800 text-base md:text-lg space-y-3 mt-24 font-ploni-aaa">
            <p className="font-light">
              כל אירוע מיוחד מתחיל בפרטים הקטנים והפרחים הם אלה שמעניקים לו את הקסם.
            </p>
            <p className="font-light">
              מתוך אהבה לשזירה ובעזרת סייעתא דשמיא, הפכתי את התחביב לעסק
            </p>
            <p className="font-light">
              שמלווה אירועים ברגעים הכי חשובים.
            </p>
          </div>
        </div>
      </div>

      {/* About Content Section */}
      <section className="py-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-start">
            {/* Images - Right Side */}
            <div className="flex gap-6">
              {/* Second smaller image - now leftmost */}
              <div className="flex flex-col justify-end h-[500px]">
                <div className="w-48 h-48 rounded-br-[60px] rounded-bl-lg overflow-hidden shadow-xl">
                  <img src="/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png" alt="זרי כלה" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Single smaller image */}
              <div className="flex flex-col justify-end h-[500px]">
                <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl">
                  <img src="/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png" alt="סדנאות" width="192" height="192" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Large image with top-left rounded */}
              <div className="w-64 h-[500px] rounded-tl-[120px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden flex-shrink-0 shadow-xl">
                <img src="/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png" alt="זרי אירוסין" width="256" height="500" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Text Content - Left Side */}
            <div className="flex-1 text-right min-h-[500px] flex flex-col justify-center">
              <div className="space-y-5 text-gray-700 text-xl leading-relaxed font-ploni-aaa font-light">
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
            </div>
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
