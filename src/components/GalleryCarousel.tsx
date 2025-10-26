import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import arrowCircle from '@/assets/arrow-circle.png';

interface GallerySlide {
  id: string;
  image_url: string;
  title: string;
  description?: string | null;
}

interface GalleryCarouselProps {
  slides: GallerySlide[];
}

export const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ slides }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      skipSnaps: false,
      containScroll: false,
      dragFree: false,
      slidesToScroll: 1
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full mx-auto px-4 py-16">
      <div className="relative flex flex-col items-center justify-center">
        {/* Carousel */}
        <div className="overflow-visible w-full mb-8" ref={emblaRef}>
          <div className="flex items-center gap-6">
            {slides.map((slide, index) => {
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={`slide-${slide.id}-${index}-${slide.image_url}`}
                  className={`flex-[0_0_300px] transition-all duration-700 ease-in-out ${
                    isSelected ? 'scale-125 z-20' : 'scale-90 z-10'
                  }`}
                  style={{
                    minWidth: '300px'
                  }}
                >
                  <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      loading="eager"
                      onError={(e) => {
                        console.error('Failed to load image:', slide.image_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        isSelected ? 'brightness-100' : 'brightness-50'
                      }`}
                    />
                    
                    {/* Dark blur overlay for non-selected slides */}
                    <div 
                      className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-700 ${
                        isSelected ? 'opacity-0' : 'opacity-100'
                      }`} 
                    />

                    {/* Title overlay - only show on selected */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-center animate-fade-in">
                        <h3 className="font-assistant text-white text-2xl font-bold drop-shadow-lg">
                          {slide.title}
                        </h3>
                        {slide.description && (
                          <p className="font-assistant text-white/90 text-sm mt-2 drop-shadow-md">
                            {slide.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons - Below Carousel */}
        <div className="flex items-center justify-center gap-8 mt-4">
          <button
            onClick={scrollPrev}
            className="w-16 h-16 hover:scale-110 transition-transform"
            aria-label="Previous slide"
          >
            <img 
              src={arrowCircle} 
              alt="Previous" 
              className="w-full h-full rotate-180"
            />
          </button>

          <button
            onClick={scrollNext}
            className="w-16 h-16 hover:scale-110 transition-transform"
            aria-label="Next slide"
          >
            <img 
              src={arrowCircle} 
              alt="Next" 
              className="w-full h-full"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
