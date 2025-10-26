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
      slidesToScroll: 1,
      duration: 30,
      startIndex: 0
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
    <div className="relative w-full mx-auto py-16" style={{ backgroundColor: '#314020' }}>
      <div className="relative flex flex-col items-center justify-center w-full">
        {/* Carousel */}
        <div className="overflow-visible w-full max-w-[1400px] mb-8 mx-auto" ref={emblaRef}>
          <div className="flex items-center justify-start">
            {slides.map((slide, index) => {
              const isSelected = index === selectedIndex;
              const distanceFromSelected = Math.abs(index - selectedIndex);
              const zIndex = isSelected ? 200 : 100 - (distanceFromSelected * 10);
              
              return (
                <div
                  key={`slide-${slide.id}-${index}-${slide.image_url}`}
                  className="flex-shrink-0"
                  style={{
                    width: isSelected ? '500px' : '320px',
                    transformOrigin: 'center center',
                    zIndex: zIndex,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'scale(1.15)' : 'scale(0.88)',
                    marginLeft: index === 0 ? '0' : '-100px',
                    marginRight: index === slides.length - 1 ? '0' : '-100px'
                  }}
                >
                  <div className={`relative w-full aspect-[3/4] overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 ${
                    isSelected ? 'rounded-t-[100px] rounded-b-2xl' : 'rounded-2xl'
                  }`}>
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      loading="eager"
                      onError={(e) => {
                        console.error('Failed to load image:', slide.image_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      style={{
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      className={`w-full h-full object-cover ${
                        isSelected ? 'brightness-110 saturate-110' : 'brightness-40 saturate-50'
                      }`}
                    />
                    
                    {/* Dark blur overlay for non-selected slides */}
                    <div 
                      className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] ${
                        isSelected ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />

                    {/* Title overlay - only show on selected */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-center animate-fade-in">
                        <h3 className="font-assistant text-white text-2xl font-bold drop-shadow-2xl">
                          {slide.title}
                        </h3>
                        {slide.description && (
                          <p className="font-assistant text-white/90 text-sm mt-2 drop-shadow-lg">
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
