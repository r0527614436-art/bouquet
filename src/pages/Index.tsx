
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [resetTimer, setResetTimer] = useState<NodeJS.Timeout | null>(null);
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

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);

    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    const timer = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
    setResetTimer(timer);

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
                className="h-16 w-auto ml-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
              <h1 className="text-2xl font-bold text-pink-800">בוקט - שזירת פרחים</h1>
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
                  <h2 className="text-4xl md:text-6xl font-bold mb-4">{image.title}</h2>
                  <p className="text-xl md:text-2xl mb-8">{image.description}</p>
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

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronRight className="h-6 w-6 text-pink-600" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
        >
          <ChevronLeft className="h-6 w-6 text-pink-600" />
        </button>

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
              בוקט - שזירת פרחים רוחי רובינשטיין
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

      {/* Services Section */}
      <section className="py-16 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-pink-800 mb-4">השירותים שלנו</h2>
            <p className="text-lg text-gray-700">שירותי שזירת פרחים מקצועיים לכל אירוע</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">שזירת פרחים לאירוסין</h3>
              <p className="text-gray-600">זר אירוסין בהתאמה אישית עם פרחים איכותיים</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">הפקת אירועים דתיים</h3>
              <p className="text-gray-600">עיצוב אירועים לפי תקציב עם פרחים לאירוע</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">משלוחים</h3>
              <p className="text-gray-600">משלוחי פרחים לבני ברק, ירושלים, פתח תקווה ורמת גן</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">פרחים לשבת</h3>
              <p className="text-gray-600">זרי פרחים מיוחדים לכבוד השבת והחגים</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">חבילת כלה שלמה</h3>
              <p className="text-gray-600">פתרון מקיף הכולל זר כלה, חופה ועיצוב מלא</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-pink-800 mb-3">זרים עגולים</h3>
              <p className="text-gray-600">זרי חישוק מעוצבים לאירועים מיוחדים</p>
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

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-pink-800 mb-2">טלפון</h3>
              <a href="tel:0527614436" className="text-lg text-gray-700 hover:text-pink-600">
                0527614436
              </a>
            </div>

            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-pink-800 mb-2">אימייל</h3>
              <a href="mailto:r0527614436@gmail.com" className="text-lg text-gray-700 hover:text-pink-600">
                r0527614436@gmail.com
              </a>
            </div>

            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-pink-800 mb-2">וואטסאפ</h3>
              <Button 
                onClick={openWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                שלח הודעה בוואטסאפ
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
              className="h-12 w-auto mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">בוקט - שזירת פרחים רוחי רובינשטיין</h3>
            <p className="text-pink-200 mb-4">
              שזירת פרחים מקצועית במודיעין עילית ובאזור המרכז
            </p>
            <div className="flex justify-center space-x-6 rtl:space-x-reverse">
              <a href="tel:0527614436" className="text-pink-200 hover:text-white">
                0527614436
              </a>
              <a href="mailto:r0527614436@gmail.com" className="text-pink-200 hover:text-white">
                r0527614436@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
