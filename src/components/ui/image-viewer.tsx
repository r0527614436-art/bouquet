import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden" onKeyDown={handleKeyDown}>
        <div className="relative w-full h-full bg-black">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Previous button */}
          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Main image */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={currentItem.image_url}
              alt={currentItem.title}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 8rem)' }}
            />
          </div>

          {/* Item info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">{currentItem.title}</h3>
              {currentItem.price && (
                <p className="text-lg font-bold text-pink-300">₪{currentItem.price}</p>
              )}
              <p className="text-sm text-gray-300 mt-2">
                {currentIndex + 1} מתוך {items.length}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};