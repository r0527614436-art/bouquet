import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
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
export const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  slides
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
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
  return <div className="relative w-full mx-auto py-16" style={{
    backgroundColor: '#11150d'
  }}>
      <div className="relative flex flex-col items-center justify-center w-full bg-[#11150d]">
        {/* Carousel */}
        <div className="overflow-visible w-full mb-8 mx-auto" ref={emblaRef}>
          <div className="flex items-center gap-6">
            {slides.map((slide, index) => {
            const isSelected = index === selectedIndex;
            return <div key={`slide-${slide.id}-${index}-${slide.image_url}`} className="flex-shrink-0" style={{
              width: '320px'
            }}>
                  <div className="relative w-full aspect-[3/4] overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl">
                    <img src={slide.image_url} alt={slide.title} width="320" height="427" loading={index === 0 ? "eager" : "lazy"} decoding="async" onError={e => {
                  console.error('Failed to load image:', slide.image_url);
                  e.currentTarget.style.display = 'none';
                }} className="w-full h-full object-cover" />

                    {/* Title overlay - only show on selected */}
                    {isSelected && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-center">
                        <h3 className="font-ploni-aaa font-semibold text-white text-2xl font-bold drop-shadow-2xl">
                          {slide.title}
                        </h3>
                        {slide.description && <p className="font-ploni-aaa font-medium text-white/90 text-sm mt-2 drop-shadow-lg">
                            {slide.description}
                          </p>}
                      </div>}
                  </div>
                </div>;
          })}
          </div>
        </div>

        {/* Infinite Scrolling Images Section */}
        <div className="relative overflow-hidden pb-8">
          <style>{`
            @keyframes infiniteScroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .scroll-container {
              animation: infiniteScroll 45s linear infinite;
              direction: ltr;
            }
          `}</style>
          <div className="scroll-container flex">
            {[0, 1].map((setIndex) => 
              [
                '/lovable-uploads/scroll-1.jpg',
                '/lovable-uploads/scroll-2.jpg',
                '/lovable-uploads/scroll-3.jpg',
                '/lovable-uploads/scroll-4.jpg',
                '/lovable-uploads/scroll-5.jpg',
                '/lovable-uploads/scroll-6.jpg',
                '/lovable-uploads/scroll-7.jpg',
                '/lovable-uploads/scroll-8.jpg',
                '/lovable-uploads/scroll-9.jpg',
                '/lovable-uploads/scroll-10.jpg',
                '/lovable-uploads/scroll-11.jpg',
                '/lovable-uploads/scroll-12.jpg',
                '/lovable-uploads/scroll-13.jpg',
                '/lovable-uploads/scroll-14.jpg',
                '/lovable-uploads/scroll-15.jpg',
                '/lovable-uploads/scroll-16.jpg',
                '/lovable-uploads/scroll-17.jpg',
                '/lovable-uploads/scroll-18.jpg',
                '/lovable-uploads/scroll-19.jpg',
                '/lovable-uploads/scroll-20.jpg',
                '/lovable-uploads/scroll-21.jpg',
                '/lovable-uploads/scroll-22.jpg',
                '/lovable-uploads/scroll-23.jpg',
                '/lovable-uploads/scroll-24.jpg'
              ].map((img, idx) => (
                <div 
                  key={`${setIndex}-${idx}`} 
                  className="flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    width: '320px',
                    height: '428px',
                    marginLeft: idx === 0 ? '0' : '-100px'
                  }}
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${idx + 1}`} 
                    width="320" 
                    height="576" 
                    loading="lazy" 
                    decoding="async" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation Buttons - Below Scroll */}
        <div className="flex items-center justify-center gap-8 mt-4">
          <button onClick={scrollPrev} className="w-16 h-16" aria-label="Previous slide">
            <img src={arrowCircle} alt="Previous" className="w-full h-full rotate-180" />
          </button>

          <button onClick={scrollNext} className="w-16 h-16" aria-label="Next slide">
            <img src={arrowCircle} alt="Next" className="w-full h-full" />
          </button>
        </div>
      </div>
    </div>;
};