import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import arrowSimple from '@/assets/arrow-simple.png';

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
  allowCart?: boolean;
  onOrderClick?: (item: CatalogItem) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  currentItem,
  items,
  onPrevious,
  onNext,
  allowCart = false,
  onOrderClick,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastDistance = useRef<number | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

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
      resetZoom();
      onClose();
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    lastDistance.current = null;
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  };

  const handleClose = () => {
    resetZoom();
    onClose();
  };

  const getDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      lastPosition.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDistance.current !== null) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      const delta = newDistance / lastDistance.current;
      
      setScale(prev => {
        const newScale = prev * delta;
        return Math.min(Math.max(newScale, 1), 4);
      });
      
      lastDistance.current = newDistance;
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      const newX = e.touches[0].clientX - lastPosition.current.x;
      const newY = e.touches[0].clientY - lastPosition.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
    isDragging.current = false;
    
    if (scale <= 1) {
      resetZoom();
    }
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
          {currentItem.title && scale <= 1 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5">
              <p className="text-white text-base font-synopsis font-light drop-shadow-lg">דגם {currentItem.title}</p>
            </div>
          )}

          {/* Main image - with pinch zoom on mobile */}
          <div 
            className={`w-full cursor-zoom-in transition-all duration-300 ${scale > 1 ? 'overflow-hidden' : ''}`}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentItem.image_url}
              alt={currentItem.title || 'תמונה'}
              className={`w-full h-auto object-contain rounded-lg transition-transform duration-150 max-h-[85vh] ${
                scale > 1 ? 'cursor-move' : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
              }}
              draggable={false}
            />
          </div>

          {/* Counter indicator - Bottom center - adjusted position when green bar is shown */}
          {scale <= 1 && (
            <div className={`absolute left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 ${allowCart ? 'bottom-16 md:bottom-4' : 'bottom-4'}`}>
              <p className="text-white text-xs font-synopsis font-light drop-shadow-lg">
                {currentIndex + 1} מתוך {items.length}
              </p>
            </div>
          )}

          {/* Green order bar - always visible on mobile when allowCart is true */}
          {allowCart && scale <= 1 && (
            <div 
              onClick={() => onOrderClick?.(currentItem)}
              className="md:hidden absolute bottom-0 left-0 right-0 bg-[#314020] text-white flex items-center px-4 py-3 cursor-pointer active:bg-[#4a6b4a] z-20"
            >
              {currentItem.price && (
                <>
                  <span className="text-xl font-ploni-aaa font-bold">{currentItem.price} ש״ח</span>
                  <div className="h-6 w-px bg-white/40 mx-3"></div>
                </>
              )}
              <div className="flex items-center gap-3 mr-auto">
                <span className="text-xl font-synopsis font-medium">להזמנה מהירה</span>
                <img src={arrowSimple} alt="" className="h-7 w-7" />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
