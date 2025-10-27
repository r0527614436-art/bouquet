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
    <section className="py-20 bg-gradient-to-b from-white to-pink-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="font-ploni-black-2 text-[80px] md:text-[90px] font-semibold text-gray-400 opacity-60 leading-tight select-none">
              recom<br/>menda<br/>tions
            </h2>
            <h2 className="font-ploni-black-2 text-6xl md:text-7xl font-semibold text-gray-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-tight whitespace-nowrap text-center">
              זה מה<br/>שאומרים<br/>עלינו
            </h2>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
            <div>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed whitespace-pre-wrap mb-6">
                {testimonials[currentIndex]?.content}
              </p>
            </div>
            <div className="flex justify-between items-center mt-8">
              <p className="font-ploni-medium text-xl text-pink-600">
                {testimonials[currentIndex]?.author_name}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 border-pink-300 hover:bg-pink-50 hover:border-pink-500 transition-colors"
                  disabled={testimonials.length <= 1}
                >
                  <ChevronRight className="h-6 w-6 text-pink-600" />
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 border-pink-300 hover:bg-pink-50 hover:border-pink-500 transition-colors"
                  disabled={testimonials.length <= 1}
                >
                  <ChevronLeft className="h-6 w-6 text-pink-600" />
                </Button>
              </div>
            </div>
          </div>

          {/* Indicator Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-pink-600 w-8'
                      : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                  aria-label={`עבור להמלצה ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
