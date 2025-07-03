import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface HomepageSlide {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const navigate = useNavigate();

  // Fetch slides from database
  const { data: slides = [] } = useQuery({
    queryKey: ['homepage-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_slides' as any)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as HomepageSlide[];
    }
  });

  // Fallback images if no slides in database
  const fallbackImages = [
    {
      id: '1',
      image_url: "/lovable-uploads/1f77b92c-020c-41ff-b94d-9b5e6d302d98.png",
      title: "זרי כלה",
      description: "זרי כלה מעוצבים במיוחד ליום המיוחד שלכם",
      order_index: 1,
      is_active: true
    },
    {
      id: '2',
      image_url: "/lovable-uploads/46fe89ae-9c95-44d5-9e78-ccca2c5591d8.png",
      title: "זרי אירוסין",
      description: "זרי פרחים מרהיבים לחגיגת האירוסין",
      order_index: 2,
      is_active: true
    },
    {
      id: '3',
      image_url: "/lovable-uploads/90a3731f-9a7c-492b-9345-f78bd924c8eb.png",
      title: "סדנאות",
      description: "סדנאות שזירת פרחים מקצועיות",
      order_index: 3,
      is_active: true
    },
    {
      id: '4',
      image_url: "/lovable-uploads/ece817b9-a53c-4ab8-a2b0-654f1256f4af.png",
      title: "הפקת אירועים",
      description: "הפקת אירועים דתיים עם עיצוב פרחים מושלם",
      order_index: 4,
      is_active: true
    },
    {
      id: '5',
      image_url: "/lovable-uploads/ee57dae4-8c40-4ab9-97f5-0ccfd85001ee.png",
      title: "עיצוב מתנות",
      description: "מתנות מעוצבות עם פרחים ושוקולדים",
      order_index: 5,
      is_active: true
    }
  ];

  const images = slides.length > 0 ? slides : fallbackImages;

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
            <nav className="hidden md:flex space-x-6 rtl:space-x-reverse">
              <Link 
                to="/catalog" 
                className="px-4 py-2 text-pink-600 hover:text-white hover:bg-pink-600 font-medium rounded-lg transition-all duration-200 border border-pink-600"
              >
                קטלוג
              </Link>
              <a 
                href="#contact" 
                className="px-4 py-2 text-pink-600 hover:text-white hover:bg-pink-600 font-medium rounded-lg transition-all duration-200 border border-pink-600"
              >
                צור קשר
              </a>
            </nav>
            
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-36 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Image Carousel */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.image_url}
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
              מתמחים בשזירת פרחים לאירוסין, זרי כלה מעוצבים, עיצוב חופות.
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
              <p className="text-gray-600">חופות מעוצבות וכיסאות כלה</p>
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
                className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                size="icon"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">בוקט - שזירת פרחים</h3>
            <p className="text-pink-200 mb-4">
              שזירת פרחים מקצועית
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
