import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-stone-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="h-5 w-5" />
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>

      {/* About Section - Same as homepage */}
      <section className="py-20 bg-stone-50">
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
              {/* Title with layered effect */}
              <div className="relative mb-8">
                <h2 className="font-allura text-[80px] md:text-[90px] font-semibold text-gray-300 opacity-50 leading-none select-none" style={{ transform: 'translate(15px, -10px)' }}>
                  About
                </h2>
                <h2 className="font-synopsis text-[80px] md:text-[90px] font-semibold text-gray-800 absolute top-1/2 right-0 -translate-y-1/2 leading-none">
                  אודות
                </h2>
              </div>
              <div className="space-y-5 text-gray-700 text-xl leading-relaxed font-ploni-ultralight mt-16">
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
