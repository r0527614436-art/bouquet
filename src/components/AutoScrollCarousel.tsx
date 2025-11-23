import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const scrollImages = [
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
  '/lovable-uploads/scroll-24.jpg',
  '/lovable-uploads/scroll-25.jpg',
  '/lovable-uploads/scroll-26.jpg',
  '/lovable-uploads/scroll-27.jpg',
  '/lovable-uploads/scroll-28.jpg',
  '/lovable-uploads/scroll-29.jpg',
  '/lovable-uploads/scroll-30.jpg',
];

export const AutoScrollCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % scrollImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const getVisibleImages = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + scrollImages.length) % scrollImages.length;
      visible.push({ index, position: i });
    }
    return visible;
  };

  return (
    <div className="relative flex items-center justify-center h-80 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {getVisibleImages().map(({ index, position }) => {
          const isCentered = position === 0;
          const scale = isCentered ? 1.2 : 0.85;
          const opacity = isCentered ? 1 : 0.5;
          const zIndex = isCentered ? 20 : 10 - Math.abs(position);
          
          return (
            <motion.div
              key={`${index}-${currentIndex}`}
              initial={{ scale: 0.85, opacity: 0.5, x: position * 280 }}
              animate={{ 
                scale,
                opacity,
                x: position * 280,
                zIndex
              }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="absolute rounded-2xl overflow-hidden shadow-2xl"
              style={{
                width: '250px',
                height: '320px',
              }}
            >
              <img 
                src={scrollImages[index]} 
                alt={`Gallery ${index + 1}`} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
