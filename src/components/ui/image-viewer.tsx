import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogItem {
  id: string;
  title: string;
  image_url: string;
  price: string | null;
  category_id: string;
  created_at: string;
}

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: CatalogItem | null;
  items: CatalogItem[];
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  currentItem,
  items,
  onPrevious,
  onNext,
}) => {
  if (!currentItem || !isOpen) return null;

  const currentIndex = items.findIndex(item => item.id === currentItem.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && !isLast) {
        onNext();
      } else if (e.key === 'ArrowRight' && !isFirst) {
        onPrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFirst, isLast, onNext, onPrevious, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Model number - Top left */}
      <div className="absolute top-6 left-6 z-50 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p className="text-white text-sm font-medium">דגם {currentItem.title}</p>
      </div>

      {/* Previous button */}
      {!isFirst && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Next button */}
      {!isLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* Main image - Full screen */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={currentItem.image_url}
          alt={currentItem.title}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Counter indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
        <p className="text-white text-sm">
          {currentIndex + 1} מתוך {items.length}
        </p>
      </div>
    </div>
  );
};