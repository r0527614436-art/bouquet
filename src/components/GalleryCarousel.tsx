import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import arrowSimple from '@/assets/arrow-simple.webp';

interface GallerySlide {
  id: string;
  image_url: string;
  title: string;
  description?: string | null;
}

interface GalleryCarouselProps {
  slides: GallerySlide[];
}

export const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  slides
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gallerySelectedIndex, setGallerySelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: false,
    dragFree: false,
    slidesToScroll: 1,
    duration: 30,
    startIndex: 0
  });
  const [galleryEmblaRef, galleryEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
    duration: 30,
    startIndex: 2
  }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const galleryScrollPrev = useCallback(() => {
    if (galleryEmblaApi) galleryEmblaApi.scrollPrev();
  }, [galleryEmblaApi]);
  
  const galleryScrollNext = useCallback(() => {
    if (galleryEmblaApi) galleryEmblaApi.scrollNext();
  }, [galleryEmblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  
  const onGallerySelect = useCallback(() => {
    if (!galleryEmblaApi) return;
    setGallerySelectedIndex(galleryEmblaApi.selectedScrollSnap());
  }, [galleryEmblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);
  
  useEffect(() => {
    if (!galleryEmblaApi) return;
    
    // Set initial index to 2 after carousel is ready
    galleryEmblaApi.scrollTo(2, true);
    
    onGallerySelect();
    galleryEmblaApi.on('select', onGallerySelect);
    return () => {
      galleryEmblaApi.off('select', onGallerySelect);
    };
  }, [galleryEmblaApi, onGallerySelect]);

  return (
    <div className="relative w-full mx-auto py-8 md:py-16" style={{ backgroundColor: '#11150d' }}>
      <div className="relative flex flex-col items-center justify-center w-full bg-[#11150d]">
        {/* Carousel - Full width on mobile */}
        <div className="overflow-visible w-full mb-4 md:mb-8 mx-auto" ref={emblaRef}>
          <div className="flex items-center gap-3 md:gap-6">
            {slides.map((slide, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div 
                  key={`slide-${slide.id}-${index}-${slide.image_url}`} 
                  className="flex-shrink-0" 
                  style={{ width: 'calc(100vw - 80px)', maxWidth: '320px' }}
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl">
                    <img 
                      src={slide.image_url} 
                      alt={slide.title} 
                      width="320" 
                      height="427" 
                      loading="lazy"
                      fetchPriority={index < 3 ? "high" : "low"}
                      decoding="async" 
                      onError={e => {
                        console.error('Failed to load image:', slide.image_url);
                        e.currentTarget.style.display = 'none';
                      }} 
                      className="w-full h-full object-cover" 
                    />

                    {/* Title overlay - only show on selected */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6 text-center">
                        <h3 className="font-synopsis text-white text-xl md:text-2xl font-bold drop-shadow-2xl">
                          {slide.title}
                        </h3>
                        {slide.description && (
                          <p className="font-synopsis font-medium text-white/90 text-xs md:text-sm mt-2 drop-shadow-lg">
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

        {/* Gallery Carousel Section - Smaller on mobile */}
        <div className="relative overflow-hidden pb-4 md:pb-8 w-full h-[300px] md:h-[650px] flex items-center justify-center">
          <div className="overflow-hidden w-full md:max-w-[90vw] mx-auto">
            <div className="overflow-visible w-full px-2 md:px-4" ref={galleryEmblaRef}>
              <div className="flex items-center justify-center">
                {[
                  '/lovable-uploads/scroll-1.webp',
                  '/lovable-uploads/scroll-2.webp',
                  '/lovable-uploads/scroll-3.webp',
                  '/lovable-uploads/scroll-4.webp',
                  '/lovable-uploads/scroll-5.webp',
                  '/lovable-uploads/scroll-6.webp',
                  '/lovable-uploads/scroll-7.webp',
                  '/lovable-uploads/scroll-8.webp',
                  '/lovable-uploads/scroll-9.webp',
                  '/lovable-uploads/scroll-10.webp',
                  '/lovable-uploads/scroll-11.webp',
                  '/lovable-uploads/scroll-12.webp',
                  '/lovable-uploads/scroll-13.webp',
                  '/lovable-uploads/scroll-14.webp',
                  '/lovable-uploads/scroll-15.webp',
                  '/lovable-uploads/scroll-16.webp',
                  '/lovable-uploads/scroll-17.webp',
                  '/lovable-uploads/scroll-18.webp',
                  '/lovable-uploads/scroll-19.webp',
                  '/lovable-uploads/scroll-20.webp',
                  '/lovable-uploads/scroll-21.webp',
                  '/lovable-uploads/scroll-22.webp',
                  '/lovable-uploads/scroll-23.webp',
                  '/lovable-uploads/scroll-24.webp',
                  '/lovable-uploads/scroll-25.webp',
                  '/lovable-uploads/scroll-26.webp',
                  '/lovable-uploads/scroll-27.webp',
                  '/lovable-uploads/scroll-28.webp',
                  '/lovable-uploads/scroll-29.webp',
                  '/lovable-uploads/scroll-30.webp'
                ].map((img, idx) => {
                  const isSelected = idx === gallerySelectedIndex;
                  
                  return (
                    <div 
                      key={`scroll-${idx}`} 
                      className="flex-shrink-0 transition-all duration-500 ease-out relative"
                      style={{
                        width: isSelected ? 'calc(30vw)' : 'calc(18vw)',
                        maxWidth: isSelected ? '400px' : '250px',
                        marginLeft: idx === 0 ? '0' : '-30px',
                        zIndex: isSelected ? 20 : 10
                      }}
                    >
                      <div 
                        className="relative w-full overflow-hidden shadow-2xl transition-all duration-500 hidden md:block"
                        style={{
                          height: isSelected ? '550px' : '400px',
                          marginTop: isSelected ? '0' : '75px',
                          borderRadius: isSelected ? '100px 100px 16px 16px' : '16px'
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${idx + 1}`} 
                          width="400"
                          height="500"
                          loading="lazy"
                          fetchPriority={Math.abs(idx - 2) <= 2 ? "high" : "low"}
                          decoding="async" 
                          className="w-full h-full object-cover" 
                        />
                        {!isSelected && (
                          <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" />
                        )}
                      </div>
                      {/* Mobile version */}
                      <div 
                        className="relative w-full overflow-hidden shadow-2xl transition-all duration-500 md:hidden"
                        style={{
                          height: isSelected ? '250px' : '175px',
                          marginTop: isSelected ? '0' : '37px',
                          borderRadius: isSelected ? '50px 50px 24px 24px' : '8px 8px 24px 24px'
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${idx + 1}`} 
                          width="200"
                          height="250"
                          loading="lazy"
                          fetchPriority={Math.abs(idx - 2) <= 2 ? "high" : "low"}
                          decoding="async" 
                          className="w-full h-full object-cover" 
                        />
                        {!isSelected && (
                          <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Below carousel at edges */}
        <div className="flex items-center justify-center gap-8 w-full mt-2 md:mt-[-40px] px-4">
          <button 
            onClick={galleryScrollPrev} 
            className="w-10 h-10 md:w-16 md:h-16" 
            aria-label="Previous gallery image"
          >
            <img src={arrowSimple} alt="Previous" className="w-full h-full rotate-180" />
          </button>

          <button 
            onClick={galleryScrollNext} 
            className="w-10 h-10 md:w-16 md:h-16" 
            aria-label="Next gallery image"
          >
            <img src={arrowSimple} alt="Next" className="w-full h-full" />
          </button>
        </div>
      </div>
    </div>
  );
};