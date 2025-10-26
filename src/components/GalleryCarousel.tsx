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
    <div className="relative w-full mx-auto px-4 py-8">
      <div className="relative flex flex-col items-center justify-center">
        {/* Carousel */}
        <div className="overflow-hidden w-full mb-8" ref={emblaRef}>
          <div className="flex items-center gap-4">
            {slides.map((slide, index) => {
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={`${slide.id}-${index}`}
                  className="flex-[0_0_20%] min-w-[250px] relative"
                >
                  {/* Base container - always rounded rectangle */}
                  <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    {/* Dark blur overlay for non-selected slides */}
                    <div 
                      className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ${
                        isSelected ? 'opacity-0' : 'opacity-100'
                      }`} 
                    />
                  </div>

                  {/* Selected image with dome top - overlays the base */}
                  {isSelected && (
                    <div className="absolute inset-0 animate-fade-in z-10">
                      <div className="relative w-full aspect-[3/4] rounded-3xl rounded-t-[100px] overflow-hidden shadow-2xl">
                        <img
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Title overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center">
                          <h3 className="font-assistant text-white text-2xl font-bold">
                            {slide.title}
                          </h3>
                          {slide.description && (
                            <p className="font-assistant text-white/90 text-sm mt-2">
                              {slide.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
