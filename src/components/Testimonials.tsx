import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#11150d]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Title and Navigation - Right Side */}
          <div className="lg:w-1/3">
            <div className="relative mb-8">
              <h2 className="font-ploni-black-2 text-[60px] md:text-[70px] font-semibold text-muted-foreground/40 leading-tight select-none">
                recommen<br/>dations
              </h2>
              <h2 className="font-ploni-black-2 text-5xl md:text-6xl font-semibold text-white absolute top-1/2 right-0 -translate-y-1/2 leading-tight whitespace-nowrap text-right">
                זה מה<br/>שאומרים<br/>עלינו.
              </h2>
            </div>

            {/* Navigation Arrows - Under Title */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handlePrevious}
                variant="ghost"
                size="sm"
                className="text-primary-foreground bg-primary/80 hover:bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/30 transition-all duration-300 hover:scale-105"
                disabled={testimonials.length <= 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleNext}
                variant="ghost"
                size="sm"
                className="text-primary-foreground bg-primary/80 hover:bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/30 transition-all duration-300 hover:scale-105"
                disabled={testimonials.length <= 1}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Testimonials Content - Left Side */}
          <div className="lg:w-2/3">
            <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-8 md:p-12 min-h-[300px]">
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-6">
                {testimonials[currentIndex]?.content}
              </p>
              <p className="font-ploni-medium text-lg text-right mt-4">
                {testimonials[currentIndex]?.author_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
