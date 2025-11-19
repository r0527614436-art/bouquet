import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import arrowCircle from '@/assets/arrow-circle.png';

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
  
  const handleOrder = () => {
    const message = `שלום, אני מעוניין/ת להזמין את הפריט: ${currentItem.title}${currentItem.price ? ` במחיר ₪${currentItem.price}` : ''}`;
    window.open(`https://wa.me/972527614436?text=${encodeURIComponent(message)}`, '_blank');
  };

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
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden bg-gradient-to-br from-background/95 via-primary/5 to-secondary/20 backdrop-blur-sm border-primary/20" onKeyDown={handleKeyDown}>
        <VisuallyHidden>
          <DialogTitle>תצוגת תמונה: {currentItem.title}</DialogTitle>
          <DialogDescription>תצוגה מורחבת של התמונה עם אפשרות ניווט</DialogDescription>
        </VisuallyHidden>
        <div className="relative w-full h-full bg-gradient-to-b from-background/90 to-background/95">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-primary-foreground bg-primary/80 hover:bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/30 transition-all duration-300 hover:scale-105"
          >
            <X className="h-5 w-5" />
          </Button>


          {/* Previous button */}
          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-primary-foreground bg-primary/80 hover:bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/30 transition-all duration-300 hover:scale-105"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-primary-foreground bg-primary/80 hover:bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/30 transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Main image */}
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="relative max-w-full max-h-full">
              <img
                src={currentItem.image_url}
                alt={currentItem.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border-2 border-primary/20"
                style={{ maxHeight: 'calc(100vh - 12rem)' }}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Item info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent backdrop-blur-sm border-t border-primary/20 p-6">
            <div className="text-foreground">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{currentItem.title}</h3>
                  {currentItem.price && (
                    <p className="text-xl font-bold text-accent">₪{currentItem.price}</p>
                  )}
                </div>
                <button
                  onClick={handleOrder}
                  className="bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white px-6 py-3 rounded-full flex items-center gap-2 transition-colors shadow-lg"
                >
                  <span className="font-medium">להזמנה</span>
                  <img src={arrowCircle} alt="arrow" className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground bg-secondary/20 px-3 py-1 rounded-full">
                  {currentIndex + 1} מתוך {items.length}
                </p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};