import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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
  if (!currentItem) return null;

  const currentIndex = items.findIndex(item => item.id === currentItem.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && !isLast) {
      onNext();
    } else if (e.key === 'ArrowRight' && !isFirst) {
      onPrevious();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full p-0 overflow-hidden bg-white"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>תצוגת תמונה: {currentItem.title}</DialogTitle>
          <DialogDescription>תצוגה מורחבת של התמונה עם אפשרות ניווט</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative">
          {/* Model number - Top left overlay on image */}
          {currentItem.title && (
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <p className="text-white text-sm font-ploni-aaa font-medium">דגם {currentItem.title}</p>
            </div>
          )}

          {/* Previous button */}
          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Next button */}
          {!isLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Main image */}
          <div className="w-full">
            <img
              src={currentItem.image_url}
              alt={currentItem.title || 'תמונה'}
              className="w-full h-auto object-contain max-h-[80vh]"
            />
          </div>

          {/* Counter indicator - Bottom center */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white text-xs font-ploni-aaa">
              {currentIndex + 1} מתוך {items.length}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};