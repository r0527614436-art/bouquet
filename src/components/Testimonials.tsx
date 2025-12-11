import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import arrowSimple from '@/assets/arrow-simple.png';

interface Testimonial {
  id: string;
  author_name: string;
  content: string;
  order_index: number;
  is_active: boolean;
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Auto-play functionality
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  if (testimonials.length === 0) {
    return null;
  }

  // Get two testimonials at a time for desktop
  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    if (testimonials.length === 1) return [testimonials[0]];
    
    const first = testimonials[currentIndex];
    const second = testimonials[(currentIndex + 1) % testimonials.length];
    return [first, second];
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-20 bg-[#11150d]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Title and Navigation - Right Side */}
          <div className="lg:w-1/3 pt-8">
            <div className="relative mb-8">
              <h2 className="font-allura text-[70px] md:text-[82px] font-light text-muted-foreground/40 leading-none select-none" style={{ transform: 'translate(15px, -10px)' }}>
                recommen<br/>dations
              </h2>
              <h2 className="font-synopsis text-[60px] md:text-[70px] font-semibold absolute top-1/2 right-0 -translate-y-1/2 leading-none whitespace-nowrap text-right" style={{ color: '#F8FBF4' }}>
                זה מה<br/>שאומרים<br/>עלינו.
              </h2>
            </div>

            {/* Navigation Arrows - Under Title */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleNext}
                className="w-12 h-12 hover:scale-110 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed rotate-180"
                disabled={testimonials.length <= 1}
              >
                <img src={arrowSimple} alt="Next" className="w-full h-full" />
              </button>
              <button
                onClick={handlePrevious}
                className="w-12 h-12 hover:scale-110 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={testimonials.length <= 1}
              >
                <img src={arrowSimple} alt="Previous" className="w-full h-full" />
              </button>
            </div>
          </div>

          {/* Testimonials Content - Left Side */}
          <div className="lg:w-2/3">
            {/* Desktop: 2 testimonials, Mobile: 1 testimonial */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {visibleTestimonials.map((testimonial, idx) => (
                <div key={testimonial?.id || idx} className="bg-white text-gray-800 rounded-2xl shadow-xl p-8 min-h-[280px] flex flex-col">
                  <p className="text-base leading-relaxed whitespace-pre-wrap mb-6 flex-1">
                    {testimonial?.content}
                  </p>
                  <p className="font-ploni-aaa font-medium text-lg text-right mt-4">
                    {testimonial?.author_name}
                  </p>
                </div>
              ))}
            </div>
            {/* Mobile: Single testimonial */}
            <div className="md:hidden">
              <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-8 min-h-[280px] flex flex-col">
                <p className="text-base leading-relaxed whitespace-pre-wrap mb-6 flex-1">
                  {testimonials[currentIndex]?.content}
                </p>
                <p className="font-ploni-aaa font-medium text-lg text-right mt-4">
                  {testimonials[currentIndex]?.author_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
