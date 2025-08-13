import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CatalogItem {
  id: string;
  title: string;
  image_url: string;
  price: string | null;
  category_id: string;
}

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: CatalogItem | null;
  items: CatalogItem[];
  onPrevious: () => void;
  onNext: () => void;
}

export const ImageViewer = ({ 
  isOpen, 
  onClose, 
  currentItem, 
  items, 
  onPrevious, 
  onNext 
}: ImageViewerProps) => {
  if (!currentItem) return null;

  const currentIndex = items.findIndex(item => item.id === currentItem.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">{currentItem.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image container */}
          <div className="flex-1 relative flex items-center justify-center bg-gray-50">
            <img
              src={currentItem.image_url}
              alt={currentItem.title}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation buttons */}
            {hasPrevious && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 rounded-full shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {hasNext && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 rounded-full shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-white">
            <div className="flex justify-between items-center">
              <div>
                {currentItem.price && (
                  <p className="text-lg font-bold text-pink-600">₪{currentItem.price}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {currentIndex + 1} מתוך {items.length}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};