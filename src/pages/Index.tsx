
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    image: '/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png',
    title: 'זרי כלה',
    description: 'זרי כלה מעוצבים במיוחד ליום החתונה המושלם'
  },
  {
    id: 2,
    image: '/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png',
    title: 'זרי אירוסין',
    description: 'זרי אירוסين יפים ומרגשים לרגע המיוחד'
  },
  {
    id: 3,
    image: '/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png',
    title: 'סדנאות',
    description: 'סדנאות שזירת פרחים מקצועיות'
  },
  {
    id: 4,
    image: '/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png',
    title: 'הפקת אירועים',
    description: 'הפקת אירועים מלאה עם עיצוב פרחוני מושלם'
  },
  {
    id: 5,
    image: '/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png',
    title: 'עיצוב מתנות',
    description: 'עיצוב מתנות ייחודיות ומרגשות'
  }
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    if (logoClickCount === 2) {
      const password = prompt('הכנס סיסמה:');
      if (password === '0527614436') {
        window.location.href = '/admin';
      } else if (password) {
        alert('סיסמה שגויה');
      }
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
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/catalog" className="text-pink-600 hover:text-pink-700 font-medium">
                קטלוג
              </Link>
            </div>
            
            <div 
              className="flex items-center cursor-pointer"
              onClick={handleLogoClick}
            >
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-16 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <h1 className="text-2xl font-bold text-pink-800">בוקט</h1>
              <p className="text-sm text-gray-600 hidden sm:block">שזירת פרחים רוחי רובינשטיין</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl md:text-2xl max-w-2xl mx-auto px-4">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
        >
          <ChevronLeft className="h-6 w-6 text-pink-600" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
        >
          <ChevronRight className="h-6 w-6 text-pink-600" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-pink-800 mb-8">צרו קשר</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Phone className="h-8 w-8 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">טלפון</h3>
              <a href="tel:0527614436" className="text-pink-600 hover:text-pink-700">
                0527614436
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Mail className="h-8 w-8 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">אימייל</h3>
              <a href="mailto:r0527614436@gmail.com" className="text-pink-600 hover:text-pink-700">
                r0527614436@gmail.com
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-2xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
              <Button 
                onClick={openWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                שלח הודעה
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-pink-800 mb-12">השירותים שלנו</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {slides.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-pink-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט לוגו" 
              className="h-12 w-auto ml-4"
            />
            <h3 className="text-2xl font-bold">בוקט</h3>
          </div>
          <p className="mb-4">שזירת פרחים רוחי רובינשטיין</p>
          <div className="flex justify-center space-x-6 rtl:space-x-reverse">
            <a href="tel:0527614436" className="hover:text-pink-200">0527614436</a>
            <a href="mailto:r0527614436@gmail.com" className="hover:text-pink-200">r0527614436@gmail.com</a>
          </div>
          <p className="mt-4 text-sm text-pink-200">
            מילות קידום: שזירת פרחים לאירוסין, זרי כלה מעוצבים, עיצוב חופות מודיעין עילית, עיצוב מתנות לאירועים, משלוחי פרחים מודיעין עילית
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
