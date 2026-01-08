import React, { useState } from 'react';
import { X } from 'lucide-react';
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
  const [isZoomed, setIsZoomed] = useState(false);

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
      setIsZoomed(false);
      onClose();
    }
  };

  const handleDoubleClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleClose = () => {
    setIsZoomed(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[98vw] max-w-[98vw] md:max-w-fit md:w-auto p-0 overflow-hidden bg-[#F5F0E8] border-[3px] border-[#314020] rounded-2xl shadow-none [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>תצוגת תמונה: {currentItem.title}</DialogTitle>
          <DialogDescription>תצוגה מורחבת של התמונה עם אפשרות ניווט</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative">
          {/* Custom close button - Green without border */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute -top-10 -right-2 z-20 text-[#3d5a3d] hover:text-[#2d4a2d] hover:bg-transparent p-1 transition-colors"
          >
            <X className="h-7 w-7" />
          </Button>

          {/* Model number - Top left overlay on image */}
          {currentItem.title && !isZoomed && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5">
              <p className="text-white text-base font-synopsis font-light drop-shadow-lg">דגם {currentItem.title}</p>
            </div>
          )}

          {/* Main image - with zoom on double click */}
          <div 
            className={`w-full cursor-zoom-in transition-all duration-300 ${isZoomed ? 'overflow-auto max-h-[85vh] max-w-[90vw]' : ''}`}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={currentItem.image_url}
              alt={currentItem.title || 'תמונה'}
              className={`w-full h-auto object-contain rounded-lg transition-transform duration-300 ${
                isZoomed 
                  ? 'scale-150 cursor-zoom-out' 
                  : 'max-h-[85vh] cursor-zoom-in'
              }`}
              style={isZoomed ? { transformOrigin: 'center center' } : {}}
            />
          </div>

          {/* Counter indicator - Bottom center */}
          {!isZoomed && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1">
              <p className="text-white text-xs font-synopsis font-light drop-shadow-lg">
                {currentIndex + 1} מתוך {items.length}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};