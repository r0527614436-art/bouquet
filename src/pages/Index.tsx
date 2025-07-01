
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const navigate = useNavigate();

  const images = [
    {
      src: "/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png",
      title: "זרי כלה",
      description: "זרי כלה מעוצבים במיוחד ליום המיוחד שלכם"
    },
    {
      src: "/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png",
      title: "זרי אירוסין",
      description: "זרי פרחים מרהיבים לחגיגת האירוסין"
    },
    {
      src: "/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png",
      title: "סדנאות",
      description: "סדנאות שזירת פרחים מקצועיות"
    },
    {
      src: "/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png",
      title: "הפקת אירועים",
      description: "הפקת אירועים דתיים עם עיצוב פרחים מושלם"
    },
    {
      src: "/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png",
      title: "עיצוב מתנות",
      description: "מתנות מעוצבות עם פרחים ושוקולדים"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
            </div>
            
            <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
              <Link to="/catalog" className="text-pink-600 hover:text-pink-800 font-medium">
                קטלוג
              </Link>
              <a href="#contact" className="text-pink-600 hover:text-pink-800 font-medium">
                צור קשר
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Image Carousel */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-4xl md:text-6xl font-bold mb-8">{image.title}</h2>
                  <Link to="/catalog">
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg">
                      צפה בקטלוג
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">
              בוקט - שזירת פרחים
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              מתמחים בשזירת פרחים לאירוסין, זרי כלה מעוצבים, עיצוב חופות במודיעין עילית ובאזור המרכז.
              אנו מציעים הפקת אירועים דתיים, עיצוב מתנות לאירועים, ושירותי משלוח פרחים איכותיים.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-pink-50">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">זרי כלה מעוצבים</h3>
              <p className="text-gray-600">זרי כלה במשלוח עם עיצוב אישי והתאמה מושלמת ליום המיוחד</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-pink-50">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">עיצוב חופות</h3>
              <p className="text-gray-600">חופות מעוצבות וכיסאות כלה במודיעין עילית ובאזור המרכז</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-pink-50">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">מתנות מעוצבות</h3>
              <p className="text-gray-600">מתנות עם שוקולדים ופרחים, קשתות גיבסניות וזרי חישוק</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">צור קשר</h2>
            <p className="text-lg text-gray-700">נשמח לעזור לכם בתכנון האירוע המושלם</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 justify-center max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-pink-800 mb-4">טלפון</h3>
              <a href="tel:0527614436" className="text-lg text-gray-700 hover:text-pink-600 block mb-4">
                0527614436
              </a>
              <a href="mailto:r0527614436@gmail.com" className="text-lg text-gray-700 hover:text-pink-600 block">
                r0527614436@gmail.com
              </a>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-pink-800 mb-4">וואטסאפ</h3>
              <Button 
                onClick={openWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full p-0"
                size="icon"
              >
                <MessageCircle className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט לוגו" 
              className="h-18 w-auto mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">בוקט - שזירת פרחים</h3>
            <p className="text-pink-200 mb-4">
              שזירת פרחים מקצועית במודיעין עילית ובאזור המרכז
            </p>
            <div className="flex justify-center space-x-6 rtl:space-x-reverse mb-4">
              <a href="tel:0527614436" className="text-pink-200 hover:text-white">
                0527614436
              </a>
              <a href="mailto:r0527614436@gmail.com" className="text-pink-200 hover:text-white">
                r0527614436@gmail.com
              </a>
            </div>
            <p className="text-sm text-pink-200">
              © 2025 כל הזכויות שמורות ל{' '}
              <a 
                href="https://c869463294b9.godaddysites.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white underline"
              >
                AD אתרים
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
